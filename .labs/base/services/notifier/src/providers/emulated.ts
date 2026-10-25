import { randomBytes } from 'node:crypto';
import type { EmailProvider } from './types.js';

// SendGrid, Mailgun, SES y Postmark están emulados: se comprueba la configuración
// que pide cada uno, se registra el envío y no sale nada a internet.
const REQUIRED: Record<string, string[]> = {
  sendgrid: ['apiKey'],
  mailgun: ['apiKey', 'domain'],
  ses: ['accessKeyId', 'secretAccessKey', 'region'],
  postmark: ['serverToken'],
};

export function emulatedProvider(name: string, settings: Record<string, unknown>): EmailProvider {
  const missing = (REQUIRED[name] ?? []).filter((k) => !settings[k]);
  return {
    name,
    async send(email) {
      if (missing.length) throw new Error(`${name}: falta configurar ${missing.join(', ')}`);
      const messageId = `<${randomBytes(8).toString('hex')}@${name}.emulado>`;
      console.log(`[${name} emulado] ${email.to} · ${email.subject} · ${messageId}`);
      return { messageId };
    },
  };
}
