import { describe, expect, it } from 'vitest';
import { providerFor } from '../src/providers/index.js';

const email = { from: 'a@ejemplo.test', to: 'b@ejemplo.test', subject: 'Hola', html: '<p>Hola</p>', text: 'Hola' };

describe('proveedores emulados', () => {
  it('SendGrid envía si tiene apiKey', async () => {
    const r = await providerFor('sendgrid', { apiKey: 'SG.x' }).send(email);
    expect(r.messageId).toContain('sendgrid.emulado');
  });

  it('Mailgun falla si falta el dominio', async () => {
    await expect(providerFor('mailgun', { apiKey: 'k' }).send(email)).rejects.toThrow('domain');
  });

  it('un proveedor desconocido no se acepta', () => {
    expect(() => providerFor('palomas', {})).toThrow('desconocido');
  });
});
