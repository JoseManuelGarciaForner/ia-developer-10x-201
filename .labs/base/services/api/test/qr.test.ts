import { describe, expect, it } from 'vitest';
import { createQrToken, parseQrToken } from '../src/tickets/qr.js';

describe('QR de entrada', () => {
  it('devuelve el id de la entrada si la firma es buena', () => {
    const token = createQrToken('PED-2026-0107-1', 's3');
    expect(parseQrToken(token, 's3')).toBe('PED-2026-0107-1');
  });

  it('rechaza un token manipulado', () => {
    const token = createQrToken('PED-2026-0107-1', 's3');
    expect(parseQrToken(token.replace('0107-1', '0107-2'), 's3')).toBeNull();
  });

  it('rechaza un token firmado con otro secreto', () => {
    expect(parseQrToken(createQrToken('PED-2026-0107-1', 'otro'), 's3')).toBeNull();
  });
});
