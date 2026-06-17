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

    const pos = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) * (canvas.width / r.width),
        y: (e.clientY - r.top) * (canvas.height / r.height),
      };
    };
    const down = (e: PointerEvent) => {
      drawing.current = true;
      canvas.setPointerCapture(e.pointerId);
      const p = pos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    };
    const move = (e: PointerEvent) => {
      if (!drawing.current) return;
      const p = pos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      e.preventDefault();
    };
    const up = () => {
      drawing.current = false;
    };

    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    return () => {
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
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
