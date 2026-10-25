-- Devoluciones de entradas. Un pedido pagado no se modifica: la devolución lo referencia.

CREATE SEQUENCE refund_number_seq START 1;

CREATE TABLE refunds (
  id                        text PRIMARY KEY,           -- DEV-2026-0001
  order_id                  text NOT NULL REFERENCES orders(id),
  tenant_id                 text NOT NULL REFERENCES tenants(id),
  amount_cents              integer NOT NULL,           -- lo que se devuelve al comprador (sin gastos)
  commission_reversed_cents integer NOT NULL,           -- comisión que la plataforma deja de cobrar
  payment_refund_id         text NOT NULL,
  created_at                timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE refund_tickets (
  refund_id text NOT NULL REFERENCES refunds(id),
  ticket_id text NOT NULL REFERENCES tickets(id) UNIQUE,
  PRIMARY KEY (refund_id, ticket_id)
);

-- Estado nuevo de entrada: refunded (además de pending, valid, void)
