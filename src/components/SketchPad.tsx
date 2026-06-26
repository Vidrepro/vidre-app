'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { IconPencil, IconTrash } from './icons';

export interface SketchHandle {
  /** data-URL (PNG) of null als er niets getekend is. */
  toDataURL: () => string | null;
  clear: () => void;
}

interface Props {
  opmerkingenTekst: string;
  onOpmerkingen: (value: string) => void;
}

/** Tekenvlak op canvas — 1:1 met de prototype (pointer events, 1200×420 intern). */
const SketchPad = forwardRef<SketchHandle, Props>(function SketchPad({ opmerkingenTekst, onOpmerkingen }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#232326';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Schaal schermcoördinaten naar de interne canvasresolutie (1200×420).
    const posFrom = (clientX: number, clientY: number) => {
      const r = canvas.getBoundingClientRect();
      return {
        x: (clientX - r.left) * (canvas.width / r.width),
        y: (clientY - r.top) * (canvas.height / r.height),
      };
    };
    const start = (clientX: number, clientY: number) => {
      drawing.current = true;
      const p = posFrom(clientX, clientY);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    };
    const extend = (clientX: number, clientY: number) => {
      if (!drawing.current) return;
      const p = posFrom(clientX, clientY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };
    const end = () => {
      drawing.current = false;
    };

    // Bewust GEEN Pointer Events: die geven op iOS Safari problemen (touch-
    // pointermove stopt soms na setPointerCapture). Touch + muis is hier het
    // betrouwbaarst en werkt op elke iPad/Safari-versie.
    //
    // `touchUsed` voorkomt dubbel tekenen: na een touch bootst iOS muis-events
    // na — die negeren we zodra we weten dat het een touch-apparaat is.
    let touchUsed = false;

    const onTouchStart = (e: TouchEvent) => {
      touchUsed = true;
      const t = e.touches[0];
      if (t) start(t.clientX, t.clientY);
      e.preventDefault();
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) extend(t.clientX, t.clientY);
      e.preventDefault();
    };
    const onMouseDown = (e: MouseEvent) => {
      if (touchUsed) return;
      start(e.clientX, e.clientY);
    };
    const onMouseMove = (e: MouseEvent) => {
      if (touchUsed) return;
      extend(e.clientX, e.clientY);
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', end);
    canvas.addEventListener('touchcancel', end);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', end);

    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', end);
      canvas.removeEventListener('touchcancel', end);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', end);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    toDataURL() {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return null;
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] !== 0) return canvas.toDataURL('image/png');
      }
      return null;
    },
    clear() {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  }));

  const clearSketch = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <section className="card" id="sec-sketch">
      <div className="card-head">
        <span className="card-icon">
          <IconPencil />
        </span>
        <div>
          <h2>Tekening &amp; opmerkingen</h2>
          <p className="card-sub">Schets de situatie en noteer bijzonderheden.</p>
        </div>
      </div>

      <div className="field">
        <label htmlFor="opmerkingenTekst">Opmerkingen</label>
        <textarea
          id="opmerkingenTekst"
          rows={3}
          placeholder="Vrije tekst"
          value={opmerkingenTekst}
          onChange={(e) => onOpmerkingen(e.target.value)}
        />
      </div>
      <div className="field">
        <label>Schets</label>
        <div className="sketch-wrap">
          <canvas id="sketch" ref={canvasRef} width={1200} height={420} />
          <button type="button" className="sketch-clear" title="Wis schets" onClick={clearSketch}>
            <IconTrash className="ic" />
          </button>
        </div>
      </div>
    </section>
  );
});

export default SketchPad;
