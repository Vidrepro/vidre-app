/**
 * Datamodel + helpers voor de klantenorder.
 * Houdt de structuur identiek aan prototypes/vidre-klantenorder.html (collect()).
 *
 * In de UI hebben rijen een client-side `id` voor stabiele React-keys; bij het
 * bouwen van de payload (buildPayload) worden lege rijen gefilterd en de id's
 * gestript, exact zoals collect() in de prototype.
 */

export type Btw = 'excl' | 'incl';

export interface ItemRow {
  id: string;
  betreft: string;
  omschrijving: string;
  prijs: string;
  btw: Btw;
}

export interface SupplierRow {
  id: string;
  leverancier: string;
  artikel: string;
  besteld: string;
  binnen: string;
  opdrNr: string;
}

/** Checklist-keys + labels, exact als in de prototype (CHECKS). */
export const CHECKS = [
  ['opdrachtbev', 'Opdrachtbevestiging'],
  ['opleverbon', 'Opleverbon'],
  ['gemaild', 'Opdr. + factuur gemaild'],
  ['factuur', 'Factuur'],
  ['cockpit', 'Cockpit'],
  ['agenda', 'Agenda'],
  ['betalingscheck', 'Betalingscheck'],
  ['lijmwerkorder', 'Lijm- en werkorder'],
] as const;

export type CheckKey = (typeof CHECKS)[number][0];

export type Checklist = Record<CheckKey, boolean>;

export const AANBETALING_OPTIONS = [
  { value: '40-40-20', label: '40-40-20' },
  { value: '50-50', label: '50-50' },
  { value: '100', label: '100%' },
  { value: '14 dg', label: '14 dagen' },
] as const;

export const BESTELBON_OPTIONS = [
  { value: 'laque', label: 'Laque' },
  { value: 'lamon', label: 'Lamon' },
  { value: 'bemelman', label: 'Bemelman' },
  { value: 'kriek', label: 'Kriek' },
] as const;

/** Volledige formulier-state in de UI (met id's op rijen). */
export interface OrderState {
  naamKlant: string;
  opdrachtgever: string;
  contactpersoon: string;
  email: string;
  werkadres: string;
  postcodePlaats: string;
  datumAanname: string;
  datumOfferte: string;
  debiteurNr: string;
  nummerKlant: string;
  nummerOpdr: string;
  nummerOpzichter: string;
  aanbetaling: string;
  opmerking: string;
  items: ItemRow[];
  checklist: Checklist;
  bestelbon: string;
  suppliers: SupplierRow[];
  opmerkingenTekst: string;
}

/** Payload zoals naar de server gaat — identiek aan collect() in de prototype. */
export interface OrderPayload {
  ref: string;
  naamKlant: string;
  opdrachtgever: string;
  contactpersoon: string;
  email: string;
  werkadres: string;
  postcodePlaats: string;
  datumAanname: string;
  datumOfferte: string;
  debiteurNr: string;
  nummerKlant: string;
  nummerOpdr: string;
  nummerOpzichter: string;
  aanbetaling: string;
  opmerking: string;
  items: Array<{ betreft: string; omschrijving: string; prijs: string; btw: Btw }>;
  checklist: Checklist;
  bestelbon: string;
  suppliers: Array<{ leverancier: string; artikel: string; besteld: string; binnen: string; opdrNr: string }>;
  opmerkingenTekst: string;
  sketch: string | null;
}

// ── Helpers (1:1 met de prototype) ──────────────────────────────────────────

export const eur = (n: number | string): string =>
  '€ ' + (Number(n) || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const todayISO = (): string => new Date().toISOString().slice(0, 10);

export const fmtDate = (iso: string): string => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
};

/** Genereer een ordernummer in het formaat VK-YYMMDD-XXXX. */
export function genRef(): string {
  const d = new Date();
  const ymd =
    d.getFullYear().toString().slice(2) +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0');
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return 'VK-' + ymd + '-' + rnd;
}

