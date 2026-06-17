/**
 * Excel-generatie — getrouwe port van buildExcel() uit
 * prototypes/vidre-klantenorder.html naar de server.
 *
 * De opmaak (kleuren, randen, merges, kolombreedtes, SUM-formule) is
 * goedgekeurd door de klant en wordt 1:1 aangehouden. Alleen de input-route
 * verschilt: hier komt de data uit de POST-payload i.p.v. het DOM.
 */

import * as XLSX from 'xlsx-js-style';
import { CHECKS, fmtDate, type OrderPayload } from './order';

// kleuren / fills
const INK = '232326',
  LABEL = '56565B',
  MUTED = '9A9AA0',
  DEEP = '3F3F44',
  LINE = 'D3D3D7';
const HEADFILL = 'F7F7F8',
  SECFILL = 'EDEDEE',
  TOTFILL = 'FAFAFA';

type Style = Record<string, unknown>;
const FONT = (o?: Style): Style => Object.assign({ name: 'Arial', sz: 9, color: { rgb: INK } }, o || {});
const AL = (o?: Style): Style => Object.assign({ vertical: 'center', wrapText: true, horizontal: 'left' }, o || {});
const bThin = { style: 'thin', color: { rgb: LINE } };
const ALLB = { top: bThin, bottom: bThin, left: bThin, right: bThin };

const ST: Record<string, Style> = {
  title: {
    font: FONT({ bold: true, sz: 14 }),
    alignment: { horizontal: 'center', vertical: 'center' },
    border: { bottom: { style: 'medium', color: { rgb: DEEP } } },
  },
  label: { font: FONT({ bold: true, sz: 8.5, color: { rgb: LABEL } }), alignment: AL(), fill: { fgColor: { rgb: HEADFILL } }, border: ALLB },
  value: { font: FONT(), alignment: AL(), border: ALLB },
  section: { font: FONT({ bold: true, color: { rgb: DEEP } }), alignment: AL(), fill: { fgColor: { rgb: SECFILL } }, border: ALLB },
  th: { font: FONT({ bold: true, sz: 8, color: { rgb: LABEL } }), alignment: AL(), fill: { fgColor: { rgb: HEADFILL } }, border: ALLB },
  thR: { font: FONT({ bold: true, sz: 8, color: { rgb: LABEL } }), alignment: AL({ horizontal: 'right' }), fill: { fgColor: { rgb: HEADFILL } }, border: ALLB },
  cell: { font: FONT(), alignment: AL(), border: ALLB },
  num: { font: FONT(), alignment: AL({ horizontal: 'right' }), border: ALLB },
  totL: { font: FONT({ bold: true }), alignment: AL({ horizontal: 'right' }), fill: { fgColor: { rgb: TOTFILL } }, border: ALLB },
  totN: { font: FONT({ bold: true }), alignment: AL({ horizontal: 'right' }), fill: { fgColor: { rgb: TOTFILL } }, border: ALLB },
  checkOn: { font: FONT({ bold: true }), alignment: AL(), fill: { fgColor: { rgb: TOTFILL } }, border: ALLB },
  checkOff: { font: FONT({ color: { rgb: MUTED } }), alignment: AL(), border: ALLB },
  notes: { font: FONT(), alignment: AL({ vertical: 'top' }), border: ALLB },
};

const EUR = '"€" #,##0.00';

type Merge = { s: { r: number; c: number }; e: { r: number; c: number } };
type Cell = { v: string | number; t: 's' | 'n'; s: Style; z?: string; f?: string };
type Sheet = Record<string, unknown> & { '!merges': Merge[] };

