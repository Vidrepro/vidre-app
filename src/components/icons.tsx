/** SVG-iconen, exact overgenomen uit prototypes/vidre-klantenorder.html. */
import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;

export const IconUser = (p: P) => (
  <svg viewBox="0 0 24 24" {...p}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const IconList = (p: P) => (
  <svg viewBox="0 0 24 24" {...p}>
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
  </svg>
);

export const IconCheckDoc = (p: P) => (
  <svg viewBox="0 0 24 24" {...p}>
    <path d="m9 11 3 3 8-8" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

export const IconTruck = (p: P) => (
  <svg viewBox="0 0 24 24" {...p}>
    <path d="M10 17h4V5H2v12h3" />
    <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1" />
    <circle cx="7.5" cy="17.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

export const IconPencil = (p: P) => (
  <svg viewBox="0 0 24 24" {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export const IconPlus = (p: P) => (
  <svg viewBox="0 0 24 24" {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconClose = (p: P) => (
  <svg viewBox="0 0 24 24" {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const IconTrash = (p: P) => (
  <svg viewBox="0 0 24 24" {...p}>
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export const IconEye = (p: P) => (
  <svg viewBox="0 0 24 24" {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconDownload = (p: P) => (
  <svg viewBox="0 0 24 24" {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M7 10l5 5 5-5" />
    <path d="M12 15V3" />
  </svg>
);

export const IconWarn = (p: P) => (
  <svg viewBox="0 0 24 24" {...p}>
    <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
  </svg>
);
