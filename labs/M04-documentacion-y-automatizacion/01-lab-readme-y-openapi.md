# Laboratorio: README y OpenAPI comprobados

[← Página anterior](00-documentar-lo-que-hay.md) · [Siguiente página →](02-lab-script-y-snippets.md)

El README del proyecto Telón engaña al primero que llega, y el endpoint de devolución no tiene documentación. En este lab reescribes el README con el asistente, comprobando cada afirmación, y generas el contrato OpenAPI del endpoint nuevo. Después lo validas con un linter y con una petición real.

### Objetivo

Un `README.md` en el que todo comando funciona y toda URL responde, y un `openapi.yaml` válido que describe `GET /api/public/orders/{id}` y `POST /api/public/orders/{id}/refunds` tal como se comportan.

### Punto de partida

- El repositorio del curso abierto en el Dev Container (local o Codespaces), con dos terminales en `telon/`.
- Terminal 1: `CONFIRM=1 make init-m04`; responde `telon/ está en el punto de partida de m04.` La devolución está implementada y probada, y el README es el heredado.
- Terminal 2: `make up-m04`, y déjala abierta.
- Un asistente en modo agente:

| Asistente | Cómo abrir una conversación nueva |
|-----------|-----------------------------------|
| VS Code o Codespaces + Copilot | <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>I</kbd> → **+** → modo **Agent** bajo la caja de texto |
| Cursor | <kbd>Ctrl</kbd>+<kbd>L</kbd> → **+** → modo **Agent** |
| Claude Code | En una terminal nueva, dentro de `telon/`: `claude` |

> [!NOTE]
> El asistente tiene el código y `AGENTS.md`, que su herramienta carga al abrir cada conversación. `AGENTS.md` no dice nada del README: si no le pides que compruebe, lo da por bueno.

### En qué consiste

Auditoría del README, reescritura, generación del OpenAPI, validación con `@redocly/cli` y una petición de ejemplo. Tocas `README.md` y creas `openapi.yaml`.

### 1 — Audita el README

**Acción:** ve al chat, abre una conversación nueva, pega esto y pulsa <kbd>Enter</kbd>:

```text
Revisa README.md afirmación por afirmación. Para cada comando, ejecútalo. Para cada URL, haz
una petición con curl. Para cada afirmación sobre el código, busca el fichero que la demuestra.
Devuélveme una tabla: afirmación | cómo lo has comprobado | ¿cierta? No cambies nada todavía.
```

**Por qué:** la documentación se verifica igual que el código: ejecutándola. Pedir la tabla antes de reescribir te deja ver qué ha comprobado de verdad el asistente.

**Resultado esperado:** el agente pide permiso para cada comando (`npm run seed`, varios `curl`, búsquedas). Acéptalos: solo leen o fallan sin efectos. Después devuelve la tabla, con al menos estas filas marcadas como falsas:

| Afirmación | Comprobación |
|------------|--------------|
| `npm run seed` carga los datos | `Missing script: "seed"` |
| API en `http://localhost:8080` | `curl` rechazado; responde en el 3000 |
| Correos con SendGrid | El proveedor lo elige cada promotor (`services/notifier/src/providers/`) |
| `SENDGRID_API_KEY` | No aparece en el código |

### 2 — Comprueba tú dos filas

**Acción:** en la terminal 1:

```bash
npm run seed
curl -s localhost:3000/api/health
```

**Por qué:** el asistente también puede equivocarse al comprobar (por ejemplo, ejecutando desde otra carpeta). Dos comprobaciones tuyas bastan para saber si la tabla es fiable.

**Resultado esperado:** `npm error Missing script: "seed"` y `{"ok":true}`.

### 3 — Reescribe el README

**Acción:** en el mismo chat, pega esto y pulsa <kbd>Enter</kbd>:

```text
Reescribe README.md solo con lo comprobado. Incluye: qué es el proyecto, cómo se arranca (make
up-mXX o npm run dev), tabla de URLs (tienda, backoffice, API, pasarela, Mailpit), estructura
de carpetas, proveedores de correo (SMTP real a Mailpit; el resto emulados), tarjetas de
prueba de services/payments/src/gateway.ts y cómo se prueba. Sin instrucciones que no hayas
ejecutado.
```

**Por qué:** cada línea del README nuevo tiene detrás una comprobación de la tabla. Lo que no se ha comprobado no entra.

**Resultado esperado:** el agente modifica `README.md`. Ábrelo (<kbd>Ctrl</kbd>+<kbd>P</kbd> → `README.md`, el de la raíz de `telon/`): sin `seed`, sin 8080 y sin SendGrid como proveedor único, con las tres tarjetas de prueba. Mira también qué ha añadido que no estaba en la tabla: es lo que suele inventar (un `npm run build`, un apartado de despliegue).

### 4 — Ejecuta el README en una terminal limpia

**Acción:** abre una terminal nueva (**+** del panel de terminal) y ejecuta, copiándolos del README, todos los comandos que aparezcan. No ejecutes los que arrancan la plataforma (`make up-…`, `npm run dev`): ya está arrancada en la terminal 2.

**Por qué:** es la prueba que hará la próxima persona que llegue al equipo. Si un comando falla aquí, fallará allí.

**Resultado esperado:** todos funcionan. Si alguno falla, corrígelo en el README, no en el código.

### 5 — Genera el OpenAPI desde el código

**Acción:** ve al chat, abre una conversación nueva, pega esto y pulsa <kbd>Enter</kbd>:

