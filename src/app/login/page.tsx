/**
 * Inlogpagina — bewust een server-component met een gewoon HTML-formulier.
 *
 * Het formulier POST't rechtstreeks naar /api/auth/login en werkt daardoor
 * ZONDER JavaScript — ook op oude iPads/Safari-versies die `fetch` of moderne
 * syntax niet ondersteunen. De toon/verberg-knop is een progressieve
 * verbetering via een klein, oude-Safari-veilig scriptje.
 */

const ERROR_MESSAGES: Record<string, string> = {
  '1': 'Onjuiste gebruikersnaam of wachtwoord.',
  config: 'Inloggen is nog niet geconfigureerd op de server.',
};

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; from?: string };
}) {
  const fromRaw = typeof searchParams?.from === 'string' ? searchParams.from : '';
  const from = fromRaw.charAt(0) === '/' && fromRaw.indexOf('/login') !== 0 ? fromRaw : '';
  const errorCode = typeof searchParams?.error === 'string' ? searchParams.error : '';
  const errorMessage = errorCode ? ERROR_MESSAGES[errorCode] || 'Inloggen mislukt.' : '';

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

            <form className="login-form" method="post" action="/api/auth/login">
              <input type="hidden" name="from" value={from} />

              <div className="field">
                <label htmlFor="username">Gebruikersnaam</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                  autoFocus
                />
              </div>

              <div className="field">
                <label htmlFor="password">Wachtwoord</label>
                <div className="login-pw">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    id="pwToggle"
                    className="login-pw-toggle"
                    aria-label="Wachtwoord tonen"
                    hidden
                  >
                    Toon
                  </button>
                </div>
              </div>

              {errorMessage && (
                <p className="login-error">
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <line x1="12" y1="8" x2="12" y2="13" />
                    <line x1="12" y1="16.5" x2="12" y2="16.5" />
                  </svg>
                  <span>{errorMessage}</span>
                </p>
              )}

              <button type="submit" className="btn btn-primary login-submit">
                Inloggen
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

      {/* Progressieve verbetering: toon/verberg wachtwoord. Bewust ES5 (var,
          function, geen optional chaining) zodat oude Safari het ook draait. */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function(){var b=document.getElementById('pwToggle'),p=document.getElementById('password');if(!b||!p){return;}b.hidden=false;b.onclick=function(){if(p.type==='password'){p.type='text';b.firstChild.nodeValue='Verberg';b.setAttribute('aria-label','Wachtwoord verbergen');}else{p.type='password';b.firstChild.nodeValue='Toon';b.setAttribute('aria-label','Wachtwoord tonen');}};})();",
        }}
      />
    </div>
  );
}
