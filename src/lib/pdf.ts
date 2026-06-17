/**
 * PDF-generatie met pdf-lib.
 *
 * De prototype maakte de PDF in de browser (html2canvas + jsPDF). Dat kan niet
 * server-side, dus bouwen we dezelfde inhoud programmatisch op met pdf-lib:
 * header met logo, klantgegevens, regels, afhandeling, leveranciers,
 * opmerkingen en de schets. Layout en kleuren volgen het goedgekeurde
 * document (de .vdoc-opmaak uit de prototype).
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, PDFFont, PDFImage, PDFPage, StandardFonts, rgb } from 'pdf-lib';
import { CHECKS, eur, fmtDate, itemsTotal, type OrderPayload } from './order';

// ── Kleuren (uit de huisstijl) ──────────────────────────────────────────────
const hex = (h: string) =>
  rgb(parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255);
const INK = hex('232326');
const DEEP = hex('3f3f44');
const LABEL = hex('6a6a70');
const MUTED = hex('9a9aa0');
const LINE = hex('e4e4e6');
const HEAD_FILL = hex('f6f6f7');
const TOTAL_FILL = hex('fafafa');
const CHIP_ON_FILL = hex('fafafa');
const WHITE = rgb(1, 1, 1);

// ── Pagina-geometrie (A4 in pt) ─────────────────────────────────────────────
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 40;
const CONTENT_W = PAGE_W - 2 * MARGIN;

interface Ctx {
  pdf: PDFDocument;
  page: PDFPage;
  y: number;
  font: PDFFont;
  bold: PDFFont;
}

function addPage(ctx: Ctx) {
  ctx.page = ctx.pdf.addPage([PAGE_W, PAGE_H]);
  ctx.y = PAGE_H - MARGIN;
}

/** Zorg dat er minstens `need` pt ruimte is; anders nieuwe pagina. */
function ensure(ctx: Ctx, need: number) {
  if (ctx.y - need < MARGIN) addPage(ctx);
}

/** Breek tekst af op `maxW` (pt) bij de opgegeven font/grootte. */
function wrap(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const out: string[] = [];
  const paragraphs = (text || '').split('\n');
  for (const para of paragraphs) {
    const words = para.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      out.push('');
      continue;
    }
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (font.widthOfTextAtSize(test, size) > maxW && line) {
        out.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) out.push(line);
  }
  return out.length ? out : [''];
}

/** Eén regel tekst tekenen, eventueel afgekort met … als hij niet past. */
function clip(text: string, font: PDFFont, size: number, maxW: number): string {
  if (font.widthOfTextAtSize(text, size) <= maxW) return text;
  let t = text;
  while (t.length > 1 && font.widthOfTextAtSize(t + '…', size) > maxW) t = t.slice(0, -1);
  return t + '…';
}

function sectionTitle(ctx: Ctx, title: string) {
  ensure(ctx, 26);
  ctx.y -= 14;
  ctx.page.drawText(title.toUpperCase(), {
    x: MARGIN,
    y: ctx.y,
    size: 9,
    font: ctx.bold,
    color: MUTED,
  });
  ctx.y -= 12;
}

// ── Header met logo + titel ─────────────────────────────────────────────────
async function drawHeader(ctx: Ctx, d: OrderPayload, logo: PDFImage | null) {
  const top = ctx.y;
  if (logo) {
    const h = 30;
    const w = (logo.width / logo.height) * h;
    ctx.page.drawImage(logo, { x: MARGIN, y: top - h, width: w, height: h });
  } else {
    ctx.page.drawText('VIDRE', { x: MARGIN, y: top - 22, size: 20, font: ctx.bold, color: DEEP });
  }

  // titel + meta rechts uitgelijnd
  const title = 'Klantenorder';
  const tSize = 16;
  const tW = ctx.bold.widthOfTextAtSize(title, tSize);
  ctx.page.drawText(title, { x: PAGE_W - MARGIN - tW, y: top - 14, size: tSize, font: ctx.bold, color: INK });

  const meta1 = d.ref;
  const meta2 = `Aanname: ${fmtDate(d.datumAanname) || '—'}   ·   Offerte: ${fmtDate(d.datumOfferte) || '—'}`;
  const m1W = ctx.font.widthOfTextAtSize(meta1, 9);
  const m2W = ctx.font.widthOfTextAtSize(meta2, 9);
  ctx.page.drawText(meta1, { x: PAGE_W - MARGIN - m1W, y: top - 30, size: 9, font: ctx.font, color: LABEL });
  ctx.page.drawText(meta2, { x: PAGE_W - MARGIN - m2W, y: top - 42, size: 9, font: ctx.font, color: LABEL });

  ctx.y = top - 52;
  ctx.page.drawRectangle({ x: MARGIN, y: ctx.y, width: CONTENT_W, height: 1.5, color: DEEP });
  ctx.y -= 6;
}

