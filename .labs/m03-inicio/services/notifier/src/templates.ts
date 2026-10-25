const euros = (cents: number) =>
  (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

const date = (iso: string | Date) =>
  new Date(iso).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/Madrid' });

export interface OrderEmailData {
  tenantName: string;
  orderId: string;
  eventTitle: string;
  venue: string;
  startsAt: string | Date;
  totalCents: number;
  ticketsUrl: string;
  tickets: { id: string; label: string; cid: string }[];
}

export function orderConfirmedEmail(d: OrderEmailData) {
  const subject = `Tus entradas para ${d.eventTitle} — ${d.orderId}`;
  const rows = d.tickets
    .map(
      (t) => `<tr><td style="padding:12px;border-bottom:1px solid #ddd">
        <strong>${t.label}</strong><br><small>${t.id}</small></td>
        <td style="padding:12px;border-bottom:1px solid #ddd"><img src="cid:${t.cid}" width="160" height="160" alt="QR ${t.id}"></td></tr>`,
    )
    .join('');
  const html = `<div style="font-family:system-ui,sans-serif;max-width:560px">
    <h1 style="font-size:22px">${d.eventTitle}</h1>
    <p>${date(d.startsAt)} · ${d.venue}</p>
    <p>Pedido <strong>${d.orderId}</strong> · Total ${euros(d.totalCents)}</p>
    <table style="border-collapse:collapse;width:100%">${rows}</table>
    <p>Enseña el QR en la puerta. También puedes descargarlo en <a href="${d.ticketsUrl}">tus entradas</a>.</p>
    <p style="color:#777;font-size:12px">${d.tenantName} vende sus entradas con Telón.</p>
  </div>`;
  const text = `${d.eventTitle}\n${date(d.startsAt)} · ${d.venue}\nPedido ${d.orderId} · Total ${euros(d.totalCents)}\n` +
    d.tickets.map((t) => `- ${t.label} (${t.id})`).join('\n') + `\nTus entradas: ${d.ticketsUrl}\n`;
  return { subject, html, text };
}

export interface RefundEmailData {
  tenantName: string;
  refundId: string;
  orderId: string;
  eventTitle: string;
  amountCents: number;
  tickets: string[];
}

export function refundConfirmedEmail(d: RefundEmailData) {
  const subject = `Confirmación de devolución de entradas para ${d.eventTitle} — pedido ${d.orderId}`;
  const list = d.tickets.map((t) => `<li>${t}</li>`).join('');
  const html = `<div style="font-family:system-ui,sans-serif;max-width:560px">
    <h1 style="font-size:22px">Devolución ${d.refundId}</h1>
    <p>Hemos devuelto estas entradas de tu pedido <strong>${d.orderId}</strong> para ${d.eventTitle}:</p>
    <ul>${list}</ul>
    <p>Importe devuelto: <strong>${euros(d.amountCents)}</strong>. Los gastos de gestión no se reembolsan.</p>
    <p>Los QR de estas entradas ya no son válidos.</p>
    <p style="color:#777;font-size:12px">${d.tenantName} vende sus entradas con Telón.</p>
  </div>`;
  const text = `Devolución ${d.refundId} del pedido ${d.orderId} (${d.eventTitle})\n` +
    d.tickets.map((t) => `- ${t}`).join('\n') + `\nImporte devuelto: ${euros(d.amountCents)}. Los gastos de gestión no se reembolsan.\n`;
  return { subject, html, text };
}
