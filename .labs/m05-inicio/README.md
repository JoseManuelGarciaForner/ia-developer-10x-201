# Telón

SaaS de venta de entradas para promotores de espectáculos. Cada promotor configura sus dominios,
diseña en TSX las páginas de sus eventos y vende con los componentes de la plataforma.

## Arrancar

Dentro del Dev Container (local o Codespaces), desde `telon/`:

```bash
make up-m05        # o: npm run dev
```

La primera vez, la API crea el esquema y carga los datos de ejemplo. Para volver a ellos: `npm run db:reset`.

| Servicio | URL |
|----------|-----|
| Tienda | http://localhost:5173 · Sala Faro: http://entradas.salafaro.localhost:5173 o http://localhost:5173/t/sala-faro |
| Backoffice | http://localhost:5174 (token `faro-dev-token`) |
| API | http://localhost:3000 · contrato en [`openapi.yaml`](openapi.yaml) |
| Pasarela emulada | http://localhost:3001 |
| Mailpit (correos) | http://localhost:8025 |

## Estructura

| Ruta | Qué es |
|------|--------|
| `apps/storefront` | Tienda pública. Resuelve el promotor por dominio o por `/t/<slug>` y compila el TSX de la página |
| `apps/backoffice` | Panel del promotor: eventos, dominios, proveedor de email, pedidos |
| `apps/editor-mfe` | Editor (Monaco) como microfrontend, embebido en el backoffice |
| `services/api` | API REST (Fastify + PostgreSQL). Migraciones en `migrations/` |
| `services/payments` | Pasarela de pago emulada |
| `services/notifier` | Worker de la cola `emails` (BullMQ + Redis) |
| `packages/ui` | Componentes troncales para las páginas de los promotores ([documentación](docs/componentes/)) |
| `packages/page-runtime` | Compilación y render del TSX de los promotores |

## Correo

Cada promotor elige su proveedor en el backoffice: SMTP, SendGrid, Mailgun, Amazon SES o Postmark.
En este entorno solo SMTP envía de verdad, a Mailpit. El resto están emulados: comprueban la
configuración, registran el envío en «Pedidos y correos» y no sale nada a internet.

## Tarjetas de prueba

| Tarjeta | Resultado |
|---------|-----------|
| `4242 4242 4242 4242` | Aprobada |
| `4000 0000 0000 0002` | Rechazada (fondos insuficientes) |
| `4000 0000 0000 9995` | Aprobada tras 3 s |

## Datos de prueba

`npm run escenario` añade al evento de la Sala Faro pedidos de prueba en distintos estados
(pagados, rechazados, con devolución) y un evento a menos de 48 h, para probar las devoluciones.

## Comprobar

```bash
npm test          # Vitest en todos los paquetes
npm run lint
npm run typecheck
```
