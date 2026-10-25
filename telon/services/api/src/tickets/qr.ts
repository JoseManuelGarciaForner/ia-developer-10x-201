import { createHmac, timingSafeEqual } from 'node:crypto';

// El QR lleva el id de la entrada y una firma corta. La puerta lo valida contra la API.

function sign(ticketId: string, secret: string): string {
  return createHmac('sha256', secret).update(ticketId).digest('base64url').slice(0, 22);
}

export function createQrToken(ticketId: string, secret: string): string {
  return `${ticketId}.${sign(ticketId, secret)}`;
}

export function parseQrToken(token: string, secret: string): string | null {
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const ticketId = token.slice(0, dot);
  const given = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(sign(ticketId, secret));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  return ticketId;
}