let idCounter = 0;
/** Stabiele, niet-random id voor React-keys (geen hydration-mismatch). */
export const newId = (): string => `r${++idCounter}`;

export const emptyChecklist = (): Checklist =>
  CHECKS.reduce((acc, [k]) => {
    acc[k] = false;
    return acc;
  }, {} as Checklist);

export const newItem = (): ItemRow => ({ id: newId(), betreft: '', omschrijving: '', prijs: '', btw: 'excl' });

export const newSupplier = (): SupplierRow => ({
  id: newId(),
  leverancier: '',
  artikel: '',
  besteld: '',
  binnen: '',
  opdrNr: '',
});

/** Beginstaat: 3 lege regels + 4 lege leveranciersrijen, net als de prototype. */
export function emptyOrder(): OrderState {
  return {
    naamKlant: '',
    opdrachtgever: '',
    contactpersoon: '',
    email: '',
    werkadres: '',
    postcodePlaats: '',
    datumAanname: '',
    datumOfferte: '',
    debiteurNr: '',
    nummerKlant: '',
    nummerOpdr: '',
    nummerOpzichter: '',
    aanbetaling: '',
    opmerking: '',
    items: [newItem(), newItem(), newItem()],
    checklist: emptyChecklist(),
    bestelbon: '',
    suppliers: [newSupplier(), newSupplier(), newSupplier(), newSupplier()],
    opmerkingenTekst: '',
  };
}

/** Som van de ingevoerde prijzen. */
export const itemsTotal = (items: Array<{ prijs: string }>): number =>
  items.reduce((s, i) => s + (parseFloat(i.prijs) || 0), 0);

/** Niet-lege regels (zelfde filter als collect()). */
export const filledItems = (items: ItemRow[]): ItemRow[] =>
  items.filter((x) => x.betreft.trim() || x.omschrijving.trim() || x.prijs.trim());

export const filledSuppliers = (suppliers: SupplierRow[]): SupplierRow[] =>
  suppliers.filter((x) => x.leverancier.trim() || x.artikel.trim() || x.besteld || x.binnen || x.opdrNr.trim());

/**
 * Bouw de payload uit de UI-state — equivalent aan collect() in de prototype.
 * Lege rijen worden gefilterd, id's gestript, en de schets als data-URL meegegeven.
 */
export function buildPayload(state: OrderState, ref: string, sketch: string | null): OrderPayload {
  return {
    ref,
    naamKlant: state.naamKlant.trim(),
    opdrachtgever: state.opdrachtgever.trim(),
    contactpersoon: state.contactpersoon.trim(),
    email: state.email.trim(),
    werkadres: state.werkadres.trim(),
    postcodePlaats: state.postcodePlaats.trim(),
    datumAanname: state.datumAanname,
    datumOfferte: state.datumOfferte,
    debiteurNr: state.debiteurNr.trim(),
    nummerKlant: state.nummerKlant.trim(),
    nummerOpdr: state.nummerOpdr.trim(),
    nummerOpzichter: state.nummerOpzichter.trim(),
    aanbetaling: state.aanbetaling,
    opmerking: state.opmerking.trim(),
    items: filledItems(state.items).map(({ betreft, omschrijving, prijs, btw }) => ({
      betreft: betreft.trim(),
      omschrijving: omschrijving.trim(),
      prijs: prijs.trim(),
      btw,
    })),
    checklist: state.checklist,
    bestelbon: state.bestelbon,
    suppliers: filledSuppliers(state.suppliers).map(({ leverancier, artikel, besteld, binnen, opdrNr }) => ({
      leverancier: leverancier.trim(),
      artikel: artikel.trim(),
      besteld,
      binnen,
      opdrNr: opdrNr.trim(),
    })),
    opmerkingenTekst: state.opmerkingenTekst.trim(),
    sketch,
  };
}
