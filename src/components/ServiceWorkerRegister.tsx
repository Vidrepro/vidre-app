'use client';

import { useEffect } from 'react';

/**
 * Ruimt eventuele eerder geregistreerde service workers en hun caches op.
 *
 * De PWA-cache zorgde voor verouderde, niet-werkende pagina's op iOS (knoppen
 * deden niets, inloggen verviel in een refresh). De app draait altijd online
 * en heeft geen offline-cache nodig, dus we registreren niets meer en maken
 * bestaande registraties actief ongedaan. De kill-switch in /sw.js handelt de
 * apparaten af waar de oude, vastgelopen JavaScript niet meer draait.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .getRegistrations?.()
      .then((regs) => regs.forEach((r) => r.unregister()))
      .catch(() => {});

    if ('caches' in window) {
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .catch(() => {});
    }
  }, []);

  return null;
}
