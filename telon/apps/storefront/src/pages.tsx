import { PageRenderer } from '@telon/page-runtime';
import { createApi, formatDate, formatEuros, TelonProvider, TicketQR, type BuyerOrder, type EventInfo, type TenantRef } from '@telon/ui';
import { useEffect, useMemo, useState, type FormEvent } from 'react';

const shell = { maxWidth: 880, margin: '0 auto', padding: 32 } as const;

const ORDER_STATUS: Record<string, string> = { pending: 'pendiente de pago', paid: 'pagado', failed: 'rechazado' };
const TICKET_STATUS: Record<string, string> = { pending: 'sin pagar', valid: 'válida', void: 'anulada', refunded: 'devuelta' };

function useLoad<T>(load: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{ data?: T; error?: string }>({});
  useEffect(() => {
    setState({});
    load().then((data) => setState({ data }), (e: Error) => setState({ error: e.message }));
  }, deps);
  return state;
}

export function Portal() {
  const { data, error } = useLoad(
    () => fetch('/api/public/tenants').then((r) => r.json() as Promise<{ slug: string; name: string; domains: string[] }[]>),
    [],
  );
  const port = location.port ? `:${location.port}` : '';
  return (
    <main style={shell}>
      <h1>Telón</h1>
      <p>Tiendas de entradas de los promotores. Cada una se abre por su dominio o por su ruta.</p>
      {error && <p role="alert">{error}</p>}
      <ul>
        {data?.map((t) => (
          <li key={t.slug} style={{ marginBottom: 8 }}>
            <strong>{t.name}</strong> — <a href={`/t/${t.slug}`}>/t/{t.slug}</a>
            {t.domains.map((d) => (
              <span key={d}> · <a href={`${location.protocol}//${d}${port}/`}>{d}</a></span>
            ))}
          </li>
        ))}
      </ul>
    </main>
  );
}

export function TenantHome({ tenant, basePath }: { tenant: TenantRef; basePath: string }) {
  const api = useMemo(() => createApi(tenant), [tenant]);
  const { data, error } = useLoad(() => api.site(), [api]);
  if (error) return <main style={shell}><h1>No encontrado</h1><p>{error}</p></main>;
  if (!data) return <main style={shell}>Cargando…</main>;
  document.title = `Entradas · ${data.tenant.name}`;
  return (
    <main style={shell}>
      <h1>{data.tenant.name}</h1>
      <ul>
        {data.events.map((e) => (
          <li key={e.id} style={{ marginBottom: 12 }}>
            <a href={`${basePath}/e/${e.id}`}><strong>{e.title}</strong></a>
            <div>{formatDate(e.starts_at)} · {e.venue}</div>
          </li>
        ))}
      </ul>
      <p><a href={`${basePath}/mis-entradas`}>Ya tengo entradas</a></p>
    </main>
  );
}

export function EventPage({ tenant, basePath, eventId }: { tenant: TenantRef; basePath: string; eventId: string }) {
  const api = useMemo(() => createApi(tenant), [tenant]);
  const { data, error } = useLoad<EventInfo>(() => api.event(eventId), [api, eventId]);
  if (error) return <main style={shell}><h1>No encontrado</h1><p>{error}</p></main>;
  if (!data) return <main style={shell}>Cargando…</main>;
  document.title = data.title;
  return (
    <TelonProvider api={api} event={data} basePath={basePath}>
      <PageRenderer source={data.page_tsx} />
    </TelonProvider>
  );
}

export function MyTickets(props: { tenant: TenantRef; basePath: string; orderId: string; email: string }) {
  const api = useMemo(() => createApi(props.tenant), [props.tenant]);
  const [orderId, setOrderId] = useState(props.orderId);
  const [email, setEmail] = useState(props.email);
  const [state, setState] = useState<{ order?: BuyerOrder; error?: string }>({});

  async function search(e?: FormEvent) {
    e?.preventDefault();
    try {
      setState({ order: await api.order(orderId.trim(), email.trim()) });
    } catch (err) {
      setState({ error: (err as Error).message });
    }
  }

  useEffect(() => {
    if (props.orderId && props.email) void search();
  }, []);

  const o = state.order;
  return (
    <main style={shell}>
      <p><a href={props.basePath || '/'}>← Volver</a></p>
      <h1>Mis entradas</h1>
      <form onSubmit={search} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        <input aria-label="Número de pedido" placeholder="PED-2026-0107" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
        <input aria-label="Email" type="email" placeholder="tu@email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit">Buscar</button>
      </form>
      {state.error && <p role="alert">{state.error}</p>}
      {o && (
        <section>
          <h2>{o.event_title}</h2>
          <p>{formatDate(o.starts_at)} · {o.venue}</p>
          <p>Pedido {o.id} · {ORDER_STATUS[o.status] ?? o.status} · {formatEuros(o.total_cents)} (gastos {formatEuros(o.fee_cents)})</p>
          <div>
            {o.tickets.map((t) => {
              const label = t.seat_id ? `Butaca ${t.seat_id}` : `Pase ${t.pass_name}`;
              return t.qr_token ? (
                <TicketQR key={t.id} token={t.qr_token} label={label} filename={`${t.id}.png`} />
              ) : (
                <p key={t.id}>{label} · {t.id} · {TICKET_STATUS[t.status] ?? t.status}</p>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
