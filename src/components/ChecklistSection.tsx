'use client';

import { BESTELBON_OPTIONS, CHECKS, type CheckKey, type Checklist } from '@/lib/order';
import { IconCheckDoc } from './icons';
import Segmented from './Segmented';

interface Props {
  checklist: Checklist;
  onToggle: (key: CheckKey, checked: boolean) => void;
  bestelbon: string;
  onBestelbon: (value: string) => void;
}

export default function ChecklistSection({ checklist, onToggle, bestelbon, onBestelbon }: Props) {
  return (
    <section className="card" id="sec-admin">
      <div className="card-head">
        <span className="card-icon">
          <IconCheckDoc />
        </span>
        <div>
          <h2>Administratieve afhandeling</h2>
          <p className="card-sub">Vink af wat is geregeld.</p>
        </div>
      </div>

      <div className="checks">
        {CHECKS.map(([key, label]) => (
          <label className="check" key={key}>
            <input
              type="checkbox"
              id={`cb_${key}`}
              checked={checklist[key as CheckKey]}
              onChange={(e) => onToggle(key as CheckKey, e.target.checked)}
            />
            <span className="check-box" />
            <span className="check-text">{label}</span>
          </label>
        ))}
      </div>

      <div className="field" style={{ marginTop: 18 }}>
        <label>Bestelbon</label>
        <Segmented group="bestelbon" options={BESTELBON_OPTIONS} value={bestelbon} onChange={onBestelbon} />
      </div>
    </section>
  );
}
