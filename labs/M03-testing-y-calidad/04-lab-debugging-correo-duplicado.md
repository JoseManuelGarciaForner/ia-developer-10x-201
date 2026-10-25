# Laboratorio: el correo que llegaba tres veces

[← Página anterior](03-lab-caso-limite-redondeo.md) · [Siguiente página →](../M04-documentacion-y-automatizacion/README.md)

Una compradora de la Sala Faro escribe al soporte: ha devuelto dos entradas y le han llegado tres correos de confirmación. ¿Le han devuelto el dinero tres veces? En este lab reproduces el fallo en Mailpit, le das al asistente la traza completa y le pides la causa antes que el arreglo. Después eliges entre el arreglo que tapa este caso y el que evita la familia entera de fallos.

### Objetivo

El correo de devolución sale una sola vez aunque la cola reintente el trabajo, comprobado en un test y en Mailpit.

### Punto de partida

- El proyecto Telón abierto en el Dev Container, carpeta `telon/`.
- Estado: `make init-m03` y `make up-m03` arrancado en otra terminal (la necesitas para ver la traza del notifier).
- Mailpit abierto (local: `http://localhost:8025`; Codespaces: pestaña **Ports** → **Mailpit (8025)**).

### En qué consiste

Reproducir, leer la traza, diagnosticar con el asistente, decidir el arreglo, probarlo con un test y verificar en Mailpit. Tocas `services/notifier` y una migración nueva.

### 1 — Reproduce el fallo

**Acción:**
1. `npm run db:reset`
2. En Mailpit, pulsa **Delete all** para empezar con la bandeja vacía.
3. Devuelve F-12 y F-13 del pedido de Ana:

```bash
curl -s localhost:3000/api/public/orders/PED-2026-0107/refunds \
  -H 'x-telon-tenant-slug: sala-faro' -H 'content-type: application/json' \
  -d '{"email":"ana.compradora@ejemplo.test","ticket_ids":["PED-2026-0107-1","PED-2026-0107-2"]}'
```

4. Espera diez segundos y refresca Mailpit.

**Por qué:** un fallo que no reproduces no lo puedes dar por arreglado. Con la base de datos limpia y la bandeja vacía, lo que veas es de este intento.

**Resultado esperado:** la API responde con `DEV-2026-0001`. En Mailpit hay **tres** correos iguales: «Confirmación de devolución de entradas para Jazz en el Faro — pedido PED-2026-0107».

![Tres correos de la misma devolución en Mailpit](../img/M03-04-mailpit-tres-correos.png)

### 2 — Lee la traza del notifier

**Acción:** en la terminal de `make up-m03`, busca las líneas `[correo]` de `refund-confirmed`.

**Por qué:** la traza dice qué falló y cuántas veces. Es lo primero que le vas a dar al asistente, entera y sin resumir.

**Resultado esperado:**

```text
[correo] → refund-confirmed #3 (intento 1)
[correo] ✗ refund-confirmed #3: value too long for type character varying(80)
[correo] → refund-confirmed #3 (intento 2)
[correo] ✗ refund-confirmed #3: value too long for type character varying(80)
[correo] → refund-confirmed #3 (intento 3)
[correo] ✗ refund-confirmed #3: value too long for type character varying(80)
```

El número del trabajo (`#3`) puede ser otro. El trabajo falla las tres veces y aun así llegan tres correos.

### 3 — Pide la causa, no el arreglo

**Acción:** en un chat nuevo:

```text
Fallo: al devolver entradas, la compradora recibe 3 correos de confirmación. Traza del notifier:
[pega las seis líneas]
Ficheros: services/notifier/src/jobs.ts (sendRefundConfirmed, logEmail),
services/api/src/queue.ts (enqueueEmail), services/api/migrations/001_init.sql (email_log).
Explícame la causa paso a paso. No propongas arreglo todavía.
```

**Por qué:** con la traza, los ficheros y la orden de no arreglar, el asistente razona sobre el código real. Sin la orden, suele saltar al primer arreglo que hace desaparecer el error.

**Resultado esperado:** la cadena completa:
1. `sendRefundConfirmed` envía el correo y **después** llama a `logEmail`.
2. El asunto mide 82 caracteres y `email_log.subject` es `varchar(80)`: el `INSERT` falla.
3. El trabajo lanza una excepción y BullMQ lo reintenta (`attempts: 3`).
4. Cada reintento vuelve a enviar antes de volver a fallar.

### 4 — Compara dos arreglos

**Acción:**

```text
Dame dos arreglos posibles con su diff aproximado:
A) el mínimo que hace desaparecer este error;
B) el que garantiza que un correo no sale dos veces aunque falle cualquier paso después del
   envío, según la regla de AGENTS.md sobre la cola.
¿Qué fallos futuros evita B que A no evita?
```

**Por qué:** el diff más pequeño que deja el test en verde no siempre es el arreglo bueno. Ampliar la columna arregla este asunto largo, pero mañana fallará otra cosa después del envío (la red, un `deadlock`) y volverán los duplicados.

**Resultado esperado:**
- **A:** ampliar `subject` a `text` con una migración nueva.
- **B:** idempotencia. Antes de enviar se reserva una clave única (`refund-confirmed:DEV-2026-0001`) en `email_log`; si ya existe, no se envía; si el envío falla, se libera la clave para que el reintento lo intente de nuevo.

