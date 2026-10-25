# Laboratorio: mocks de la pasarela, la base de datos y el correo

[← Página anterior](01-lab-tests-y-datos.md) · [Siguiente página →](03-lab-caso-limite-redondeo.md)

La devolución de Telón habla con tres cosas que no quieres levantar en un test unitario: la pasarela de pago, PostgreSQL y el proveedor de email del promotor. En este lab pides al asistente tests con mocks en esas fronteras, revisas que simulan lo justo y terminas con un test que reproduce el reintento de la cola.

### Objetivo

Tests con mocks del cliente de la pasarela, de la regla «no se devuelve dos veces» y del correo de devolución, incluido un test que muestra el correo duplicado.

### Punto de partida

- Telón abierto en el Dev Container, carpeta `telon/`.
- Estado: `make init-m03`. No hace falta tener la plataforma arrancada: estos tests no usan servicios.
- Ficheros que vas a probar: `services/api/src/orders/payments-client.ts`, `services/api/src/refunds/service.ts` y `services/notifier/src/jobs.ts`.

### En qué consiste

Tres tests con mocks, cada uno en su frontera: `fetch` para la pasarela, los módulos `db`, `payments-client` y `queue` para el servicio de devolución, y `db` más el proveedor para el notifier. El último test se queda en rojo a propósito.

### 1 — Mock de la pasarela con `fetch`

**Acción:**

```text
Crea services/api/test/payments-client.test.ts. Simula la pasarela sustituyendo fetch con
vi.stubGlobal (no mockees payments-client, que es lo que se prueba). Casos:
- charge manda amount_cents, card y reference;
- un rechazo 402 se devuelve como resultado, no como excepción;
- si /refunds responde 409, refund() lanza HttpError con statusCode 502.
```

**Por qué:** el mock va en la frontera (`fetch`), no en la función que pruebas. Si mockeas `payments-client` para probar `payments-client`, el test no prueba nada.

**Resultado esperado:** tres tests con `vi.stubGlobal('fetch', …)` y `vi.unstubAllGlobals()` en `afterEach`. Pasan: `npm test -w @telon/api`.

### 2 — Mock de la base de datos para una regla

**Acción:**

```text
Crea services/api/test/refund-service.test.ts para requestRefund con vi.mock de
../src/db.js, ../src/orders/payments-client.js y ../src/queue.js. Caso: la entrada
PED-2026-0107-2 ya está 'refunded'. Espera un HttpError 409 y que NO se llame a refund()
de la pasarela ni a enqueueEmail. Simula pool.query devolviendo filas según el SQL
(pedido pagado con evento el 2026-11-14; la entrada con status refunded).
```

**Por qué:** la regla «solo entradas válidas» vive en `requestRefund`, entre consultas y llamadas a la pasarela. Lo que importa comprobar es que no se cobra ni se avisa cuando la regla lo impide.

**Resultado esperado:** un test que pasa. Revisa el mock de `pool.query`: tiene que devolver `{ rows: [...] }` según el texto del SQL (`FROM orders` o `FROM tickets`), no según el orden de llamada. Si depende del orden, se romperá con cualquier cambio inocente.

> [!TIP]
> `requestRefund` acepta la fecha actual como segundo argumento. Pásale `new Date('2026-10-20T10:00:00Z')` y el test no dependerá del día en que se ejecute.

### 3 — Revisa qué se ha simulado

**Acción:** en los dos ficheros nuevos, cuenta cuántos `vi.mock` y `vi.fn` hay y para qué sirve cada uno.

**Por qué:** un asistente tiende a mockearlo todo «por si acaso». Cada mock que sobra es código del test que nadie mantiene y que puede ocultar un cambio real.

**Resultado esperado:** tres `vi.mock` en el de servicio (base de datos, pasarela, cola) y ninguno en el del cliente, que solo sustituye `fetch`. Si hay mocks de `pricing.ts` o de `amounts.ts`, quítalos: son lógica pura y se prueban de verdad.

