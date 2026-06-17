# Vidre Klantenorder — Webapp

Webapp waarmee Vidre monteurs op tablet/telefoon een klantenorderformulier
invullen. Bij verzenden wordt een opgemaakte Excel en PDF gegenereerd en
automatisch in een OneDrive-map van Vidre opgeslagen, zodat de bestanden
vanzelf op de kantoor-PC verschijnen (via de OneDrive sync-app).

## Werking in één oogopslag

1. Monteur opent de webapp op tablet/telefoon (geïnstalleerd als PWA).
2. Vult het formulier in (klant, regels, leveranciers, schets).
3. Drukt op **Verzenden**.
4. De server bouwt Excel + PDF.
5. De server upload beide bestanden naar OneDrive via Microsoft Graph,
   in een map per jaar/maand (bijv. `/Klantorders/2026/06/`).
6. OneDrive sync op de kantoor-PC haalt ze automatisch op.
7. Monteur ziet "Order verzonden ✓" en kan een nieuwe order beginnen.

## Tech-stack (al gekozen)

- **Next.js 14** (App Router) — frontend + serverless API routes in één
- **TypeScript**
- **xlsx-js-style** voor opgemaakte Excel (al getest, werkt)
- **@react-pdf/renderer** of **pdf-lib** voor de PDF (zie keuze hieronder)
- **@azure/msal-node** voor Microsoft Graph authenticatie
- **next-pwa** voor "install op beginscherm" gedrag
- **Vercel** voor hosting (gratis tier is voldoende)

## Wat al klaar staat in deze repo

- `prototypes/vidre-klantenorder.html` — werkende client-only versie met
  alle UI, validatie, Excel- en PDF-generatie. **Belangrijk: gebruik dit
  als referentie voor de UI en de Excel-opmaak.** Niet kopiëren naar
  Next.js — bouw het netjes om naar React-componenten, maar houd het
  ontwerp en de Excel-opmaak exact gelijk.
- `public/vidre-logo.png` — Vidre logo (transparante PNG, klaar voor gebruik)
- `docs/SETUP-ONEDRIVE.md` — stap-voor-stap hoe je de Azure app-registratie
  doet (dit moet de gebruiker zelf eenmalig doen, jij begeleidt ze erdoorheen)
- `docs/DEPLOY.md` — Vercel deployment instructies
- `package.json` — basis dependencies
- `.env.example` — welke environment variabelen er moeten komen
- `next.config.mjs` — Next.js + PWA config

## Wat jij (Claude Code) moet bouwen

### Fase 1: zet het Next.js project op
1. Run `npm install`
2. Maak de standaard Next.js structuur (`src/app/layout.tsx`, `src/app/page.tsx`)
3. Zet de basis-styling klaar (de huisstijl-kleuren staan in
   `prototypes/vidre-klantenorder.html` onder `:root`)

### Fase 2: bouw de UI om naar React
Neem de UI uit `prototypes/vidre-klantenorder.html` en splits hem in
React-componenten:
- `<OrderForm>` — hoofdformulier
- `<ClientSection>`, `<ItemsTable>`, `<ChecklistSection>`,
  `<SuppliersTable>`, `<SketchPad>`, `<SummaryPanel>`
- `<PreviewModal>` — voorbeeld vóór verzenden

State management: `useState` of `useReducer` is voldoende, geen extra
library nodig. Houd de structuur van het data-object identiek aan de
prototype (`collect()` functie).

### Fase 3: server-route voor Excel/PDF generatie
Maak `src/app/api/orders/route.ts` — POST handler die:
1. Het ingevulde formulier ontvangt als JSON
2. De Excel bouwt met `xlsx-js-style` (logica al uitgewerkt in
   `prototypes/vidre-klantenorder.html`, functie `buildExcel(d)`)
3. De PDF bouwt — twee opties:
   - **`pdf-lib`**: bouw de PDF programmatisch met dezelfde layout
   - **`puppeteer-core` + `@sparticuz/chromium`**: render een HTML template
     headless. Werkt op Vercel maar is zwaarder.
   - Begin met `pdf-lib` voor snelheid.
