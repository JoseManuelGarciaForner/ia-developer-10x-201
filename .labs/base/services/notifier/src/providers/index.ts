import { emulatedProvider } from './emulated.js';
import { smtpProvider } from './smtp.js';
import type { EmailProvider } from './types.js';

export function providerFor(name: string, settings: Record<string, unknown>): EmailProvider {
  if (name === 'smtp') return smtpProvider(settings as { host?: string; port?: number });
  if (['sendgrid', 'mailgun', 'ses', 'postmark'].includes(name)) return emulatedProvider(name, settings);
  throw new Error(`proveedor de email desconocido: ${name}`);
}

export type { EmailProvider, OutgoingEmail } from './types.js';
