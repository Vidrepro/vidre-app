import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createSession, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/auth';

export const runtime = 'nodejs';

/** Vergelijking in constante tijd, om timing-aanvallen te voorkomen. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/** Alleen interne paden toestaan als redirect-doel (geen open redirect). */
function safeFrom(from: string): string {
  return from && from.charAt(0) === '/' && from.indexOf('/login') !== 0 ? from : '/';
}

/** Cookie-opties — bewust eenvoudig, zodat ook oude Safari/iOS ze accepteert. */
function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export async function POST(req: NextRequest) {
  const expectedUser = process.env.LOGIN_USERNAME;
  const expectedPass = process.env.LOGIN_PASSWORD;
  const secret = process.env.AUTH_SECRET;

  // Bepaal of dit een gewone HTML-formulier-POST is (oude browsers, geen JS)
  // of een JSON-aanvraag (moderne fetch). Het formulier krijgt redirects,
  // de JSON-variant krijgt JSON terug.
  const contentType = req.headers.get('content-type') || '';
  const isJson = contentType.indexOf('application/json') !== -1;

  let username = '';
  let password = '';
  let from = '/';

  if (isJson) {
    try {
      const body = await req.json();
      username = typeof body.username === 'string' ? body.username : '';
      password = typeof body.password === 'string' ? body.password : '';
    } catch {
      return NextResponse.json({ ok: false, error: 'Ongeldige aanvraag.' }, { status: 400 });
    }
  } else {
    const form = await req.formData();
    username = String(form.get('username') ?? '');
    password = String(form.get('password') ?? '');
    from = safeFrom(String(form.get('from') ?? '/'));
  }

  // Helper voor de formulier-variant: terug naar /login met een foutcode.
  const formError = (code: string) => {
    const url = new URL('/login', req.url);
    url.searchParams.set('error', code);
    if (from !== '/') url.searchParams.set('from', from);
    return NextResponse.redirect(url, 303);
  };

  if (!expectedUser || !expectedPass || !secret) {
    return isJson
      ? NextResponse.json({ ok: false, error: 'Inloggen is nog niet geconfigureerd op de server.' }, { status: 500 })
      : formError('config');
  }

  // Toleranter voor het gedeelde monteurs-account: gebruikersnaam
  // hoofdletter-ongevoelig en omringende spaties eraf. Wachtwoord alleen trimmen.
  const normUser = username.trim().toLowerCase();
  const normPass = password.trim();
  const normExpectedUser = expectedUser.trim().toLowerCase();
  const normExpectedPass = expectedPass.trim();

  if (!safeEqual(normUser, normExpectedUser) || !safeEqual(normPass, normExpectedPass)) {
    return isJson
      ? NextResponse.json({ ok: false, error: 'Onjuiste gebruikersnaam of wachtwoord.' }, { status: 401 })
      : formError('1');
  }

  const token = await createSession(normUser, secret);

  if (isJson) {
    const res = NextResponse.json({ ok: true });
    setSessionCookie(res, token);
    return res;
  }

  // Formulier: 303 -> browser doet een GET naar de doelpagina (correct na POST).
  const res = NextResponse.redirect(new URL(from, req.url), 303);
  setSessionCookie(res, token);
  return res;
}
