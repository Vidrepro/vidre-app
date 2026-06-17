'use client';

import { useEffect } from 'react';

/**
 * Registreert de service worker — alleen in productie.
 * In dev laten we hem met rust om caching-verrassingen te voorkomen.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* registratie mislukt — app werkt gewoon online verder */
      });
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  return null;
}
