'use client';

export interface ToastState {
  message: string;
  kind?: 'ok' | 'err';
  show: boolean;
}

export default function Toast({ message, kind, show }: ToastState) {
  return (
    <div className={`toast${show ? ' show' : ''}${kind ? ' ' + kind : ''}`} aria-live="polite">
      {message}
    </div>
  );
}
