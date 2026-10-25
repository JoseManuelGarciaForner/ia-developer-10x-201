-- Esquema inicial de Telón

CREATE TABLE tenants (
  id            text PRIMARY KEY,                 -- TN-FARO
  slug          text NOT NULL UNIQUE,             -- sala-faro
  name          text NOT NULL,
  admin_token   text NOT NULL UNIQUE,
  email_provider text NOT NULL DEFAULT 'smtp',    -- smtp | sendgrid | mailgun | ses | postmark
  email_from    text NOT NULL,
  email_config  jsonb NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE domains (
  host       text PRIMARY KEY,                    -- entradas.salafaro.localhost
  tenant_id  text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE events (
  id              text PRIMARY KEY,               -- EV-FARO-0042
  tenant_id       text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title           text NOT NULL,
  venue           text NOT NULL,
  starts_at       timestamptz NOT NULL,
  page_tsx        text NOT NULL,
  fee_cents       integer NOT NULL DEFAULT 90,    -- gastos de gestión por entrada
  commission_bps  integer NOT NULL DEFAULT 750,   -- comisión de plataforma (7,5 %)
  published       boolean NOT NULL DEFAULT true
);

CREATE TABLE pass_types (
  id          text PRIMARY KEY,                   -- EV-FARO-0042-VIP
  event_id    text NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text NOT NULL DEFAULT '',
  price_cents integer NOT NULL,
  capacity    integer NOT NULL
);

CREATE TABLE seats (
  event_id    text NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  id          text NOT NULL,                      -- F-12
  zone        text NOT NULL,                      -- platea | anfiteatro
  row_label   text NOT NULL,
  number      integer NOT NULL,
  price_cents integer NOT NULL,
  PRIMARY KEY (event_id, id)
);

CREATE SEQUENCE order_number_seq START 108;

CREATE TABLE orders (
  id               text PRIMARY KEY,              -- PED-2026-0107
  tenant_id        text NOT NULL REFERENCES tenants(id),
  event_id         text NOT NULL REFERENCES events(id),
  buyer_email      text NOT NULL,
  status           text NOT NULL DEFAULT 'pending', -- pending | paid | failed
  subtotal_cents   integer NOT NULL,
  fee_cents        integer NOT NULL,
  total_cents      integer NOT NULL,
  commission_cents integer NOT NULL,
  charge_id        text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  paid_at          timestamptz
);

CREATE TABLE tickets (
  id               text PRIMARY KEY,              -- PED-2026-0107-1
  order_id         text NOT NULL REFERENCES orders(id),
  event_id         text NOT NULL REFERENCES events(id),
  kind             text NOT NULL,                 -- seat | pass
  seat_id          text,
  pass_type_id     text REFERENCES pass_types(id),
  price_cents      integer NOT NULL,
  fee_cents        integer NOT NULL,
  commission_cents integer NOT NULL,
  status           text NOT NULL DEFAULT 'pending', -- pending | valid | void
  qr_token         text,
  checked_in_at    timestamptz
);

-- Una butaca solo puede estar en una entrada activa a la vez
CREATE UNIQUE INDEX tickets_one_active_seat
  ON tickets (event_id, seat_id)
  WHERE seat_id IS NOT NULL AND status IN ('pending', 'valid');

CREATE TABLE email_log (
  id         bigserial PRIMARY KEY,
  tenant_id  text NOT NULL REFERENCES tenants(id),
  provider   text NOT NULL,
  to_address text NOT NULL,
  subject    varchar(80) NOT NULL,
  job_id     text,
  sent_at    timestamptz NOT NULL DEFAULT now()
);
