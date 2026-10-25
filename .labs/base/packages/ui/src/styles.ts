import type { CSSProperties } from 'react';

// Los componentes heredan color y tipografía de la página del promotor.
// El promotor puede cambiar el acento con la variable CSS --telon-accent.
export const accent = 'var(--telon-accent, #f2b544)';

export const box: CSSProperties = {
  border: '1px solid color-mix(in srgb, currentColor 25%, transparent)',
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
};

export const button: CSSProperties = {
  background: accent,
  color: '#111',
  border: 0,
  borderRadius: 8,
  padding: '10px 16px',
  fontWeight: 600,
  cursor: 'pointer',
  font: 'inherit',
};

export const input: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid color-mix(in srgb, currentColor 35%, transparent)',
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  marginBottom: 10,
};

export const muted: CSSProperties = { opacity: 0.7, fontSize: '0.9em' };