```text
Crea openapi.yaml (OpenAPI 3.1) para GET /api/public/orders/{orderId} y POST
/api/public/orders/{orderId}/refunds, a partir de services/api/src/routes/public.ts,
services/api/src/refunds/service.ts y services/api/src/orders/service.ts. Incluye:
- la cabecera x-telon-tenant-slug;
- el cuerpo de la devolución y la respuesta 201 con un ejemplo de PED-2026-0107;
- cada código de error que el código puede devolver (mira los HttpError) con su mensaje.
Sácalo del código, no de lo que sueles ver en APIs parecidas.
```

**Por qué:** un contrato escrito a partir de la idea de la API inventa códigos y campos. Escrito desde los `HttpError` del código, cada respuesta documentada existe.

**Resultado esperado:** `openapi.yaml` en la raíz de `telon/`, con las dos rutas y las respuestas 201, 400, 404, 409 y 502. El 409 incluye el mensaje del plazo de 48 h. Sin la última frase del prompt, lo habitual es que aparezcan respuestas que el código no devuelve, como `401` o `500` con un esquema de error genérico.

### 6 — Valida el esquema

**Acción:** en la terminal 1, `npx -y @redocly/cli@2 lint openapi.yaml`

**Por qué:** un OpenAPI que no valida no lo pueden usar los generadores de clientes ni los portales de documentación. Además, el linter encuentra errores de YAML que a simple vista no se ven.

**Resultado esperado:** `Your API description is valid`. Si aparece `security-defined`, declara `security: []` en la raíz (estos endpoints son públicos). Si aparece `Property … is not expected here` en una `description`, es una coma dentro de un valor sin comillas: entrecomíllalo.

> [!TIP]
> `@redocly/cli` no se añade al proyecto: `npx` lo descarga para esta comprobación. Antes de ejecutar un paquete que te proponga el asistente, comprueba que existe: `npm view @redocly/cli version`.

### 7 — Contrasta el contrato con una petición real

**Acción:** en la terminal 1:

```bash
npm run db:reset
curl -s localhost:3000/api/public/orders/PED-2026-0107/refunds \
  -H 'x-telon-tenant-slug: sala-faro' -H 'content-type: application/json' \
  -d '{"email":"ana.compradora@ejemplo.test","ticket_ids":["PED-2026-0107-2"]}'
```

Compara la respuesta, campo a campo, con el ejemplo de la respuesta 201 de `openapi.yaml`. Repite la misma petición.

**Por qué:** un esquema válido puede describir otra API. La petición real es la que dice si los nombres, los tipos y los códigos coinciden.

**Resultado esperado:** la primera petición devuelve `201` con `id`, `order_id`, `ticket_ids`, `amount_cents: 3550` y `commission_reversed_cents: 266`. La segunda devuelve `409` con «la entrada PED-2026-0107-2 no se puede devolver (refunded)». Los dos casos tienen que estar en el contrato.

### 8 — Haz commit

**Acción:** en la terminal 1, `git add README.md openapi.yaml && git commit -m "README comprobado y OpenAPI de devoluciones"`

**Por qué:** la documentación va al repositorio como el código, y entra por la misma revisión en el M05.

**Resultado esperado:** commit con los dos ficheros.

## Comprueba tu entendimiento

**El README nuevo, de cero**
Pregunta en un chat nuevo: «Según el README, ¿cómo cargo los datos de ejemplo y en qué puerto está la API?».
→ Responde con lo que dice el README nuevo (`npm run db:reset`, puerto 3000), que ahora coincide con el código.

**Un código de error que falta**
Devuelve una entrada de un pedido que no existe (`PED-2026-9999`).
→ `404` con «no hay ningún pedido con ese número y ese email». Si el `404` no está en tu `openapi.yaml`, añádelo.

## Reto

### 1 — Que el asistente pruebe el contrato contra la API

Un OpenAPI válido puede describir otra API. Escribe un prompt para que el asistente compruebe `openapi.yaml` contra la API arrancada: que haga las peticiones reales de cada respuesta documentada (201, 400, 404, 409) y compare, campo a campo, la respuesta con el esquema. Que te devuelva una tabla de diferencias y no cambie nada.

<details>
<summary>Ver solución</summary>

Un prompt que funciona:

```text
Comprueba openapi.yaml contra la API que está corriendo en localhost:3000. Para cada ruta y
cada código de respuesta documentado, construye una petición con curl que lo provoque
(usa PED-2026-0107 y ana.compradora@ejemplo.test; ejecuta npm run db:reset antes si hace
falta) y compara la respuesta real con el esquema: campos que sobran, que faltan, tipos y
nulos. Devuélveme una tabla de diferencias. No cambies openapi.yaml.
```

Lo que suele salir en `GET /api/public/orders/{orderId}`: la respuesta real incluye `event_id`, `event_title`, `venue`, `starts_at`, `paid_at`, `subtotal_cents` y `refunds`, además de las entradas (`getBuyerOrder` en `services/api/src/orders/service.ts`). Es habitual que el esquema se deje `refunds` o invente `currency`. En las entradas, `qr_token` es `null` si la entrada no es válida, y el esquema debería decir `type: [string, 'null']`.

La habilidad es que el asistente compruebe su propio trabajo contra la realidad, con un formato (la tabla) que te deja revisar el resultado sin repetir las peticiones.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| El asistente «comprueba» sin ejecutar nada | Modo chat en lugar de agente, o sin permiso para la terminal | Cambia a modo agente y acepta la ejecución de comandos de solo lectura |
| `curl: (7) Failed to connect to localhost port 3000` | El proyecto no está arrancado | `make up-m04` en otra terminal |
| La devolución da `409 … no se puede devolver (refunded)` a la primera | Ya la devolviste antes | `npm run db:reset` |
| `npx` tarda mucho o falla | Sin salida a npmjs.org (proxy) | Configura el proxy de tu red en npm (`npm config set proxy …`) o valida con una extensión de OpenAPI del editor |
