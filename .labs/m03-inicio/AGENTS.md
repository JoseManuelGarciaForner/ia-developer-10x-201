# Telón — contexto para agentes

SaaS multi-tenant de venta de entradas. Un promotor (tenant) configura dominios y diseña en TSX
las páginas de sus eventos con los componentes de `@telon/ui`. El comprador paga y recibe sus QR por correo.

## Cómo se arranca y se prueba

- Todo en el Dev Container (o `make up-docker`). `make up-mXX` arranca la plataforma; `npm run dev` desde `telon/` también.
- Tienda `:5173` (promotor por dominio `*.localhost` o por ruta `/t/<slug>`), backoffice `:5174`, API `:3000`, pagos `:3001`, Mailpit `:8025`.
- `npm test` (Vitest, todos los paquetes) · `npm run lint` · `npm run typecheck` · `npm run db:reset`.
- Antes de dar un cambio por bueno: tests, lint y typecheck en verde.

## Mapa

| Ruta | Qué es |
|------|--------|
| `services/api` | Fastify + PostgreSQL. Rutas en `src/routes/`, lógica en `src/orders/`, `src/refunds/`. Migraciones SQL en `migrations/` (se aplican al arrancar) |
| `services/payments` | Pasarela emulada: `/charges`, `/refunds`. Tarjetas de prueba en `src/gateway.ts` |
| `services/notifier` | Worker BullMQ de la cola `emails`. Proveedores en `src/providers/` (SMTP → Mailpit; el resto emulados) |
| `packages/ui` | Componentes troncales que usan las páginas de los promotores |
| `packages/page-runtime` | Compila el TSX del promotor en el navegador (sucrase) |
| `apps/storefront`, `apps/backoffice`, `apps/editor-mfe` | Tienda, panel del promotor y editor Monaco como microfrontend (iframe + postMessage) |

## Convenciones

- TypeScript estricto, ESM, imports con extensión `.js`. Identificadores en inglés; textos de cara al usuario y mensajes de error en español.
- Importes siempre en céntimos (`*_cents`, enteros). Nunca floats para dinero.
- Errores HTTP con `HttpError(status, mensaje)`; el manejador global los traduce.
- SQL parametrizado (`$1`), nunca concatenado. Cambios de esquema = migración nueva numerada; no se editan migraciones aplicadas.
- Lo que sale por la cola tiene que poder reintentarse sin efectos duplicados.

## Reglas de negocio

- Un pedido pagado no se modifica. Cambios posteriores (devoluciones) son registros nuevos que lo referencian.
- Gastos de gestión: por entrada, no se reembolsan nunca.
- Comisión de plataforma: `commission_bps` sobre el precio, **redondeada por entrada**. La de un pedido o una devolución es la suma de las de sus entradas.
- Devoluciones: solo de pedidos pagados, solo entradas válidas, hasta 48 h antes del evento. La entrada devuelta deja de validar en puerta y su butaca vuelve a la venta.
- Máximo 10 entradas por pedido.

## Datos de ejemplo

Sala Faro (`TN-FARO`, token `faro-dev-token`, `entradas.salafaro.localhost`), evento `EV-FARO-0042`,
pedido `PED-2026-0107` de `ana.compradora@ejemplo.test`: butacas F-12 y F-13 y un pase VIP.

## No hacer

- No pegar en el chat ni en el código credenciales reales ni API keys de proveedores de los promotores.
- No añadir dependencias sin comprobar que existen en npm y que hacen falta.
- No tocar `migrations/` ya aplicadas, `package-lock.json` a mano ni los datos de ejemplo para que un test pase.
