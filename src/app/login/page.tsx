'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setError(json.error || 'Inloggen mislukt.');
        setBusy(false);
        return;
      }
      // Ga terug naar de oorspronkelijk gevraagde pagina, of het formulier.
      const params = new URLSearchParams(window.location.search);
      const from = params.get('from');
      router.replace(from && from.startsWith('/') && !from.startsWith('/login') ? from : '/');
      router.refresh();
    } catch {
      setError('Kon de server niet bereiken.');
      setBusy(false);
    }
  }

  return (
    <div id="vidre-app">
      <div className="login-scene">
        <div className="login-bg" aria-hidden="true">
          <span className="glight glight-1" />
          <span className="glight glight-2" />
        </div>

        <div className="login-wrap">
          <div className="login-card">
          <div className="login-head">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="login-logo" src="/vidre-logo.png" alt="Vidre glastoepassingen" />
            <span className="login-head-rule" aria-hidden="true" />
          </div>

          <div className="login-intro">
            <h1 className="login-title">Klantenorder</h1>
            <p className="login-sub">Log in om door te gaan naar het orderformulier.</p>
          </div>

          <form className="login-form" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="username">Gebruikersnaam</label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="field">
              <label htmlFor="password">Wachtwoord</label>
              <div className="login-pw">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="login-pw-toggle"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Wachtwoord verbergen' : 'Wachtwoord tonen'}
                >
                  {showPw ? 'Verberg' : 'Toon'}
                </button>
              </div>
            </div>

            {error && (
              <p className="login-error">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <line x1="12" y1="8" x2="12" y2="13" />
                  <line x1="12" y1="16.5" x2="12" y2="16.5" />
                </svg>
                <span>{error}</span>
              </p>
            )}

            <button type="submit" className="btn btn-primary login-submit" disabled={busy}>
              {busy ? 'Bezig…' : 'Inloggen'}
            </button>
          </form>

          <div className="login-foot">
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            <span>Beveiligde toegang — Vidre</span>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