B evita los duplicados por cualquier fallo posterior al envío, y también si alguien encola el mismo trabajo dos veces.

### 5 — Escribe el test antes del arreglo

**Acción:**

```text
Crea services/notifier/test/once.test.ts para una función sendOnce(key, tenantId, provider,
email, jobId) que todavía no existe, en services/notifier/src/once.ts. Mockea ../src/db.js
simulando la restricción única de dedupe_key. Casos:
- llamada dos veces con la misma clave → el proveedor envía una vez y la segunda devuelve
  'already-sent';
- si el proveedor falla la primera vez, la segunda llamada sí envía.
```

**Por qué:** el test fija qué significa «una sola vez», incluido el caso del fallo de envío, que es el que un arreglo con prisa olvida: si reservas la clave y el envío falla, el correo no saldría nunca.

**Resultado esperado:** el test falla porque `once.ts` no existe.

### 6 — Implementa el arreglo B

**Acción:**

```text
Implementa:
1. Migración services/api/migrations/003_email_once.sql: subject a text y columna dedupe_key
   text UNIQUE en email_log.
2. services/notifier/src/once.ts con sendOnce: INSERT ... ON CONFLICT (dedupe_key) DO NOTHING
   RETURNING id; si no hay fila, 'already-sent'; si no, enviar; si el envío falla, DELETE de la
   clave y relanzar.
3. Usa sendOnce en sendOrderConfirmed y sendRefundConfirmed con las claves
   order-confirmed:<pedido> y refund-confirmed:<devolución>.
No toques los tests.
```

**Por qué:** la migración amplía la columna (el arreglo A va incluido) y añade la clave. `sendOnce` deja la regla en un solo sitio, y la confirmación de compra tenía el mismo fallo latente.

**Resultado esperado:** diff en `services/api/migrations/`, `services/notifier/src/once.ts` y `jobs.ts`. `logEmail` deja de usarse en los dos correos transaccionales.

### 7 — Pasa los tests

**Acción:** `npm test && npm run typecheck && npm run lint`

**Por qué:** el test del paso 5 pasa a verde y el resto sigue igual.

**Resultado esperado:** todo en verde.

### 8 — Verifica en Mailpit

**Acción:**
1. Comprueba que `[api]` y `[correo]` se han reiniciado solos al cambiar los ficheros (si no, reinicia `make up-m03`). La API aplica la migración 003 al arrancar.
2. `npm run db:reset`, **Delete all** en Mailpit y repite el `curl` del paso 1.

**Por qué:** el test prueba `sendOnce` con una base de datos simulada; esto prueba el sistema real, con PostgreSQL, Redis y Mailpit.

**Resultado esperado:** un único correo en Mailpit, y en la traza `✓ refund-confirmed` al primer intento.

![Un solo correo de la devolución en Mailpit](../img/M03-04-mailpit-un-correo.png)

### 9 — Haz commit

**Acción:** `git add services && git commit -m "Correos idempotentes: una devolución, un correo"`

**Por qué:** el arreglo, su migración y su test van juntos.

**Resultado esperado:** commit con la migración 003, `once.ts`, `jobs.ts` y el test.

## Comprueba tu entendimiento

**Encolar dos veces**
Con el arreglo puesto, pide al asistente un script de una sola vez que encole a mano otro trabajo `refund-confirmed` para `DEV-2026-0001`.
→ El notifier lo procesa con `✓`, pero en Mailpit no aparece un segundo correo: la clave ya existe.

**El proveedor caído**
En el backoffice (`faro-dev-token`), cambia el proveedor de la Sala Faro a **Mailgun (emulado)** sin rellenar `domain` y haz una devolución nueva.
→ La traza muestra `✗ … mailgun: falta configurar domain` en los tres intentos y no queda ninguna fila de esa devolución en `email_log`: la clave se libera en cada fallo. Vuelve a **SMTP** al terminar.

## Reto

### 1 — ¿Y si falla después de enviar y antes de nada más?

Con `sendOnce`, imagina que el proceso del notifier muere justo después de que el proveedor acepte el correo y antes de que `sendOnce` devuelva. ¿Llega el correo una vez, dos o ninguna?

<details>
<summary>Ver solución</summary>

Una. La clave se reservó antes de enviar y no se libera porque el proceso murió sin pasar por el `catch`. Cuando BullMQ reintente el trabajo (lo marcará como bloqueado y lo reprocesará), `sendOnce` encontrará la clave y no reenviará. El caso contrario, que el proceso muera tras reservar y antes de enviar, deja la clave sin correo: no llegaría ninguno. Ningún diseño da «exactamente una vez» con un proveedor externo. Este elige «como mucho una vez» para correos de confirmación, y para detectar el caso raro bastaría con guardar el `messageId` del proveedor tras enviar y revisar las claves que no lo tengan.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| Siguen llegando tres correos | El notifier no se ha reiniciado o la migración 003 no se aplicó | Reinicia `make up-m03`; la línea `[api] migraciones aplicadas: 003_email_once.sql` lo confirma |
| `there is no unique or exclusion constraint matching the ON CONFLICT` | La columna `dedupe_key` no tiene `UNIQUE` | Revisa la migración 003 y repite `npm run db:reset` |
| El test de `sendOnce` cuelga | `once.ts` importa el `pool` real | El `vi.mock('../src/db.js')` tiene que ir antes de importar `once.ts` |
