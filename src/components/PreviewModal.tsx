'use client';

import { useEffect } from 'react';
import type { OrderPayload } from '@/lib/order';
import DocView from './DocView';

interface Props {
  open: boolean;
  payload: OrderPayload | null;
  generating: boolean;
  onClose: () => void;
  onGenerate: () => void;
}

export default function PreviewModal({ open, payload, generating, onClose, onGenerate }: Props) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <div className={`modal${open ? ' open' : ''}`} aria-hidden={!open}>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label="Voorbeeld">
        <div className="modal-head">
          <span className="modal-title">Voorbeeld document</span>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
              Sluiten
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={onGenerate} disabled={generating}>
              {generating ? 'Bezig…' : 'Genereer Excel + PDF'}
            </button>
          </div>
        </div>
        <div className="modal-scroll">{payload && <DocView d={payload} />}</div>
      </div>
    </div>
  );
}
