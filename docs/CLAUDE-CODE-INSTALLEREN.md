# Claude Code installeren op je laptop

Korte uitleg voor wie nog nooit een terminal heeft gebruikt.

## Wat is Claude Code?

Een programma dat in een tekst-venster op je laptop draait. Je typt
gewone Nederlandse zinnen ("lees CLAUDE.md en bouw verder") en Claude
schrijft de code voor je, maakt bestanden aan, en deployt de app.

Het verschil met deze chat (claude.ai): Claude Code kan **echt op je
laptop bestanden lezen en schrijven** en commando's uitvoeren. Daarom
is het ideaal voor een project als dit.

## Wat heb je nodig

- Een Claude Pro abonnement ($20/maand) — als je dat nog niet hebt,
  zie https://claude.ai/upgrade. Het abonnement dat je nu gebruikt
  voor deze chat is voldoende.
- 10 minuten

## Installatie

### Op een Mac

1. Open **Terminal** (Cmd+spatie, typ "Terminal", enter)
2. Plak deze regel en druk enter:
   ```
   curl -fsSL https://claude.ai/install.sh | bash
   ```
3. Sluit Terminal en open hem opnieuw
4. Typ `claude` en druk enter — er opent een browser om in te loggen
5. Log in met je Claude account → klaar

### Op Windows

1. Klik Start, typ **PowerShell**, open het
2. Plak deze regel en druk enter:
   ```
   irm https://claude.ai/install.ps1 | iex
   ```
3. Sluit PowerShell en open opnieuw
4. Typ `claude` en druk enter → log in via browser → klaar

Mocht er iets niet lukken: de officiële installatiehandleiding staat op
https://docs.claude.com/en/docs/claude-code — er is ook een
desktop-versie als je de terminal liever vermijdt.

## Hoe je dit project start

1. Pak de zip die ik je geef uit. Je krijgt een map `vidre-app`.
2. Open Terminal/PowerShell
3. Navigeer naar de map:
   ```
   cd ~/Downloads/vidre-app
   ```
   (of waar je hem hebt neergezet)
4. Start Claude Code:
   ```
   claude
   ```
5. Eerste opdracht aan Claude Code (gewoon typen):

   ```
   Lees CLAUDE.md en begin met Fase 1. Stel me vragen als je iets nodig hebt.
   ```

Vanaf hier neemt Claude Code het over. Hij zal:
- het project opzetten
- je begeleiden door de Azure-setup (volg samen met hem `docs/SETUP-ONEDRIVE.md`)
- de app testen op je laptop
- helpen met deployen naar Vercel

## Tips voor het werken met Claude Code

- **Lees mee.** Hij toont steeds wat hij gaat doen voor hij iets verandert.
  Je hoeft niet alles te begrijpen, maar als hij iets riskants vraagt
  (bestanden verwijderen, geheimen tonen), denk dan even na.
- **Stel vragen in normale taal.** "Werkt dit ook offline?" of "Maak de
  knoppen wat groter" gaat prima.
- **Eén taak per keer.** Hoe groter de vraag, hoe groter de kans dat hij
  iets mist. Beter "voeg de OneDrive upload toe" dan "maak de hele app af".
- **Test tussendoor.** Vraag hem geregeld `npm run dev` te starten zodat
  je het in je browser ziet werken.
