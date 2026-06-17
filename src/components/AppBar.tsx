'use client';

interface Props {
  orderRef: string;
  pct: number;
  ready: boolean;
}

export default function AppBar({ orderRef, pct, ready }: Props) {
  return (
    <header className="appbar">
      <div className="appbar-inner">
        <div className="appbar-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="appbar-logo" src="/vidre-logo.png" alt="Vidre" />
          <span className="appbar-sep" />
          <div className="appbar-titles">
            <span className="appbar-title">Klantenorder</span>
            <span className="appbar-ref">{orderRef || 'VK-…'}</span>
          </div>
        </div>
        <div className="appbar-meta">
          <div className="progress" title="Ingevuld">
            <svg viewBox="0 0 44 44" className="progress-ring" aria-hidden="true">
              <circle className="progress-track" cx="22" cy="22" r="18" />
              <circle
                className="progress-bar"
                cx="22"
                cy="22"
                r="18"
                style={{ strokeDashoffset: 113 - (113 * pct) / 100 }}
              />
            </svg>
            <span className="progress-pct">{pct}%</span>
          </div>
          <span className={`chip ${ready ? 'chip-ready' : 'chip-draft'}`}>{ready ? 'Gereed' : 'Concept'}</span>
        </div>
      </div>
    </header>
  );
}