// ── Klantgegevens (key/value grid, 2 koloms) ────────────────────────────────
type KV = { type: 'pair'; l1: string; v1: string; l2: string; v2: string } | { type: 'full'; l: string; v: string };

function drawKeyValues(ctx: Ctx, rows: KV[]) {
  const colW = CONTENT_W / 2;
  const labelW = 92;
  const pad = 6;
  const size = 9;
  const lineH = 11;
  const valW = colW - labelW - pad * 2;
  const fullValW = CONTENT_W - labelW - pad * 2;

  const cellLines = (label: string, value: string, w: number) => wrap(value || '—', ctx.font, size, w);

  for (const row of rows) {
    let lines: number;
    if (row.type === 'pair') {
      lines = Math.max(cellLines(row.l1, row.v1, valW).length, cellLines(row.l2, row.v2, valW).length);
    } else {
      lines = cellLines(row.l, row.v, fullValW).length;
    }
    const rowH = Math.max(18, lines * lineH + 8);
    ensure(ctx, rowH);
    const yTop = ctx.y;
    const yBot = yTop - rowH;

    const drawCell = (x: number, w: number, label: string, value: string, vw: number) => {
      // label-vak met fill
      ctx.page.drawRectangle({ x, y: yBot, width: labelW, height: rowH, color: HEAD_FILL, borderColor: LINE, borderWidth: 0.5 });
      ctx.page.drawText(clip(label, ctx.bold, 8, labelW - pad * 2), {
        x: x + pad,
        y: yTop - 12,
        size: 8,
        font: ctx.bold,
        color: LABEL,
      });
      // value-vak
      ctx.page.drawRectangle({ x: x + labelW, y: yBot, width: w - labelW, height: rowH, borderColor: LINE, borderWidth: 0.5 });
      const vlines = wrap(value || '—', ctx.font, size, vw);
      vlines.forEach((ln, i) => {
        ctx.page.drawText(ln, { x: x + labelW + pad, y: yTop - 12 - i * lineH, size, font: ctx.font, color: INK });
      });
    };

    if (row.type === 'pair') {
      drawCell(MARGIN, colW, row.l1, row.v1, valW);
      drawCell(MARGIN + colW, colW, row.l2, row.v2, valW);
    } else {
      drawCell(MARGIN, CONTENT_W, row.l, row.v, fullValW);
    }
    ctx.y = yBot;
  }
}

// ── Generieke tabel met dynamische rijhoogte + paginering ───────────────────
interface Col {
  w: number; // fractie van CONTENT_W
  align?: 'left' | 'right';
  header: string;
}

function drawTable(ctx: Ctx, cols: Col[], rows: string[][], opts?: { totalRow?: number }) {
  const widths = cols.map((c) => c.w * CONTENT_W);
  const pad = 6;
  const size = 9;
  const lineH = 11;

  const drawHeaderRow = () => {
    const h = 18;
    ensure(ctx, h + 20);
    const yTop = ctx.y;
    const yBot = yTop - h;
    let x = MARGIN;
    cols.forEach((c, i) => {
      ctx.page.drawRectangle({ x, y: yBot, width: widths[i], height: h, color: HEAD_FILL, borderColor: LINE, borderWidth: 0.5 });
      const t = clip(c.header.toUpperCase(), ctx.bold, 7.5, widths[i] - pad * 2);
      const tw = ctx.bold.widthOfTextAtSize(t, 7.5);
      const tx = c.align === 'right' ? x + widths[i] - pad - tw : x + pad;
      ctx.page.drawText(t, { x: tx, y: yTop - 12, size: 7.5, font: ctx.bold, color: LABEL });
      x += widths[i];
    });
    ctx.y = yBot;
  };

  drawHeaderRow();

  rows.forEach((cells, ri) => {
    const wrapped = cells.map((c, i) => wrap(c, ctx.font, size, widths[i] - pad * 2));
    const lines = Math.max(...wrapped.map((w) => w.length));
    const h = Math.max(18, lines * lineH + 6);
    if (ctx.y - h < MARGIN) {
      addPage(ctx);
      drawHeaderRow();
    }
    const yTop = ctx.y;
    const yBot = yTop - h;
    const isTotal = opts?.totalRow === ri;
    let x = MARGIN;
    cols.forEach((c, i) => {
      ctx.page.drawRectangle({
        x,
        y: yBot,
        width: widths[i],
        height: h,
        color: isTotal ? TOTAL_FILL : WHITE,
        borderColor: LINE,
        borderWidth: 0.5,
      });
      const font = isTotal ? ctx.bold : ctx.font;
      wrapped[i].forEach((ln, li) => {
        const tw = font.widthOfTextAtSize(ln, size);
        const tx = c.align === 'right' ? x + widths[i] - pad - tw : x + pad;
        ctx.page.drawText(ln, { x: tx, y: yTop - 12 - li * lineH, size, font, color: INK });
      });
      x += widths[i];
    });
    ctx.y = yBot;
  });
}

