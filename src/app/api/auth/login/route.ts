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

export async function POST(req: NextRequest) {
  const expectedUser = process.env.LOGIN_USERNAME;
  const expectedPass = process.env.LOGIN_PASSWORD;
  const secret = process.env.AUTH_SECRET;

  if (!expectedUser || !expectedPass || !secret) {
    return NextResponse.json(
      { ok: false, error: 'Inloggen is nog niet geconfigureerd op de server.' },
      { status: 500 }
    );
  }

  let username = '';
  let password = '';
  try {
    const body = await req.json();
    username = typeof body.username === 'string' ? body.username : '';
    password = typeof body.password === 'string' ? body.password : '';
  } catch {
    return NextResponse.json({ ok: false, error: 'Ongeldige aanvraag.' }, { status: 400 });
  }

  // Toleranter voor het gedeelde monteurs-account: gebruikersnaam
  // hoofdletter-ongevoelig en omringende spaties (bijv. van autofill of
  // mobiele toetsenborden) eraf. Wachtwoord alleen trimmen, niet lowercasen.
  const normUser = username.trim().toLowerCase();
  const normPass = password.trim();
  const normExpectedUser = expectedUser.trim().toLowerCase();
  const normExpectedPass = expectedPass.trim();

  if (!safeEqual(normUser, normExpectedUser) || !safeEqual(normPass, normExpectedPass)) {
    return NextResponse.json({ ok: false, error: 'Onjuiste gebruikersnaam of wachtwoord.' }, { status: 401 });
  }

  const token = await createSession(normUser, secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
