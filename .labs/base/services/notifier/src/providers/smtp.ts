import nodemailer from 'nodemailer';
import { config } from '../config.js';
import type { EmailProvider } from './types.js';

// SMTP real. En el curso apunta a Mailpit, que recoge todo lo que se envía.
export function smtpProvider(settings: { host?: string; port?: number }): EmailProvider {
  const transport = nodemailer.createTransport({
    host: settings.host || config.smtpHost,
    port: Number(settings.port || config.smtpPort),
    secure: false,
  });
  return {
    name: 'smtp',
    async send(email) {
      const info = await transport.sendMail(email);
      return { messageId: info.messageId };
    },
  };
}
