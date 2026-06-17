'use client';

import { CHECKS, eur, fmtDate, itemsTotal, type OrderPayload } from '@/lib/order';

const BESTELBON_KEYS = ['laque', 'lamon', 'bemelman', 'kriek'] as const;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="vdoc-cell">
      <b>{label}</b>
      <span>{value || '—'}</span>
    </div>
  );
}

function Chip({ label, on }: { label: string; on: boolean }) {
  return (
    <div className={`vdoc-chip${on ? ' on' : ''}`}>
      <span className="mark" />
      {label}
    </div>
  );
}

/** Voorbeeld-/PDF-document — 1:1 met docHtml() uit de prototype. */
export default function DocView({ d }: { d: OrderPayload }) {
  const total = itemsTotal(d.items);

  return (
    <div className="vdoc">
      <div className="vdoc-top">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/vidre-logo.png" alt="Vidre" />
        <div className="vdoc-topright">
          <div className="vdoc-doctitle">Klantenorder</div>
          <div className="vdoc-meta">
            {d.ref}
            <br />
            Aanname: {fmtDate(d.datumAanname) || '—'} &nbsp;·&nbsp; Offerte: {fmtDate(d.datumOfferte) || '—'}
          </div>
        </div>
      </div>

      <div className="vdoc-sec">
        <div className="vdoc-sec-title">Klant &amp; order</div>
        <div className="vdoc-kv">
          <Cell label="Naam klant" value={d.naamKlant} />
          <Cell label="Opdrachtgever" value={d.opdrachtgever} />
          <Cell label="Contactpersoon" value={d.contactpersoon} />
          <Cell label="E-mail" value={d.email} />
          <Cell label="Werkadres" value={d.werkadres} />
          <Cell label="Postcode + plaats" value={d.postcodePlaats} />
          <Cell label="Debiteur nr." value={d.debiteurNr} />
          <Cell label="Nummer klant" value={d.nummerKlant} />
          <Cell label="Nummer opdr." value={d.nummerOpdr} />
          <Cell label="Nummer opzichter" value={d.nummerOpzichter} />
          <Cell label="Aanbetaling" value={d.aanbetaling} />
          <Cell label="Opmerking" value={d.opmerking} />
        </div>
      </div>

      <div className="vdoc-sec">
        <div className="vdoc-sec-title">Betreft &amp; omschrijving</div>
        <table className="vdoc-table">
          <thead>
            <tr>
              <th>Betreft</th>
              <th>Omschrijving</th>
              <th style={{ textAlign: 'right' }}>Prijs</th>
              <th>BTW</th>
            </tr>
          </thead>
          <tbody>
            {d.items.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ color: '#9a9aa0' }}>
                  Geen regels ingevoerd
                </td>
              </tr>
            ) : (
              d.items.map((i, idx) => (
                <tr key={idx}>
                  <td>{i.betreft || '—'}</td>
                  <td>{i.omschrijving || '—'}</td>
                  <td className="num">{i.prijs ? eur(i.prijs) : '—'}</td>
                  <td>{i.btw}</td>
                </tr>
              ))
            )}
            {d.items.length > 0 && (
              <tr className="total">
                <td colSpan={2}>Totaal ingevoerd</td>
                <td className="num">{eur(total)}</td>
                <td />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="vdoc-sec">
        <div className="vdoc-sec-title">Administratieve afhandeling</div>
        <div className="vdoc-chips" style={{ marginBottom: 9 }}>
          {CHECKS.map(([k, label]) => (
            <Chip key={k} label={label} on={d.checklist[k]} />
          ))}
        </div>
        <div className="vdoc-chips">
          <b style={{ fontSize: 11, color: '#8a8a90', alignSelf: 'center', marginRight: 4 }}>BESTELBON</b>
          {BESTELBON_KEYS.map((v) => (
            <Chip key={v} label={cap(v)} on={d.bestelbon === v} />
          ))}
        </div>
      </div>

      <div className="vdoc-sec">
        <div className="vdoc-sec-title">Leveranciers &amp; bestellingen</div>
        <table className="vdoc-table">
          <thead>
            <tr>
              <th>Leverancier</th>
              <th>Artikel / ordernr.</th>
              <th>Besteld</th>
              <th>Binnen</th>
              <th>Opdr. nr</th>
            </tr>
          </thead>
          <tbody>
            {d.suppliers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ color: '#9a9aa0' }}>
                  Geen bestellingen ingevoerd
                </td>
              </tr>
            ) : (
              d.suppliers.map((s, idx) => (
                <tr key={idx}>
                  <td>{s.leverancier || '—'}</td>
                  <td>{s.artikel || '—'}</td>
                  <td>{fmtDate(s.besteld) || '—'}</td>
                  <td>{fmtDate(s.binnen) || '—'}</td>
                  <td>{s.opdrNr || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="vdoc-sec">
        <div className="vdoc-sec-title">Tekening &amp; opmerkingen</div>
        <div className="vdoc-notes">{d.opmerkingenTekst || '—'}</div>
        {d.sketch && (
          <div className="vdoc-sketch" style={{ marginTop: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={d.sketch} alt="Schets" />
          </div>
        )}
      </div>

      <div className="vdoc-foot">
        <span>Vidre glastoepassingen</span>
        <span>{d.ref}</span>
      </div>
    </div>
  );
}
