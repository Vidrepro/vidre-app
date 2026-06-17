'use client';

import { eur } from '@/lib/order';
import { IconDownload, IconEye } from './icons';

interface Props {
  naamKlant: string;
  itemsCount: number;
  suppliersCount: number;
  checksCount: number;
  total: number;
  orderRef: string;
  ready: boolean;
  generating: boolean;
  onPreview: () => void;
  onGenerate: () => void;
}

export default function SummaryPanel({
  naamKlant,
  itemsCount,
  suppliersCount,
  checksCount,
  total,
  orderRef,
  ready,
  generating,
  onPreview,
  onGenerate,
}: Props) {
  return (
    <aside className="aside">
      <div className="summary">
        <div className="summary-head">
          <span className="summary-eyebrow">Overzicht</span>
          <span className={`chip ${ready ? 'chip-ready' : 'chip-draft'} summary-status`}>
            {ready ? 'Gereed' : 'Concept'}
          </span>
        </div>
        <div className={`summary-client${naamKlant ? '' : ' empty'}`}>
          {naamKlant || 'Nog geen klant ingevuld'}
        </div>
        <div className="summary-rows">
          <div className="summary-row">
            <span>Regels</span>
            <span className="tnum">{itemsCount}</span>
          </div>
          <div className="summary-row">
            <span>Leveranciers</span>
            <span className="tnum">{suppliersCount}</span>
          </div>
          <div className="summary-row">
            <span>Afhandeling</span>
            <span className="tnum">{checksCount} / 8</span>
          </div>
        </div>
        <div className="summary-total">
          <span>Totaal ingevoerd</span>
          <span className="tnum">{eur(total)}</span>
        </div>
        <div className="summary-actions">
          <button type="button" className="btn btn-ghost" onClick={onPreview}>
            <IconEye className="ic" /> Voorbeeld
          </button>
          <button type="button" className="btn btn-primary" onClick={onGenerate} disabled={generating}>
            <IconDownload className="ic" /> {generating ? 'Bezig…' : 'Genereer Excel + PDF'}
          </button>
        </div>
        <p className="summary-foot">Referentie {orderRef || 'VK-…'}</p>
      </div>
    </aside>
  );
}
