'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
      <div className="login-wrap">
        <form className="login-card" onSubmit={onSubmit}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="login-logo" src="/vidre-logo.png" alt="Vidre" />
          <h1 className="login-title">Klantenorder</h1>
          <p className="login-sub">Log in om verder te gaan.</p>

          <div className="field">
            <label htmlFor="username">Gebruikersnaam</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="password">Wachtwoord</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="btn btn-primary login-submit" disabled={busy}>
            {busy ? 'Bezig…' : 'Inloggen'}
          </button>
        </form>
      </div>
    </div>
  );
}
