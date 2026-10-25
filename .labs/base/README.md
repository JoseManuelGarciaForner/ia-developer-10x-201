# Telón

Plataforma de venta de entradas para promotores de espectáculos.

## Arrancar

```bash
npm install
npm run seed      # carga los datos de ejemplo
npm run dev
```

- API: http://localhost:8080
- Tienda: http://localhost:5173
- Backoffice: http://localhost:5174

## Estructura

- `apps/storefront` — tienda pública
- `apps/backoffice` — panel del promotor
- `services/api` — API REST
- `services/notifier` — envío de correos con SendGrid
- `packages/ui` — componentes

## Correo

Los correos de confirmación se envían con SendGrid. Configura la API key en `SENDGRID_API_KEY`.

## Tests

```bash
npm test
```
