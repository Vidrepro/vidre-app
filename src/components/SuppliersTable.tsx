'use client';

import type { SupplierRow } from '@/lib/order';
import { IconClose, IconPlus, IconTruck } from './icons';

interface Props {
  suppliers: SupplierRow[];
  onChangeRow: (id: string, patch: Partial<SupplierRow>) => void;
  onAddRow: () => void;
  onRemoveRow: (id: string) => void;
}

export default function SuppliersTable({ suppliers, onChangeRow, onAddRow, onRemoveRow }: Props) {
  return (
    <section className="card" id="sec-suppliers">
      <div className="card-head">
        <span className="card-icon">
          <IconTruck />
        </span>
        <div>
          <h2>Leveranciers &amp; bestellingen</h2>
          <p className="card-sub">Houd bestellingen en binnenkomst bij.</p>
        </div>
      </div>

      <div className="table" id="suppliersTable">
        <div className="thead suppliers-grid">
          <span>Leverancier</span>
          <span>Artikel / ordernr.</span>
          <span>Besteld</span>
          <span>Binnen</span>
          <span>Opdr. nr</span>
          <span />
        </div>
        <div id="suppliersBody">
          {suppliers.map((row) => (
            <div className="trow suppliers-grid" key={row.id}>
              <div className="tcell">
                <input
                  type="text"
                  value={row.leverancier}
                  onChange={(e) => onChangeRow(row.id, { leverancier: e.target.value })}
                />
              </div>
              <div className="tcell">
                <input
                  type="text"
                  value={row.artikel}
                  onChange={(e) => onChangeRow(row.id, { artikel: e.target.value })}
                />
              </div>
              <div className="tcell">
                <input
                  type="date"
                  value={row.besteld}
                  onChange={(e) => onChangeRow(row.id, { besteld: e.target.value })}
                />
              </div>
              <div className="tcell">
                <input
                  type="date"
                  value={row.binnen}
                  onChange={(e) => onChangeRow(row.id, { binnen: e.target.value })}
                />
              </div>
              <div className="tcell">
                <input
                  type="text"
                  value={row.opdrNr}
                  onChange={(e) => onChangeRow(row.id, { opdrNr: e.target.value })}
                />
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
      </div>
    </section>
  );
}