### 4 — Mock del notifier y su proveedor

**Acción:**

```text
Crea services/notifier/test/refund-email.test.ts para sendRefundConfirmed con vi.mock de
../src/db.js y ../src/providers/index.js (un proveedor falso que cuenta los envíos).
Caso: la devolución DEV-2026-0001 de PED-2026-0107 (Jazz en el Faro, 7100 céntimos,
butacas F-12 y F-13) envía un correo a ana.compradora@ejemplo.test con el importe 71,00 €.
```

**Por qué:** el proveedor es del promotor (SendGrid, SMTP…). En un test unitario no quieres enviar nada, pero sí comprobar a quién va y qué dice.

**Resultado esperado:** un test en verde que comprueba destinatario, que el asunto contiene `PED-2026-0107` y que el cuerpo contiene `71,00`.

### 5 — Simula el reintento de la cola

**Acción:**

```text
Añade un test: el primer INSERT INTO email_log falla (como si la base de datos rechazara
el registro) y el trabajo se reintenta, es decir, sendRefundConfirmed se llama dos veces
con la misma devolución. Según AGENTS.md ("lo que sale por la cola tiene que poder
reintentarse sin efectos duplicados"), el proveedor debe haber enviado UN correo.
```

**Por qué:** BullMQ reintenta un trabajo fallido hasta 3 veces (`attempts: 3` en `services/api/src/queue.ts`). Este test reproduce lo que hace la cola sin levantar Redis.

**Resultado esperado:** el test falla:

```text
AssertionError: expected 2 to be 1
```

El notifier envía y después registra. Si el registro falla, el reintento envía otra vez.

### 6 — Ejecuta todo y haz commit

**Acción:**
1. `npm test`
2. `git add services && git commit -m "Tests con mocks de pasarela, servicio de devolución y correo"`

**Por qué:** el rojo del paso 5 documenta un fallo real. Se arregla en [04 — El correo que llegaba tres veces](04-lab-debugging-correo-duplicado.md).

**Resultado esperado:** todos en verde menos el test del reintento.

## Comprueba tu entendimiento

**El mock que esconde un fallo**
En el test del paso 2, cambia el mock para que la entrada esté `valid` en lugar de `refunded`.
→ El test falla porque ahora `refund()` sí se llama. El mock describe el estado del mundo; si lo cambias, cambias la pregunta.

**Sin Redis ni PostgreSQL**
Para la plataforma (<kbd>Ctrl</kbd>+<kbd>C</kbd> en `make up-m03`) y ejecuta `npm test -w @telon/notifier`.
→ Los tests se ejecutan igual: ninguno necesita servicios.

## Reto

### 1 — El mock que no hacía falta

Uno de los tres mocks del test de servicio se puede quitar sin que el test deje de comprobar la regla. ¿Cuál, y qué pierdes si lo quitas?

<details>
<summary>Ver solución</summary>

Ninguno es gratis. Sin el mock de `queue.js`, el import de `queue.ts` crea una conexión a Redis al encolar; como la regla corta antes de encolar, el test seguiría pasando, pero quedaría una conexión colgada si alguien cambia el orden. Sin el de `payments-client.js` pasaría lo mismo con `fetch`. Lo que perderías es la comprobación «no se llama a la pasarela», que es la mitad de la regla. Quitar mocks está bien cuando la dependencia es pura; aquí no lo es.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `vi.mock` no surte efecto | El import del módulo probado va antes del `vi.mock` y no se eleva | Importa el módulo con `await import(...)` después del `vi.mock`, o confía en el hoisting de Vitest sin `import` dinámicos raros |
| El test cuelga al terminar | Una conexión real a Redis o PostgreSQL abierta | Falta el mock de `queue.js` o de `db.js` |
| `fetch is not defined` tras el test | No se restauró el global | `afterEach(() => vi.unstubAllGlobals())` |