// ── Checklist + bestelbon als checkboxes ────────────────────────────────────
function drawChecks(ctx: Ctx, d: OrderPayload) {
  const colW = CONTENT_W / 2;
  const rowH = 18;
  const box = 9;
  const size = 9;

  const drawCheck = (x: number, w: number, label: string, on: boolean, yTop: number) => {
    const by = yTop - 13;
    ctx.page.drawRectangle({
      x: x + 2,
      y: by,
      width: box,
      height: box,
      color: on ? DEEP : WHITE,
      borderColor: on ? DEEP : LINE,
      borderWidth: 1,
    });
    if (on) {
      // vinkje
      ctx.page.drawText('x', { x: x + 3.5, y: by + 1, size: 8, font: ctx.bold, color: WHITE });
    }
    ctx.page.drawText(clip(label, ctx.font, size, w - box - 10), {
      x: x + box + 8,
      y: by + 1,
      size,
      font: on ? ctx.bold : ctx.font,
      color: on ? INK : MUTED,
    });
  };

  const checks = CHECKS.map(([k, label]) => ({ label, on: d.checklist[k] }));
  for (let i = 0; i < checks.length; i += 2) {
    ensure(ctx, rowH);
    const yTop = ctx.y;
    drawCheck(MARGIN, colW, checks[i].label, checks[i].on, yTop);
    if (checks[i + 1]) drawCheck(MARGIN + colW, colW, checks[i + 1].label, checks[i + 1].on, yTop);
    ctx.y -= rowH;
  }

  // bestelbon
  ensure(ctx, rowH + 4);
  ctx.y -= 6;
  const yTop = ctx.y;
  ctx.page.drawText('BESTELBON', { x: MARGIN, y: yTop - 11, size: 8, font: ctx.bold, color: MUTED });
  let x = MARGIN + 66;
  const opts = ['laque', 'lamon', 'bemelman', 'kriek'];
  for (const o of opts) {
    const on = d.bestelbon === o;
    const label = o.charAt(0).toUpperCase() + o.slice(1);
    const box = 9;
    const by = yTop - 12;
    ctx.page.drawRectangle({
      x,
      y: by,
      width: box,
      height: box,
      color: on ? DEEP : WHITE,
      borderColor: on ? DEEP : LINE,
      borderWidth: 1,
    });
    if (on) ctx.page.drawText('x', { x: x + 1.5, y: by + 1, size: 8, font: ctx.bold, color: WHITE });
    ctx.page.drawText(label, { x: x + box + 5, y: by + 1, size: 9, font: on ? ctx.bold : ctx.font, color: on ? INK : MUTED });
    x += box + 10 + ctx.font.widthOfTextAtSize(label, 9) + 14;
  }
  ctx.y -= rowH;
}

async function loadLogo(pdf: PDFDocument): Promise<PDFImage | null> {
  try {
    const bytes = await fs.readFile(path.join(process.cwd(), 'public', 'vidre-logo.png'));
    return await pdf.embedPng(bytes);
  } catch {
    return null;
  }
}

