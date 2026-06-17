/**
 * OneDrive upload via Microsoft Graph API.
 *
 * Authenticatie: client credentials (app-only). Geen interactieve login
 * per request — de server praat zelfstandig met OneDrive.
 *
 * Setup: zie docs/SETUP-ONEDRIVE.md
 */

import { ConfidentialClientApplication } from '@azure/msal-node';

const SCOPE = 'https://graph.microsoft.com/.default';

let cca: ConfidentialClientApplication | null = null;
let cachedToken: { token: string; expiresAt: number } | null = null;

function getClient(): ConfidentialClientApplication {
  if (cca) return cca;
  const tenantId = required('AZURE_TENANT_ID');
  const clientId = required('AZURE_CLIENT_ID');
  const clientSecret = required('AZURE_CLIENT_SECRET');
  cca = new ConfidentialClientApplication({
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
      clientSecret,
    },
  });
  return cca;
}

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }
  const res = await getClient().acquireTokenByClientCredential({ scopes: [SCOPE] });
  if (!res?.accessToken) throw new Error('No access token received from Microsoft');
  cachedToken = {
    token: res.accessToken,
    expiresAt: res.expiresOn?.getTime() ?? Date.now() + 3000_000,
  };
  return res.accessToken;
}

/**
 * Upload een klein bestand (< 4 MB) naar OneDrive van een specifieke user.
 * Pad is relatief t.o.v. drive root, bijv. "Klantorders/2026/06/order.xlsx".
 * Gebruikt conflictBehavior=rename zodat we nooit een bestand overschrijven.
 *
 * @returns De webUrl waar het bestand vindbaar is in OneDrive.
 */
export async function uploadToOneDrive(
  relativePath: string,
  body: Buffer,
  contentType: string
): Promise<{ id: string; webUrl: string; name: string }> {
  const token = await getAccessToken();
  const userId = required('ONEDRIVE_USER_ID');
  const encoded = relativePath.split('/').map(encodeURIComponent).join('/');
  const url = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(userId)}/drive/root:/${encoded}:/content?@microsoft.graph.conflictBehavior=rename`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': contentType,
    },
    // Buffer is een Uint8Array; expliciete view voorkomt type-mismatch met BodyInit (Node 24 types)
    body: new Uint8Array(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OneDrive upload failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  return { id: json.id, webUrl: json.webUrl, name: json.name };
}

/**
 * Bouwt het pad waar bestanden worden opgeslagen.
 * Standaard: Klantorders/2026/06/{filename}
 */
export function buildStoragePath(filename: string, date = new Date()): string {
  const base = process.env.ONEDRIVE_BASE_PATH || 'Klantorders';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${base}/${year}/${month}/${filename}`;
}

const ENV_NAMES = ['AZURE_TENANT_ID', 'AZURE_CLIENT_ID', 'AZURE_CLIENT_SECRET', 'ONEDRIVE_USER_ID'] as const;

/** Welke env-variabelen zijn ingevuld? (zonder de geheime waarden te lekken) */
export function oneDriveConfigStatus(): { configured: boolean; missing: string[]; basePath: string } {
  const missing = ENV_NAMES.filter((n) => !process.env[n]);
  return { configured: missing.length === 0, missing, basePath: process.env.ONEDRIVE_BASE_PATH || 'Klantorders' };
}

/**
 * Diagnose: haal een token op en zoek de drive van de ingestelde gebruiker op.
 * Hiermee kun je na de Azure-registratie controleren of alles klopt.
 */
export async function getDriveInfo(): Promise<{ id: string; driveType: string; owner: string | null }> {
  const token = await getAccessToken();
  const userId = required('ONEDRIVE_USER_ID');
  const url = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(userId)}/drive`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph drive-lookup mislukt: ${res.status} ${text}`);
  }
  const j = await res.json();
  return {
    id: j.id,
    driveType: j.driveType,
    owner: j.owner?.user?.displayName ?? j.owner?.user?.email ?? null,
  };
}
