export interface OutgoingEmail {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: { filename: string; content: Buffer; cid: string }[];
}

export interface EmailProvider {
  name: string;
  send(email: OutgoingEmail): Promise<{ messageId: string }>;
}
