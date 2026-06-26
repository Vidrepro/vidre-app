/* Vidre Klantenorder — service worker UITGESCHAKELD (kill-switch).

   De vorige service worker cachte de app-shell en kon na een nieuwe deploy
   een verouderde pagina serveren waarvan de JavaScript niet meer laadde
   (knoppen deden niets, het formulier verviel in een gewone refresh).

   Deze versie doet bewust het tegenovergestelde: ze ruimt alle oude caches
   op, deregistreert zichzelf en herlaadt open vensters, zodat apparaten met
   een verouderde cache automatisch weer de actuele app krijgen.

   De app draait altijd online (orders gaan naar OneDrive) en heeft geen
   offline-cache nodig. Er is bewust géén fetch-handler: alle verzoeken gaan
   rechtstreeks naar het netwerk. */

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        // 1. Alle oude caches weggooien.
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));

        // 2. Open vensters verversen zodat ze de actuele app laden.
        const clients = await self.clients.matchAll({ type: 'window' });
        await Promise.all(
          clients.map((client) => {
            try {
              return client.navigate(client.url);
            } catch {
              return undefined;
            }
          })
        );

        // 3. Deze service worker volledig deregistreren.
        await self.registration.unregister();
      } catch {
        /* niets — het netwerk neemt het sowieso over */
      }
    })()
  );
});
