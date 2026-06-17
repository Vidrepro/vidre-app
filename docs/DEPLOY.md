# Online zetten en op tablet/telefoon installeren

## Deel 1 — De webapp online zetten (Vercel)

### Eenmalig: maak accounts aan

1. **GitHub-account** (gratis): https://github.com — om de code te bewaren
2. **Vercel-account** (gratis): https://vercel.com — om de webapp te hosten
   - Log in met je GitHub-account, dan koppelen ze automatisch

### Code naar GitHub zetten

```bash
# In de projectmap:
git init
git add .
git commit -m "Eerste versie"

# Maak op github.com een nieuwe (privé!) repository genaamd 'vidre-orders'
# Daarna:
git remote add origin https://github.com/JOUW-NAAM/vidre-orders.git
git branch -M main
git push -u origin main
```

### Deployen op Vercel

1. Ga naar https://vercel.com/new
2. Kies "Import Git Repository" en selecteer `vidre-orders`
3. Vercel detecteert Next.js automatisch — klik **Deploy**
4. Wacht ~1 minuut
5. Klik op de tegel die verschijnt → je krijgt een URL als
   `vidre-orders.vercel.app`

### Environment variabelen toevoegen

De webapp werkt nog niet helemaal omdat de OneDrive-koppeling ontbreekt.

1. Open je Vercel project → **Settings** → **Environment Variables**
2. Voeg alle waarden toe uit `docs/SETUP-ONEDRIVE.md` stap 6
3. Klik **Save**
4. Ga naar **Deployments** → klik op de laatste → klik **Redeploy**

### Eigen domein (optioneel)

Als je `orders.vidre.nl` (of welk subdomein dan ook) wilt gebruiken:

1. Vercel project → **Settings** → **Domains**
2. Voeg `orders.vidre.nl` toe
3. Vercel laat zien welke DNS-records je bij je domeinregistrar moet
   instellen (meestal één CNAME-record)
4. Wacht 5-30 minuten tot DNS doorwerkt — je app is dan bereikbaar op
   `orders.vidre.nl`

## Deel 2 — Op tablet/telefoon installeren

De webapp is een **PWA** (Progressive Web App). Dat betekent: je opent
hem in de browser en kan hem dan toevoegen als app-icoon op je
beginscherm. Geen App Store nodig.

### iPad / iPhone

1. Open **Safari** (NIET Chrome — alleen Safari ondersteunt installeren
   op iOS)
2. Ga naar `orders.vidre.nl` (of de Vercel URL)
3. Tik op het **deel-icoon** (vierkant met pijl omhoog) onderaan
4. Scroll naar beneden en tik op **"Zet op beginscherm"**
5. Geef hem een naam ("Vidre Orders") en tik **Voeg toe**

Het Vidre-icoon staat nu op je beginscherm. Open hem — hij opent
fullscreen, zonder browser-balk eromheen, precies als een echte app.

### Android tablet/telefoon

1. Open **Chrome**
2. Ga naar `orders.vidre.nl`
3. Chrome laat onderaan een banner zien: "App installeren" of
   "Toevoegen aan beginscherm"
4. Tik erop
5. Klaar — icoon staat op je beginscherm

### Op iedere monteurs-tablet / telefoon herhalen

Eén keer per apparaat. De app updatet zichzelf automatisch wanneer
jullie een nieuwe versie op Vercel deployen.

## Deel 3 — Een update uitrollen

Wanneer Claude Code wijzigingen maakt:

```bash
git add .
git commit -m "Wat is er veranderd"
git push
```

Vercel deployt automatisch de nieuwe versie binnen ~1 minuut. Bij de
volgende keer dat een monteur de app opent, draait hij de update.

## Wat als Vercel offline is?

Zeer zeldzaam, maar:
- De app op de tablets blijft basaal werken voor wat al ingevuld is
- Verzenden lukt niet — wacht tot Vercel weer up is

Als jullie kritisch afhankelijk worden van de app, overweeg dan een
betaalde Vercel Pro account ($20/maand) — daar krijg je betere SLA en
analytics op.
