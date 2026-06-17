'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  buildPayload,
  emptyOrder,
  filledItems,
  filledSuppliers,
  genRef,
  itemsTotal,
  newItem,
  newSupplier,
  todayISO,
  type CheckKey,
  type ItemRow,
  type OrderPayload,
  type OrderState,
  type SupplierRow,
} from '@/lib/order';
import AppBar from './AppBar';
import ClientSection from './ClientSection';
import ItemsTable from './ItemsTable';
import ChecklistSection from './ChecklistSection';
import SuppliersTable from './SuppliersTable';
import SketchPad, { type SketchHandle } from './SketchPad';
import SummaryPanel from './SummaryPanel';
import MobileBar from './MobileBar';
import PreviewModal from './PreviewModal';
import Toast, { type ToastState } from './Toast';
import { IconWarn } from './icons';

const KEY_FIELDS: Array<keyof OrderState> = [
  'naamKlant',
  'opdrachtgever',
  'contactpersoon',
  'email',
  'werkadres',
  'postcodePlaats',
];

export default function OrderForm() {
  const [state, setState] = useState<OrderState>(emptyOrder);
  const [orderRef, setOrderRef] = useState('');
  const [invalid, setInvalid] = useState<{ naamKlant?: boolean; werkadres?: boolean }>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPayload, setPreviewPayload] = useState<OrderPayload | null>(null);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<ToastState>({ message: '', show: false });

  const sketchRef = useRef<SketchHandle>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  // ref + datum aanname pas na mount → geen hydration-mismatch
  useEffect(() => {
    setOrderRef(genRef());
    setState((s) => ({ ...s, datumAanname: todayISO() }));
  }, []);

  function showToast(message: string, kind?: 'ok' | 'err') {
    setToast({ message, kind, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 3200);
  }

  // ── State-updates ──────────────────────────────────────────────────────
  const setField = (key: keyof OrderState, value: string) => {
    setState((s) => ({ ...s, [key]: value }));
    if (key === 'naamKlant' || key === 'werkadres') setInvalid((iv) => ({ ...iv, [key]: false }));
  };

  const toggleCheck = (key: CheckKey, checked: boolean) =>
    setState((s) => ({ ...s, checklist: { ...s.checklist, [key]: checked } }));

  const changeItem = (id: string, patch: Partial<ItemRow>) =>
    setState((s) => ({ ...s, items: s.items.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
  const addItem = () => setState((s) => ({ ...s, items: [...s.items, newItem()] }));
  const removeItem = (id: string) => setState((s) => ({ ...s, items: s.items.filter((r) => r.id !== id) }));

  const changeSupplier = (id: string, patch: Partial<SupplierRow>) =>
    setState((s) => ({ ...s, suppliers: s.suppliers.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
  const addSupplier = () => setState((s) => ({ ...s, suppliers: [...s.suppliers, newSupplier()] }));
  const removeSupplier = (id: string) =>
    setState((s) => ({ ...s, suppliers: s.suppliers.filter((r) => r.id !== id) }));

  // ── Afgeleide waarden (sync) ───────────────────────────────────────────
  const items = useMemo(() => filledItems(state.items), [state.items]);
  const suppliers = useMemo(() => filledSuppliers(state.suppliers), [state.suppliers]);
  const total = useMemo(() => itemsTotal(state.items), [state.items]);
  const checksCount = useMemo(() => Object.values(state.checklist).filter(Boolean).length, [state.checklist]);
  const ready = Boolean(state.naamKlant.trim() && state.werkadres.trim());

  const pct = useMemo(() => {
    let filled = 0;
    KEY_FIELDS.forEach((f) => {
      if (String(state[f] ?? '').trim()) filled++;
    });
    if (items.length) filled++;
    return Math.round((filled / (KEY_FIELDS.length + 1)) * 100);
  }, [state, items.length]);

  // ── Acties ─────────────────────────────────────────────────────────────
  const collect = (): OrderPayload =>
    buildPayload(state, orderRef, sketchRef.current?.toDataURL() ?? null);

  const openPreview = () => {
    setPreviewPayload(collect());
    setPreviewOpen(true);
  };

  const generate = async () => {
    const missing = { naamKlant: !state.naamKlant.trim(), werkadres: !state.werkadres.trim() };
    if (missing.naamKlant || missing.werkadres) {
      setInvalid(missing);
      showToast('Vul minimaal naam klant en werkadres in.', 'err');
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collect()),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || `Server gaf status ${res.status}`);
      setPreviewOpen(false);
      showToast('Order verzonden ✓', 'ok');
    } catch (err) {
      showToast(`Verzenden mislukt: ${err instanceof Error ? err.message : 'onbekende fout'}`, 'err');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div id="vidre-app">
      <AppBar orderRef={orderRef} pct={pct} ready={ready} />

      <div className="layout">
        <main className="form-column">
          <p className="notice">
            <IconWarn className="ic" />
            <span>
              Werkende preview. In de definitieve app worden Excel en PDF na verzenden automatisch opgeslagen in
              OneDrive.
            </span>
          </p>

          <ClientSection
            state={state}
            onChange={setField}
            onAanbetaling={(v) => setField('aanbetaling', v)}
            invalid={invalid}
          />
          <ItemsTable items={state.items} onChangeRow={changeItem} onAddRow={addItem} onRemoveRow={removeItem} />
          <ChecklistSection
            checklist={state.checklist}
            onToggle={toggleCheck}
            bestelbon={state.bestelbon}
            onBestelbon={(v) => setField('bestelbon', v)}
          />
          <SuppliersTable
            suppliers={state.suppliers}
            onChangeRow={changeSupplier}
            onAddRow={addSupplier}
            onRemoveRow={removeSupplier}
          />
          <SketchPad
            ref={sketchRef}
            opmerkingenTekst={state.opmerkingenTekst}
            onOpmerkingen={(v) => setField('opmerkingenTekst', v)}
          />
        </main>

        <SummaryPanel
          naamKlant={state.naamKlant.trim()}
          itemsCount={items.length}
          suppliersCount={suppliers.length}
          checksCount={checksCount}
          total={total}
          orderRef={orderRef}
          ready={ready}
          generating={generating}
          onPreview={openPreview}
          onGenerate={generate}
        />
      </div>

      <MobileBar total={total} generating={generating} onPreview={openPreview} onGenerate={generate} />

      <PreviewModal
        open={previewOpen}
        payload={previewPayload}
        generating={generating}
        onClose={() => setPreviewOpen(false)}
        onGenerate={generate}
      />

      <Toast {...toast} />
    </div>
  );
}
