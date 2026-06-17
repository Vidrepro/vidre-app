import { NextRequest, NextResponse } from 'next/server';
import { buildExcelBuffer, fileBase } from '@/lib/excel';
import { buildPdfBuffer } from '@/lib/pdf';
import { buildStoragePath, oneDriveConfigStatus, uploadToOneDrive } from '@/lib/onedrive';
import type { OrderPayload } from '@/lib/order';

// Server timezone op Amsterdam zodat datums kloppen
process.env.TZ = 'Europe/Amsterdam';

export const runtime = 'nodejs'; // niet 'edge' — we hebben Node libs nodig
export const maxDuration = 30;

const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const PDF_TYPE = 'application/pdf';

export async function POST(req: NextRequest) {
  try {
    const data = (await req.json()) as Partial<OrderPayload>;

    // Validatie — minimaal naam klant en werkadres (zoals de prototype)
    if (!data?.naamKlant?.trim() || !data?.werkadres?.trim()) {
      return NextResponse.json(
        { ok: false, error: 'Vul minimaal naam klant en werkadres in.' },
        { status: 400 }
      );
    }

    const d = data as OrderPayload;
    const base = fileBase(d);

    // Excel + PDF bouwen
    const [excelBuffer, pdfBuffer] = await Promise.all([
      Promise.resolve(buildExcelBuffer(d)),
      buildPdfBuffer(d),
    ]);

    // Zonder OneDrive-config (nog vóór Fase 4) slaan we de upload over,
    // zodat de generatie los getest kan worden.
    if (!oneDriveConfigStatus().configured) {
      return NextResponse.json({
        ok: true,
        ref: d.ref,
        fileName: `${base}.xlsx`,
        uploaded: false,
        warning: 'OneDrive niet geconfigureerd — bestanden zijn gegenereerd maar niet geüpload.',
        sizes: { xlsx: excelBuffer.length, pdf: pdfBuffer.length },
      });
    }

    const [xlsx, pdf] = await Promise.all([
      uploadToOneDrive(buildStoragePath(`${base}.xlsx`), excelBuffer, XLSX_TYPE),
      uploadToOneDrive(buildStoragePath(`${base}.pdf`), pdfBuffer, PDF_TYPE),
    ]);

    return NextResponse.json({ ok: true, ref: d.ref, fileName: `${base}.xlsx`, uploaded: true, xlsx, pdf });
  } catch (err) {
    console.error('orders POST failed', err);
    const message = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
