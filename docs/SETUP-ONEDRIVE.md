# OneDrive koppelen aan de webapp

Eenmalige setup. Dit moet je via portal.azure.com doen, samen met de
eigenaar van het Vidre Microsoft 365 account. Reken op ~20 minuten.

## Wat je krijgt

Aan het eind heb je drie geheime waarden die in de webapp moeten:
- **AZURE_TENANT_ID** — identificatie van jullie organisatie
- **AZURE_CLIENT_ID** — identificatie van onze app
- **AZURE_CLIENT_SECRET** — wachtwoord van onze app

En het OneDrive-account waar de bestanden in komen.

## Stap 1 — Open de Azure portal

1. Ga naar https://portal.azure.com
2. Log in met het Microsoft 365 account van Vidre
   (degene die ook toegang heeft tot OneDrive)
3. Zoek bovenin op **"Microsoft Entra ID"** (vroeger "Azure Active Directory")
   en open het

## Stap 2 — Registreer de app

1. Klik in het linkermenu op **App registraties** (App registrations)
2. Klik bovenaan op **+ Nieuwe registratie** (New registration)
3. Vul in:
   - **Naam**: `Vidre Klantenorder`
   - **Ondersteunde accounttypen**: "Alleen accounts in deze organisatiemap"
   - **Omleidings-URI**: laat leeg
4. Klik **Registreren**

Je komt op de overzichtspagina van de app. Noteer:
- **Toepassings-id (client)** → dit is je **AZURE_CLIENT_ID**
- **Map-id (tenant)** → dit is je **AZURE_TENANT_ID**

## Stap 3 — Maak een wachtwoord voor de app

1. Klik in het linkermenu op **Certificaten en geheimen** (Certificates & secrets)
2. Klik op **+ Nieuw clientgeheim** (New client secret)
3. Beschrijving: `Webapp toegang`
4. Verloopt: **24 maanden** (langer kan, maar moet je dan wel onthouden te vernieuwen)
5. Klik **Toevoegen**
6. ⚠️ **Kopieer direct de waarde** uit de "Waarde" kolom — dit is je
   **AZURE_CLIENT_SECRET**. Hij wordt maar één keer getoond. Als je hem
   kwijtraakt, maak je gewoon een nieuwe.

## Stap 4 — Geef de app toegang tot OneDrive

1. Klik in het linkermenu op **API-machtigingen** (API permissions)
2. Klik op **+ Een machtiging toevoegen** (Add a permission)
3. Kies **Microsoft Graph**
4. Kies **Toepassingsmachtigingen** (Application permissions) — NIET
   "Gedelegeerde machtigingen"!
5. Zoek en vink aan:
   - `Files.ReadWrite.All`
   - `User.Read.All` (nodig om de juiste user-drive te vinden)
6. Klik **Machtigingen toevoegen**
7. Klik daarna bovenaan op **Beheerderstoestemming verlenen voor [Vidre]**
   en bevestig met **Ja**
   (Er moeten nu groene vinkjes verschijnen in de "Status" kolom)

## Stap 5 — Welk OneDrive-account?

De webapp upload naar de OneDrive van één specifiek account. Aanbeveling:
maak hier een apart account voor, bijvoorbeeld `klantorders@vidre.nl`,
zodat de bestanden niet vermengd raken met persoonlijke OneDrive-inhoud.

Noteer het e-mailadres van dit account — dat is je **ONEDRIVE_USER_ID**.

## Stap 6 — Vul in op Vercel

Wanneer de app gedeployed is op Vercel:

1. Ga naar je Vercel project → **Settings** → **Environment Variables**
2. Voeg toe:

   | Naam | Waarde |
   |---|---|
   | `AZURE_TENANT_ID` | (uit stap 2) |
   | `AZURE_CLIENT_ID` | (uit stap 2) |
   | `AZURE_CLIENT_SECRET` | (uit stap 3) |
   | `ONEDRIVE_USER_ID` | (uit stap 5, bijv. `klantorders@vidre.nl`) |
   | `ONEDRIVE_BASE_PATH` | `Klantorders` |

3. Klik **Save**
4. Redeploy de app

## Stap 7 — OneDrive sync op de kantoor-PC

Op de Windows kantoor-PC:

1. Installeer (als dat nog niet is gedaan) **OneDrive** vanaf
   https://www.microsoft.com/onedrive
2. Log in met hetzelfde account als bij stap 5
3. Open in Verkenner de OneDrive-map (meestal `C:\Users\[naam]\OneDrive`)
4. Je ziet daar straks automatisch de map `Klantorders/2026/06/` enzovoort
   verschijnen, met de bestanden erin

Dat is het. Iedere keer dat een monteur een order verzendt, verschijnt
het Excel- en PDF-bestand binnen seconden in deze map.

## Problemen oplossen

**"De webapp zegt 401 / Unauthorized"**
→ Check of stap 4 helemaal afgemaakt is, inclusief de
"Beheerderstoestemming verlenen" knop. Zonder dat werkt de upload niet.

**"Het clientgeheim is verlopen"**
→ Maak in stap 3 een nieuw geheim en werk het bij in Vercel.

**"Bestanden komen niet door op de kantoor-PC"**
→ Check op de Vercel deployment of de upload slaagt (zie logs). Als die
goed gaat, ligt het aan de OneDrive sync — herstart de OneDrive-app.
