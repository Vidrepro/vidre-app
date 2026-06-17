'use client';

import { AANBETALING_OPTIONS, type OrderState } from '@/lib/order';
import { IconUser } from './icons';
import Segmented from './Segmented';

type TextKey =
  | 'naamKlant'
  | 'opdrachtgever'
  | 'contactpersoon'
  | 'email'
  | 'werkadres'
  | 'postcodePlaats'
  | 'datumAanname'
  | 'datumOfferte'
  | 'debiteurNr'
  | 'nummerKlant'
  | 'nummerOpdr'
  | 'nummerOpzichter'
  | 'opmerking';

interface Props {
  state: OrderState;
  onChange: (key: TextKey, value: string) => void;
  onAanbetaling: (value: string) => void;
  invalid: { naamKlant?: boolean; werkadres?: boolean };
}

export default function ClientSection({ state, onChange, onAanbetaling, invalid }: Props) {
  const txt = (key: TextKey) => ({
    value: state[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(key, e.target.value),
  });

  return (
    <section className="card" id="sec-klant">
      <div className="card-head">
        <span className="card-icon">
          <IconUser />
        </span>
        <div>
          <h2>Klant &amp; order</h2>
          <p className="card-sub">Gegevens van de opdrachtgever en de order.</p>
        </div>
      </div>

      <div className="grid">
        <div className="field">
          <label htmlFor="naamKlant">
            Naam klant <span className="req">*</span>
          </label>
          <input
            id="naamKlant"
            type="text"
            autoComplete="off"
            placeholder="Bedrijfs- of klantnaam"
            className={invalid.naamKlant ? 'invalid' : undefined}
            {...txt('naamKlant')}
          />
        </div>
        <div className="field">
          <label htmlFor="opdrachtgever">Opdrachtgever</label>
          <input id="opdrachtgever" type="text" autoComplete="off" {...txt('opdrachtgever')} />
        </div>

        <div className="field">
          <label htmlFor="contactpersoon">Contactpersoon</label>
          <input id="contactpersoon" type="text" autoComplete="off" {...txt('contactpersoon')} />
        </div>
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" autoComplete="off" placeholder="naam@voorbeeld.nl" {...txt('email')} />
        </div>

        <div className="field field-wide">
          <label htmlFor="werkadres">
            Werkadres <span className="req">*</span>
          </label>
          <input
            id="werkadres"
            type="text"
            autoComplete="off"
            placeholder="Straat en huisnummer"
            className={invalid.werkadres ? 'invalid' : undefined}
            {...txt('werkadres')}
          />
        </div>
        <div className="field">
          <label htmlFor="postcodePlaats">Postcode + plaats</label>
          <input id="postcodePlaats" type="text" autoComplete="off" {...txt('postcodePlaats')} />
        </div>

        <div className="field">
          <label htmlFor="datumAanname">Datum aanname</label>
          <input id="datumAanname" type="date" {...txt('datumAanname')} />
        </div>
        <div className="field">
          <label htmlFor="datumOfferte">Datum offerte</label>
          <input id="datumOfferte" type="date" {...txt('datumOfferte')} />
        </div>

        <div className="field">
          <label htmlFor="debiteurNr">Debiteur nr.</label>
          <input id="debiteurNr" type="text" inputMode="numeric" autoComplete="off" {...txt('debiteurNr')} />
        </div>
        <div className="field">
          <label htmlFor="nummerKlant">Nummer klant</label>
          <input id="nummerKlant" type="text" autoComplete="off" {...txt('nummerKlant')} />
        </div>

        <div className="field">
          <label htmlFor="nummerOpdr">Nummer opdr.</label>
          <input id="nummerOpdr" type="text" autoComplete="off" {...txt('nummerOpdr')} />
        </div>
        <div className="field">
          <label htmlFor="nummerOpzichter">Nummer opzichter</label>
          <input id="nummerOpzichter" type="text" autoComplete="off" {...txt('nummerOpzichter')} />
        </div>

        <div className="field field-wide">
          <label>Aanbetaling</label>
          <Segmented
            group="aanbetaling"
            options={AANBETALING_OPTIONS}
            value={state.aanbetaling}
            onChange={onAanbetaling}
          />
        </div>
        <div className="field field-wide">
          <label htmlFor="opmerking">Opmerking</label>
          <input
            id="opmerking"
            type="text"
            autoComplete="off"
            placeholder="Korte notitie bij de order"
            {...txt('opmerking')}
          />
        </div>
      </div>
    </section>
  );
}
