# control-acceso — contexto para agentes

Servicio que usan los lectores de QR en la puerta. Node, CommonJS, callbacks, sin tipos ni tests.
Antes de cambiar nada, lee también `../contexto-equipo/AGENTS.md` (contratos con Telón).

## Ejecutar

```bash
npm install
TELON_DB="$DATABASE_URL" node bin/validar.js "<contenido del QR>"   # una validación por consola
TELON_DB="$DATABASE_URL" npm start                                  # HTTP :4100 · POST /validar {"qr"} · GET /aforo/<evento>
```

En el Dev Container del curso, `DATABASE_URL` apunta a la base de datos de Telón. El QR de una entrada: `npm run -s qr -- <id>` desde `telon/`.

## Cómo funciona (comprobado en el código; el README no es fiable)

- Lee y escribe **directamente** la tabla `tickets` de la base de datos de Telón (`lib/db.js`, `lib/validar.js`). No usa la API, aunque el README diga `/api/v0/entradas`.
- **No comprueba la firma del QR**: toma lo que hay antes del primer punto como id de entrada (`lib/validar.js`).
- Rechaza solo `status = 'void'` (hotfix de 2024-11). Cualquier otro estado entra.
- Marca la entrada como usada con `checked_in_at`; una segunda lectura devuelve `YA_DENTRO`.
- Las consultas de `lib/validar.js` concatenan el id en el SQL (inyección). `lib/aforo.js` sí usa parámetros.

## Convenciones del repo

- `var`, callbacks `(err, resultado)`, sin punto y coma, comillas simples. Respuestas `{ ok, motivo }` con motivos en MAYÚSCULAS (`NO_EXISTE`, `YA_DENTRO`, `ANULADA`).
- Sin tests: cualquier cambio se prueba con `bin/validar.js` contra la base de datos de Telón.

## No hacer

- No cambiar el esquema de Telón desde aquí: es de otro equipo.
- No añadir dependencias para «modernizar» el repo dentro de un arreglo.
