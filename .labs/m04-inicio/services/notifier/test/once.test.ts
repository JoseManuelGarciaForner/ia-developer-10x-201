import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EmailProvider } from '../src/providers/index.js';

// Base de datos simulada: solo lo que usa sendOnce (reservar y liberar la clave)
const keys = new Set<string>();
vi.mock('../src/db.js', () => ({
  pool: {
    query: vi.fn(async (sql: string, params: unknown[]) => {
      if (sql.startsWith('INSERT')) {
        const key = params[5] as string;
        if (keys.has(key)) return { rowCount: 0, rows: [] };
        keys.add(key);
        return { rowCount: 1, rows: [{ id: 1 }] };
      }
      if (sql.startsWith('DELETE')) keys.delete(params[0] as string);
      return { rowCount: 1, rows: [] };
    }),
  },
}));

const { sendOnce } = await import('../src/once.js');

const email = { from: 'entradas@salafaro.test', to: 'ana.compradora@ejemplo.test', subject: 'Devolución', html: '', text: '' };

function fakeProvider(failTimes = 0): EmailProvider & { sent: number } {
  let failures = 0;
  return {
    name: 'falso',
    sent: 0,
    async send() {
      if (failures < failTimes) {
        failures++;
        throw new Error('proveedor caído');
      }
      this.sent++;
      return { messageId: 'x' };
    },
  };
}

beforeEach(() => keys.clear());

describe('sendOnce', () => {
  it('si la cola reintenta un trabajo ya enviado, no se envía otra vez', async () => {
    const provider = fakeProvider();
    expect(await sendOnce('refund-confirmed:DEV-2026-0001', 'TN-FARO', provider, email)).toBe('sent');
    expect(await sendOnce('refund-confirmed:DEV-2026-0001', 'TN-FARO', provider, email)).toBe('already-sent');
    expect(provider.sent).toBe(1);
  });

  it('si el envío falla, el reintento sí lo envía', async () => {
    const provider = fakeProvider(1);
    await expect(sendOnce('refund-confirmed:DEV-2026-0002', 'TN-FARO', provider, email)).rejects.toThrow('caído');
    expect(await sendOnce('refund-confirmed:DEV-2026-0002', 'TN-FARO', provider, email)).toBe('sent');
    expect(provider.sent).toBe(1);
  });
});
