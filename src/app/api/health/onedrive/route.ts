import { NextResponse } from 'next/server';
import { getDriveInfo, oneDriveConfigStatus } from '@/lib/onedrive';

export const runtime = 'nodejs';

/**
 * Diagnose-endpoint voor de OneDrive/Graph-koppeling.
 *
 * Open /api/health/onedrive in de browser na de Azure-registratie:
 * - controleert of de env-variabelen zijn ingevuld;
 * - probeert een token op te halen en de drive van de ingestelde gebruiker te vinden.
 *
 * Lekt geen geheimen — toont alleen of waarden aanwezig zijn en het resultaat.
 */
export async function GET() {
  const status = oneDriveConfigStatus();

  if (!status.configured) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        missing: status.missing,
        basePath: status.basePath,
        hint: 'Vul de ontbrekende variabelen in .env.local (lokaal) of in Vercel → Settings → Environment Variables.',
      },
      { status: 200 }
    );
  }

  try {
    const drive = await getDriveInfo();
    return NextResponse.json({
      ok: true,
      configured: true,
      basePath: status.basePath,
      drive,
      message: `Verbinding OK — bestanden komen in "${status.basePath}/{jaar}/{maand}/" van ${drive.owner ?? 'de ingestelde gebruiker'}.`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'onbekende fout';
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        basePath: status.basePath,
        error: message,
        hint: message.includes('401') || message.toLowerCase().includes('unauthor')
          ? 'Controleer stap 4 in docs/SETUP-ONEDRIVE.md: is "Beheerderstoestemming verlenen" gedaan? Zonder admin-consent werkt de upload niet.'
          : 'Controleer ONEDRIVE_USER_ID (UPN of object-id) en of het account een OneDrive/drive heeft.',
      },
      { status: 200 }
    );
  }
}