/** Bouw de Klantenorder-PDF en geef hem als Buffer terug. */
export async function buildPdfBuffer(d: OrderPayload): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ctx: Ctx = { pdf, page: pdf.addPage([PAGE_W, PAGE_H]), y: PAGE_H - MARGIN, font, bold };
  const logo = await loadLogo(pdf);

  await drawHeader(ctx, d, logo);

  // Klant & order
  sectionTitle(ctx, 'Klant & order');
  drawKeyValues(ctx, [
    { type: 'pair', l1: 'Naam klant', v1: d.naamKlant, l2: 'Opdrachtgever', v2: d.opdrachtgever },
    { type: 'pair', l1: 'Contactpersoon', v1: d.contactpersoon, l2: 'E-mail', v2: d.email },
    { type: 'pair', l1: 'Werkadres', v1: d.werkadres, l2: 'Postcode + plaats', v2: d.postcodePlaats },
    { type: 'pair', l1: 'Debiteur nr.', v1: d.debiteurNr, l2: 'Nummer klant', v2: d.nummerKlant },
    { type: 'pair', l1: 'Nummer opdr.', v1: d.nummerOpdr, l2: 'Nummer opzichter', v2: d.nummerOpzichter },
    { type: 'pair', l1: 'Aanbetaling', v1: d.aanbetaling, l2: 'Opmerking', v2: d.opmerking },
  ]);

  // Betreft & omschrijving
  sectionTitle(ctx, 'Betreft & omschrijving');
  const itemCols: Col[] = [
    { w: 0.22, header: 'Betreft' },
    { w: 0.46, header: 'Omschrijving' },
    { w: 0.2, header: 'Prijs', align: 'right' },
    { w: 0.12, header: 'BTW' },
  ];
  if (d.items.length) {
    const total = itemsTotal(d.items);
    const rows = d.items.map((i) => [i.betreft || '—', i.omschrijving || '—', i.prijs ? eur(i.prijs) : '—', i.btw]);
    rows.push(['Totaal ingevoerd', '', eur(total), '']);
    drawTable(ctx, itemCols, rows, { totalRow: rows.length - 1 });
  } else {
    drawTable(ctx, itemCols, [['Geen regels ingevoerd', '', '', '']]);
  }

  // Administratieve afhandeling
  sectionTitle(ctx, 'Administratieve afhandeling');
  drawChecks(ctx, d);

  // Leveranciers & bestellingen
  sectionTitle(ctx, 'Leveranciers & bestellingen');
  const supCols: Col[] = [
    { w: 0.24, header: 'Leverancier' },
    { w: 0.3, header: 'Artikel / ordernr.' },
    { w: 0.16, header: 'Besteld' },
    { w: 0.16, header: 'Binnen' },
    { w: 0.14, header: 'Opdr. nr' },
  ];
  if (d.suppliers.length) {
    drawTable(
      ctx,
      supCols,
      d.suppliers.map((s) => [
        s.leverancier || '—',
        s.artikel || '—',
        fmtDate(s.besteld) || '—',
        fmtDate(s.binnen) || '—',
        s.opdrNr || '—',
      ])
    );
  } else {
    drawTable(ctx, supCols, [['Geen bestellingen ingevoerd', '', '', '', '']]);
  }

  // Tekening & opmerkingen
  sectionTitle(ctx, 'Tekening & opmerkingen');
  const noteLines = wrap(d.opmerkingenTekst || '—', ctx.font, 9, CONTENT_W);
  ensure(ctx, noteLines.length * 12 + 4);
  noteLines.forEach((ln) => {
    ctx.y -= 12;
    ctx.page.drawText(ln, { x: MARGIN, y: ctx.y, size: 9, font: ctx.font, color: INK });
  });

  if (d.sketch) {
    try {
      const png = await pdf.embedPng(d.sketch);
      const w = CONTENT_W;
      const h = (png.height / png.width) * w;
      ctx.y -= 10;
      ensure(ctx, h + 4);
      ctx.y -= h;
      ctx.page.drawRectangle({ x: MARGIN, y: ctx.y, width: w, height: h, borderColor: LINE, borderWidth: 0.5 });
      ctx.page.drawImage(png, { x: MARGIN, y: ctx.y, width: w, height: h });
    } catch {
      /* schets kon niet worden ingesloten — sla over */
    }
  }

  // Voettekst op elke pagina
  const pages = pdf.getPages();
  pages.forEach((p) => {
    p.drawText('Vidre glastoepassingen', { x: MARGIN, y: 24, size: 7.5, font, color: MUTED });
    const rw = font.widthOfTextAtSize(d.ref, 7.5);
    p.drawText(d.ref, { x: PAGE_W - MARGIN - rw, y: 24, size: 7.5, font, color: MUTED });
  });

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}