4. Beide bestanden upload naar OneDrive (zie Fase 4)
5. Antwoord met `{ ok: true, fileName: '...' }`

### Fase 4: OneDrive integratie
Gebruik **application permissions** (geen gebruiker-login per monteur),
zodat de server zelfstandig kan uploaden:
1. Lees `docs/SETUP-ONEDRIVE.md` voor de Azure app-registratie stappen
2. Implementeer in `src/lib/onedrive.ts`:
   - `getAccessToken()` — client credentials flow via MSAL
   - `uploadFile(path, buffer, contentType)` — upload naar Graph API
3. Endpoint format voor upload:
   `PUT https://graph.microsoft.com/v1.0/users/{USER_ID}/drive/root:/Klantorders/{year}/{month}/{filename}:/content`
   - Voor bestanden < 4 MB: directe PUT
   - Voor groter: createUploadSession + chunks (waarschijnlijk niet nodig
     voor onze Excel/PDF, die zijn klein)
4. Lees de environment variabelen uit `.env.local`:
   - `AZURE_TENANT_ID`
   - `AZURE_CLIENT_ID`
   - `AZURE_CLIENT_SECRET`
   - `ONEDRIVE_USER_ID` (de UPN of object-ID van de account waar de
     OneDrive aan hangt)
   - `ONEDRIVE_BASE_PATH` (bijv. `Klantorders`)

### Fase 5: PWA configureren
1. Voeg `next-pwa` toe (of gebruik de `app/manifest.ts` route die Next.js
   ondersteunt)
2. Maak `public/manifest.json` met Vidre branding
3. Voeg iconen toe in `public/icons/` (192x192 en 512x512, genereer ze
   uit `vidre-logo.png` met scherp wit-grijs achtergrond)
4. Test op iOS Safari: "Voeg toe aan beginscherm" → de app moet openen
   in fullscreen zonder browser-chrome

### Fase 6: deployment
Volg `docs/DEPLOY.md`. Korte versie:
1. Push naar GitHub
2. Importeer op Vercel
3. Voeg de env variabelen toe in Vercel dashboard
4. Eerste deploy → URL als `vidre-orders.vercel.app`
5. Optioneel: koppel `orders.vidre.nl` (of welk subdomein dan ook)

## UI-aandachtspunten (niet veranderen!)

- Kleuren staan vast in `:root` CSS-variabelen in de prototype. Gebruik
  exact dezelfde tinten in Tailwind of plain CSS.
- Het Vidre logo komt links bovenaan in de appbalk.
- Het formulier heeft een live overzicht-paneel rechts (desktop) of als
  vaste balk onderaan (tablet/telefoon).
- De Excel-opmaak die nu uit de prototype rolt is goedgekeurd door
  de klant — verander de styling niet, alleen de input-route.

## Belangrijke details

- **Servertijd is in Europa nodig** voor datumformattering. Stel
  `process.env.TZ = 'Europe/Amsterdam'` in serverroutes.
- **Bestandsnaam** moet zijn: `{ref}_{naam-klant}.xlsx` en `.pdf`,
  waarbij `ref` het automatisch gegenereerde ordernummer is (formaat
  `VK-YYMMDD-XXXX`, zie prototype).
- **Conflict-gedrag bij OneDrive upload**: gebruik
  `@microsoft.graph.conflictBehavior=rename` zodat we nooit een bestand
  overschrijven.
- **CORS is geen probleem** want frontend en API draaien op dezelfde
  Vercel-deploy.
- **Schets**: de canvas wordt als data-URL meegestuurd. Geef hem mee aan
  de PDF generator en sla hem niet apart op.

## Eerste taak

Lees dit hele bestand. Lees daarna `prototypes/vidre-klantenorder.html`
om de UI en Excel-logica te begrijpen. Start met Fase 1: zet het project
op met `npm install` en maak een werkende lege Next.js homepage. Dan
gaan we stap voor stap door.

## Hulp nodig?

Vraag de gebruiker:
- Of ze het Azure-portaal kunnen openen voor de app-registratie (Fase 4)
- Wat hun OneDrive-account is (welke gebruiker, persoonlijk of zakelijk
  Microsoft 365)
- Welk subdomein ze willen voor de productie-URL
