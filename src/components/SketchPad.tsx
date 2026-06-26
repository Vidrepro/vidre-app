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

    const cleanups: Array<() => void> = [];

    // Pointer Events waar beschikbaar (modern). Oude iPad/Safari (< iOS 13)
    // ondersteunt die niet — daar vallen we terug op touch- en muis-events,
    // anders kan de monteur niet tekenen.
    const supportsPointer = typeof window.PointerEvent !== 'undefined';
    if (supportsPointer) {
      const down = (e: PointerEvent) => {
        if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId);
        start(e.clientX, e.clientY);
      };
      const move = (e: PointerEvent) => {
        if (!drawing.current) return;
        extend(e.clientX, e.clientY);
        e.preventDefault();
      };
      canvas.addEventListener('pointerdown', down);
      canvas.addEventListener('pointermove', move);
      canvas.addEventListener('pointerup', end);
      canvas.addEventListener('pointercancel', end);
      cleanups.push(() => {
        canvas.removeEventListener('pointerdown', down);
        canvas.removeEventListener('pointermove', move);
        canvas.removeEventListener('pointerup', end);
        canvas.removeEventListener('pointercancel', end);
      });
    } else {
      // Touch (oude iOS Safari). preventDefault houdt het scrollen tegen.
      const tStart = (e: TouchEvent) => {
        const t = e.touches[0];
        if (t) start(t.clientX, t.clientY);
        e.preventDefault();
      };
      const tMove = (e: TouchEvent) => {
        const t = e.touches[0];
        if (t) extend(t.clientX, t.clientY);
        e.preventDefault();
      };
      canvas.addEventListener('touchstart', tStart, { passive: false });
      canvas.addEventListener('touchmove', tMove, { passive: false });
      canvas.addEventListener('touchend', end);
      canvas.addEventListener('touchcancel', end);
      // Muis (oudere desktopbrowsers).
      const mDown = (e: MouseEvent) => start(e.clientX, e.clientY);
      const mMove = (e: MouseEvent) => extend(e.clientX, e.clientY);
      canvas.addEventListener('mousedown', mDown);
      canvas.addEventListener('mousemove', mMove);
      window.addEventListener('mouseup', end);
      cleanups.push(() => {
        canvas.removeEventListener('touchstart', tStart);
        canvas.removeEventListener('touchmove', tMove);
        canvas.removeEventListener('touchend', end);
        canvas.removeEventListener('touchcancel', end);
        canvas.removeEventListener('mousedown', mDown);
        canvas.removeEventListener('mousemove', mMove);
        window.removeEventListener('mouseup', end);
      });
    }

    return () => cleanups.forEach((fn) => fn());
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
