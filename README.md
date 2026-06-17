# Vidre Klantenorder

Webapp voor monteurs om klantorders in te vullen op tablet/telefoon. Bestanden
worden automatisch in OneDrive opgeslagen.

## Voor de ontwikkelaar (Claude Code)

Start hier: **[CLAUDE.md](./CLAUDE.md)** — alle context, beslissingen, en
fase-voor-fase wat er gebouwd moet worden.

## Quickstart

```bash
npm install
cp .env.example .env.local
# Vul de Azure/OneDrive variabelen in (zie docs/SETUP-ONEDRIVE.md)
npm run dev
```

Open http://localhost:3000

## Documentatie

- [CLAUDE.md](./CLAUDE.md) — instructies voor Claude Code
- [docs/SETUP-ONEDRIVE.md](./docs/SETUP-ONEDRIVE.md) — Azure / OneDrive setup
- [docs/DEPLOY.md](./docs/DEPLOY.md) — deployment naar Vercel
- [prototypes/vidre-klantenorder.html](./prototypes/vidre-klantenorder.html) —
  werkende UI/Excel/PDF prototype, gebruik als referentie
