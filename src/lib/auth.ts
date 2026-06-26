/**
 * Eenvoudige sessie-authenticatie met een HMAC-ondertekende cookie.
 *
 * - Gebruikersnaam/wachtwoord staan in env-variabelen (LOGIN_USERNAME,
 *   LOGIN_PASSWORD), niet in de code.
 * - De sessie-cookie is ondertekend met AUTH_SECRET zodat hij niet te
 *   vervalsen is. Verificatie gebeurt met Web Crypto (crypto.subtle), zodat
 *   het ook in de Edge-runtime van de middleware werkt.
 *
 * Bewust licht: één gedeeld account voor de Vidre-monteurs. Geen database.
 */

export const SESSION_COOKIE = 'vidre_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 dagen — weinig herinlog-gedoe op tablets

const encoder = new TextEncoder();

function toB64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64url(str: string): Uint8Array<ArrayBuffer> {
  const norm = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = norm.length % 4 ? '='.repeat(4 - (norm.length % 4)) : '';
  const bin = atob(norm + pad);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

/** Maak een ondertekend sessietoken voor de gegeven gebruiker. */
export async function createSession(username: string, secret: string, maxAgeSec = SESSION_MAX_AGE): Promise<string> {
  const payload = JSON.stringify({ u: username, exp: Date.now() + maxAgeSec * 1000 });
  const payloadB64 = toB64url(encoder.encode(payload));
  const key = await importKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadB64));
  return `${payloadB64}.${toB64url(sig)}`;
}

/** Controleer een sessietoken; geeft de gebruiker terug of null als ongeldig/verlopen. */
export async function verifySession(token: string, secret: string): Promise<{ u: string } | null> {
  const dot = token.indexOf('.');
  if (dot < 1) return null;
  const payloadB64 = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);
  try {
    const key = await importKey(secret);
    const valid = await crypto.subtle.verify('HMAC', key, fromB64url(sigB64), encoder.encode(payloadB64));
    if (!valid) return null;
    const data = JSON.parse(new TextDecoder().decode(fromB64url(payloadB64)));
    if (typeof data.exp !== 'number' || data.exp < Date.now()) return null;
    return { u: String(data.u) };
  } catch {
    return null;
  }
}