/** Bouw de Klantenorder-werkmap en geef hem als Buffer terug. */
export function buildExcelBuffer(d: OrderPayload): Buffer {
  const ws: Sheet = { '!merges': [] };
  const ref = (r: number, c: number) => XLSX.utils.encode_cell({ r, c });
  const rowsMeta: Array<{ hpt: number }> = [];
  const setH = (r: number, h: number) => {
    rowsMeta[r] = { hpt: h };
  };

  function fill(r1: number, c1: number, r2: number, c2: number, value: string | number | null, style: Style, z?: string, formula?: string) {
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        const tl = r === r1 && c === c1;
        const isNum = tl && (Boolean(formula) || typeof value === 'number');
        const cell: Cell = { v: tl ? (value == null ? '' : value) : '', t: isNum ? 'n' : 's', s: style };
        if (tl && z) cell.z = z;
        if (tl && formula) cell.f = formula;
        ws[ref(r, c)] = cell;
      }
    }
    if (r1 !== r2 || c1 !== c2) ws['!merges'].push({ s: { r: r1, c: c1 }, e: { r: r2, c: c2 } });
  }

  let R = 0;
  fill(R, 0, R, 5, 'VIDRE — KLANTENORDER', ST.title);
  setH(R, 24);
  R++;

  const pair = (l1: string, v1: string, l2: string, v2: string) => {
    fill(R, 0, R, 0, l1, ST.label);
    fill(R, 1, R, 2, v1, ST.value);
    fill(R, 3, R, 3, l2, ST.label);
    fill(R, 4, R, 5, v2, ST.value);
    setH(R, 19);
    R++;
  };
  const full = (l: string, v: string) => {
    fill(R, 0, R, 0, l, ST.label);
    fill(R, 1, R, 5, v, ST.value);
    setH(R, 19);
    R++;
  };
  const section = (t: string) => {
    fill(R, 0, R, 5, t, ST.section);
    setH(R, 20);
    R++;
  };

  pair('Referentie', d.ref, 'Datum aanname', fmtDate(d.datumAanname));
  pair('Naam klant', d.naamKlant, 'Datum offerte', fmtDate(d.datumOfferte));
  pair('Opdrachtgever', d.opdrachtgever, 'Debiteur nr.', d.debiteurNr);
  pair('Contactpersoon', d.contactpersoon, 'Nummer klant', d.nummerKlant);
  full('Werkadres', d.werkadres);
  pair('Postcode + plaats', d.postcodePlaats, 'E-mail', d.email);
  pair('Nummer opdr.', d.nummerOpdr, 'Nummer opzichter', d.nummerOpzichter);
  pair('Aanbetaling', d.aanbetaling, 'Opmerking', d.opmerking);

  R++; // spacer
  section('BETREFT & OMSCHRIJVING');
  fill(R, 0, R, 0, 'Betreft', ST.th);
  fill(R, 1, R, 2, 'Omschrijving', ST.th);
  fill(R, 3, R, 4, 'Prijs', ST.thR);
  fill(R, 5, R, 5, 'BTW', ST.th);
  setH(R, 18);
  R++;
  const itemStart = R + 1; // 1-based voor formule
  if (d.items.length) {
    d.items.forEach((i) => {
      fill(R, 0, R, 0, i.betreft, ST.cell);
      fill(R, 1, R, 2, i.omschrijving, ST.cell);
      fill(R, 3, R, 4, i.prijs ? Number(i.prijs) : '', ST.num, EUR);
      fill(R, 5, R, 5, i.btw, ST.cell);
      setH(R, 18);
      R++;
    });
    const itemEnd = R; // 1-based laatste
    fill(R, 0, R, 2, 'Totaal ingevoerd', ST.totL);
    fill(R, 3, R, 4, '', ST.totN, EUR, `SUM(D${itemStart}:D${itemEnd})`);
    fill(R, 5, R, 5, '', ST.totN);
    setH(R, 18);
    R++;
  } else {
    fill(R, 0, R, 5, 'Geen regels ingevoerd', ST.checkOff);
    setH(R, 18);
    R++;
  }

  R++; // spacer
  section('ADMINISTRATIEVE AFHANDELING');
  const checks = CHECKS.map(([k, label]) => ({ label, on: d.checklist[k] }));
  for (let i = 0; i < checks.length; i += 2) {
    const a = checks[i];
    const b = checks[i + 1];
    fill(R, 0, R, 2, (a.on ? '☑ ' : '☐ ') + a.label, a.on ? ST.checkOn : ST.checkOff);
    if (b) fill(R, 3, R, 5, (b.on ? '☑ ' : '☐ ') + b.label, b.on ? ST.checkOn : ST.checkOff);
    else fill(R, 3, R, 5, '', ST.checkOff);
    setH(R, 18);
    R++;
  }
  const opts = ['laque', 'lamon', 'bemelman', 'kriek'];
  const bestelTxt = opts.map((o) => (d.bestelbon === o ? '☑ ' : '☐ ') + o.charAt(0).toUpperCase() + o.slice(1)).join('    ');
  fill(R, 0, R, 0, 'Bestelbon', ST.label);
  fill(R, 1, R, 5, bestelTxt, ST.value);
  setH(R, 18);
  R++;

  R++; // spacer
  section('LEVERANCIERS & BESTELLINGEN');
  fill(R, 0, R, 0, 'Leverancier', ST.th);
  fill(R, 1, R, 2, 'Artikel / ordernr.', ST.th);
  fill(R, 3, R, 3, 'Besteld', ST.th);
  fill(R, 4, R, 4, 'Binnen', ST.th);
  fill(R, 5, R, 5, 'Opdr. nr', ST.th);
  setH(R, 18);
  R++;
  if (d.suppliers.length) {
    d.suppliers.forEach((s) => {
      fill(R, 0, R, 0, s.leverancier, ST.cell);
      fill(R, 1, R, 2, s.artikel, ST.cell);
      fill(R, 3, R, 3, fmtDate(s.besteld), ST.cell);
      fill(R, 4, R, 4, fmtDate(s.binnen), ST.cell);
      fill(R, 5, R, 5, s.opdrNr, ST.cell);
      setH(R, 18);
      R++;
    });
  } else {
    fill(R, 0, R, 5, 'Geen bestellingen ingevoerd', ST.checkOff);
    setH(R, 18);
    R++;
  }

  R++; // spacer
  section('TEKENING & OPMERKINGEN');
  fill(R, 0, R + 2, 5, d.opmerkingenTekst || '—', ST.notes);
  setH(R, 20);
  setH(R + 1, 20);
  setH(R + 2, 20);
  R += 3;
  if (d.sketch) {
    fill(R, 0, R, 5, '(Schets is opgenomen in de PDF)', ST.checkOff);
    setH(R, 16);
    R++;
  }

  ws['!ref'] = 'A1:' + ref(R, 5);
  ws['!cols'] = [{ wch: 19 }, { wch: 15 }, { wch: 12 }, { wch: 17 }, { wch: 13 }, { wch: 12 }];
  ws['!rows'] = rowsMeta;
  ws['!margins'] = { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Klantenorder');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}

/** Bestandsnaam-basis: {ref}_{naam-klant}, zoals fileBase() in de prototype. */
export function fileBase(d: OrderPayload): string {
  const name = (d.naamKlant || 'klantenorder')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${d.ref}_${name}`;
}
