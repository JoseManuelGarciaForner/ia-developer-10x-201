-- Correos idempotentes: cada envío tiene una clave (p. ej. refund-confirmed:DEV-2026-0001).
-- Si la cola reintenta un trabajo que ya envió el correo, la clave existe y no se vuelve a enviar.
ALTER TABLE email_log ALTER COLUMN subject TYPE text;
ALTER TABLE email_log ADD COLUMN dedupe_key text UNIQUE;
