import { formatDate, formatEuros } from '@telon/ui';
import { useEffect, useState, type FormEvent } from 'react';
import { admin, type Me } from './api.js';

function useAdmin<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reload = () => admin<T>(path).then(setData, (e: Error) => setError(e.message));
  useEffect(() => {
    void reload();
  }, [path]);
  return { data, error, reload };
}

const storefrontOrigin = () => location.origin.replace(/5174/, '5173');

export function Events() {
  const { data, error } = useAdmin<{ id: string; title: string; venue: string; starts_at: string; sold: number }[]>('/events');
  return (
    <section className="card">
      <h2>Eventos</h2>
      {error && <p role="alert">{error}</p>}
      <table>
        <thead><tr><th>Evento</th><th>Fecha</th><th>Vendidas</th><th></th></tr></thead>
        <tbody>
          {data?.map((e) => (
            <tr key={e.id}>
              <td><strong>{e.title}</strong><br /><small>{e.id} · {e.venue}</small></td>
              <td>{formatDate(e.starts_at)}</td>
              <td>{e.sold}</td>
              <td><a href={`#/eventos/${e.id}`}>Editar página</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function Domains({ me }: { me: Me }) {
  const { data, error, reload } = useAdmin<{ host: string }[]>('/domains');
  const [host, setHost] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const port = storefrontOrigin().match(/:(\d+)$/)?.[0] ?? '';

  async function add(e: FormEvent) {
    e.preventDefault();
    try {
      await admin('/domains', { method: 'POST', body: JSON.stringify({ host }) });
      setHost('');
      setMsg(null);
      await reload();
    } catch (err) {
      setMsg((err as Error).message);
    }
  }

  async function remove(h: string) {
    await admin(`/domains/${encodeURIComponent(h)}`, { method: 'DELETE' });
    await reload();
  }

  return (
    <section className="card">
      <h2>Dominios</h2>
      <p>
        Tu tienda responde en cada dominio que añadas. En local, cualquier <code>*.localhost</code> funciona sin tocar DNS.
        Sin dominio propio: <a href={`${storefrontOrigin()}/t/${me.slug}`}>{storefrontOrigin()}/t/{me.slug}</a>
      </p>
      {error && <p role="alert">{error}</p>}
      <table>
        <tbody>
          {data?.map((d) => (
            <tr key={d.host}>
              <td><a href={`${location.protocol}//${d.host}${port}/`}>{d.host}</a></td>
              <td style={{ textAlign: 'right' }}><button onClick={() => remove(d.host)}>Quitar</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={add} style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <input aria-label="Dominio" placeholder={`entradas.${me.slug.replace(/-/g, '')}.localhost`} value={host} onChange={(e) => setHost(e.target.value)} />
        <button type="submit">Añadir dominio</button>
      </form>
      {msg && <p role="alert">{msg}</p>}
    </section>
  );
}

const PROVIDER_FIELDS: Record<string, string[]> = {
  smtp: ['host', 'port'],
  sendgrid: ['apiKey'],
  mailgun: ['apiKey', 'domain'],
  ses: ['accessKeyId', 'secretAccessKey', 'region'],
  postmark: ['serverToken'],
};

const PROVIDER_LABELS: Record<string, string> = {
  smtp: 'SMTP (en el curso: Mailpit)',
  sendgrid: 'SendGrid (emulado)',
  mailgun: 'Mailgun (emulado)',
  ses: 'Amazon SES (emulado)',
  postmark: 'Postmark (emulado)',
};

export function Email() {
  const { data, reload } = useAdmin<{ provider: string; from: string; config: Record<string, string>; providers: string[] }>('/email');
  const [form, setForm] = useState<{ provider: string; from: string; config: Record<string, string> } | null>(null);
  const [to, setTo] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (data) setForm({ provider: data.provider, from: data.from, config: data.config });
  }, [data]);

  if (!data || !form) return <section className="card">Cargando…</section>;

  async function save(e: FormEvent) {
    e.preventDefault();
    await admin('/email', { method: 'PUT', body: JSON.stringify(form) });
    setMsg('Guardado');
    await reload();
  }

  async function test() {
    const r = await admin<{ job_id: string }>('/email/test', { method: 'POST', body: JSON.stringify({ to }) });
    setMsg(`Prueba en cola (trabajo ${r.job_id}). Mira Mailpit o «Correos enviados».`);
  }

  return (
    <section className="card">
      <h2>Proveedor de email</h2>
      <form onSubmit={save}>
        <label>
          Proveedor{' '}
          <select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value, config: {} })}>
            {data.providers.map((p) => <option key={p} value={p}>{PROVIDER_LABELS[p] ?? p}</option>)}
          </select>
        </label>
        <p>
          <label>Remitente <input value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} /></label>
        </p>
        {PROVIDER_FIELDS[form.provider]?.map((k) => (
          <p key={k}>
            <label>
              {k}{' '}
              <input
                value={form.config[k] ?? ''}
                placeholder={form.provider === 'smtp' ? 'por defecto, el del entorno' : ''}
                onChange={(e) => setForm({ ...form, config: { ...form.config, [k]: e.target.value } })}
              />
            </label>
          </p>
        ))}
        <button type="submit">Guardar</button>
      </form>
      <p style={{ marginTop: 20 }}>
        <input aria-label="Enviar prueba a" placeholder="tu@ejemplo.test" value={to} onChange={(e) => setTo(e.target.value)} />{' '}
        <button onClick={test} disabled={!to}>Enviar correo de prueba</button>
      </p>
      {msg && <p role="status">{msg}</p>}
    </section>
  );
}

export function Orders() {
  const orders = useAdmin<{ id: string; event_id: string; buyer_email: string; status: string; total_cents: number; created_at: string; tickets: number }[]>('/orders');
  const emails = useAdmin<{ id: number; provider: string; to_address: string; subject: string; sent_at: string }[]>('/emails');
  return (
    <>
      <section className="card">
        <h2>Pedidos</h2>
        <table>
          <thead><tr><th>Pedido</th><th>Comprador</th><th>Estado</th><th>Entradas</th><th>Total</th><th>Fecha</th></tr></thead>
          <tbody>
            {orders.data?.map((o) => (
              <tr key={o.id}>
                <td>{o.id}<br /><small>{o.event_id}</small></td>
                <td>{o.buyer_email}</td>
                <td>{o.status}</td>
                <td>{o.tickets}</td>
                <td>{formatEuros(o.total_cents)}</td>
                <td>{new Date(o.created_at).toLocaleString('es-ES')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="card">
        <h2>Correos enviados</h2>
        <table>
          <thead><tr><th>Proveedor</th><th>Para</th><th>Asunto</th><th>Enviado</th></tr></thead>
          <tbody>
            {emails.data?.map((m) => (
              <tr key={m.id}><td>{m.provider}</td><td>{m.to_address}</td><td>{m.subject}</td><td>{new Date(m.sent_at).toLocaleString('es-ES')}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
