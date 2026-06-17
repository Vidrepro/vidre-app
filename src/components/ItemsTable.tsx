'use client';

import { eur, itemsTotal, type Btw, type ItemRow } from '@/lib/order';
import { IconClose, IconList, IconPlus } from './icons';

interface Props {
  items: ItemRow[];
  onChangeRow: (id: string, patch: Partial<ItemRow>) => void;
  onAddRow: () => void;
  onRemoveRow: (id: string) => void;
}

export default function ItemsTable({ items, onChangeRow, onAddRow, onRemoveRow }: Props) {
  const total = itemsTotal(items);

  return (
    <section className="card" id="sec-items">
      <div className="card-head">
        <span className="card-icon">
          <IconList />
        </span>
        <div>
          <h2>Betreft &amp; omschrijving</h2>
          <p className="card-sub">Voeg per onderdeel een regel toe.</p>
        </div>
      </div>

      <div className="table" id="itemsTable">
        <div className="thead items-grid">
          <span>Betreft</span>
          <span>Omschrijving</span>
          <span>Prijs</span>
          <span />
        </div>
        <div id="itemsBody">
          {items.map((row) => (
            <div className="trow items-grid" key={row.id}>
              <div className="tcell">
                <input
                  type="text"
                  placeholder="Bijv. beglazing"
                  value={row.betreft}
                  onChange={(e) => onChangeRow(row.id, { betreft: e.target.value })}
                />
              </div>
              <div className="tcell">
                <input
                  type="text"
                  value={row.omschrijving}
                  onChange={(e) => onChangeRow(row.id, { omschrijving: e.target.value })}
                />
              </div>
              <div className="tcell price-cell">
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={row.prijs}
                  onChange={(e) => onChangeRow(row.id, { prijs: e.target.value })}
                />
                <select value={row.btw} onChange={(e) => onChangeRow(row.id, { btw: e.target.value as Btw })}>
                  <option value="excl">excl</option>
                  <option value="incl">incl</option>
                </select>
              </div>
              <div className="tcell">
                <button type="button" className="row-del" aria-label="Verwijderen" onClick={() => onRemoveRow(row.id)}>
                  <IconClose />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="table-foot">
        <button type="button" className="btn btn-soft" onClick={onAddRow}>
          <IconPlus className="ic" /> Regel toevoegen
        </button>
        <div className="foot-total">
          <span className="foot-total-label">Totaal ingevoerd</span>
          <span className="foot-total-value tnum">{eur(total)}</span>
        </div>
      </div>
    </section>
  );
}
