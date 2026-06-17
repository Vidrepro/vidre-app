'use client';

import { eur } from '@/lib/order';

interface Props {
  total: number;
  generating: boolean;
  onPreview: () => void;
  onGenerate: () => void;
}

export default function MobileBar({ total, generating, onPreview, onGenerate }: Props) {
  return (
    <div className="mobilebar">
      <div className="mobilebar-total">
        <span>Totaal</span>
        <strong className="tnum">{eur(total)}</strong>
      </div>
      <button type="button" className="btn btn-ghost btn-sm" onClick={onPreview}>
        Voorbeeld
      </button>
      <button type="button" className="btn btn-primary btn-sm" onClick={onGenerate} disabled={generating}>
        {generating ? 'Bezig…' : 'Genereer'}
      </button>
    </div>
  );
}
