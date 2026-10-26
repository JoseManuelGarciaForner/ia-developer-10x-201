# Laboratorio: mocks de la pasarela, la base de datos y el correo

[← Página anterior](01-lab-tests-y-datos.md) · [Siguiente página →](03-lab-caso-limite-redondeo.md)

La devolución del proyecto Telón habla con tres cosas que no quieres levantar en un test unitario: la pasarela de pago, PostgreSQL y el proveedor de email del promotor. En este lab pides al asistente tests con mocks en esas fronteras, revisas que simulan lo justo y terminas con un test que reproduce el reintento de la cola.

### Objetivo

Tests con mocks del cliente de la pasarela, de la regla «no se devuelve dos veces» y del correo de devolución, incluido un test que muestra el correo duplicado.

### Punto de partida

- El repositorio del curso abierto en el Dev Container (local o Codespaces). El explorador muestra la carpeta `telon/`.
- Una terminal en `telon/`. Escribe `CONFIRM=1 make init-m03`; responde `telon/ está en el punto de partida de m03.` No hace falta arrancar la plataforma: estos tests no usan servicios.
- Ficheros que vas a probar: `services/api/src/orders/payments-client.ts`, `services/api/src/refunds/service.ts` y `services/notifier/src/jobs.ts`.
- Un asistente en modo agente:

| Asistente | Cómo abrir una conversación nueva |
|-----------|-----------------------------------|
| VS Code o Codespaces + Copilot | <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>I</kbd> → **+** → modo **Agent** bajo la caja de texto |
| Cursor | <kbd>Ctrl</kbd>+<kbd>L</kbd> → **+** → modo **Agent** |
| Claude Code | En una terminal nueva, dentro de `telon/`: `claude` |

> [!NOTE]
> El asistente tiene el código y `AGENTS.md`, que su herramienta carga al abrir cada conversación. Sobre cómo hacer mocks no hay nada escrito en el proyecto: lo que proponga sale de lo que sabe de Vitest en general, y por eso hay que revisarlo.

### En qué consiste

Tres tests con mocks, cada uno en su frontera: `fetch` para la pasarela, los módulos `db`, `payments-client` y `queue` para el servicio de devolución, y `db` más el proveedor para el notifier. El último test se queda en rojo a propósito.

### 1 — Mock de la pasarela con `fetch`

**Acción:** ve al chat, abre una conversación nueva, pega esto y pulsa <kbd>Enter</kbd>:

```text
Crea services/api/test/payments-client.test.ts. Simula la pasarela sustituyendo fetch con
vi.stubGlobal (no mockees payments-client, que es lo que se prueba). Casos:
- charge manda amount_cents, card y reference;
- un rechazo 402 se devuelve como resultado, no como excepción;
- si /refunds responde 409, refund() lanza HttpError con statusCode 502.
```

**Por qué:** el mock va en la frontera (`fetch`), no en la función que pruebas. Si mockeas `payments-client` para probar `payments-client`, el test no prueba nada.

**Resultado esperado:** el agente crea `services/api/test/payments-client.test.ts` con tres tests que usan `vi.stubGlobal('fetch', …)` y `vi.unstubAllGlobals()` en `afterEach`, y los ejecuta. Si no los ejecuta, hazlo tú en la terminal: `npm test -w @telon/api`. Pasan.

Si el modelo usa `vi.mock('../src/orders/payments-client.js')` en lugar de sustituir `fetch`, el test no prueba nada: pídele que lo rehaga sin ese mock. Es un error frecuente, porque «mockear el cliente HTTP» es lo más común en los ejemplos.

### 2 — Mock de la base de datos para una regla

**Acción:** en el mismo chat, pega esto y pulsa <kbd>Enter</kbd>:

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

**Acción:** abre los dos ficheros nuevos (<kbd>Ctrl</kbd>+<kbd>P</kbd>) y cuenta cuántos `vi.mock` y `vi.fn` hay y para qué sirve cada uno.

**Por qué:** un asistente tiende a mockearlo todo «por si acaso». Cada mock que sobra es código del test que nadie mantiene y que puede ocultar un cambio real.

**Resultado esperado:** tres `vi.mock` en el de servicio (base de datos, pasarela, cola) y ninguno en el del cliente, que solo sustituye `fetch`. Si hay mocks de `pricing.ts` o de `amounts.ts`, quítalos: son lógica pura y se prueban de verdad.

### 4 — Mock del notifier y su proveedor

**Acción:** en el mismo chat, pega esto y pulsa <kbd>Enter</kbd>:

```text
Crea services/notifier/test/refund-email.test.ts para sendRefundConfirmed con vi.mock de
../src/db.js y ../src/providers/index.js (un proveedor falso que cuenta los envíos).
Caso: la devolución DEV-2026-0001 de PED-2026-0107 (Jazz en el Faro, 7100 céntimos,
butacas F-12 y F-13) envía un correo a ana.compradora@ejemplo.test con el importe 71,00 €.
```

**Por qué:** el proveedor es del promotor (SendGrid, SMTP…). En un test unitario no quieres enviar nada, pero sí comprobar a quién va y qué dice.

**Resultado esperado:** un test en verde que comprueba destinatario, que el asunto contiene `PED-2026-0107` y que el cuerpo contiene `71,00`.

### 5 — Simula el reintento de la cola

**Acción:** en el mismo chat, pega esto y pulsa <kbd>Enter</kbd>:

```text
Añade un test: el primer INSERT INTO email_log falla (como si la base de datos rechazara
el registro) y el trabajo se reintenta, es decir, sendRefundConfirmed se llama dos veces
con la misma devolución. Según AGENTS.md ("lo que sale por la cola tiene que poder
reintentarse sin efectos duplicados"), el proveedor debe haber enviado UN correo.
```

**Por qué:** BullMQ reintenta un trabajo fallido hasta 3 veces (`attempts: 3` en `services/api/src/queue.ts`). Este test reproduce lo que hace la cola sin levantar Redis.

**Resultado esperado:** el agente añade el test, lo ejecuta y falla:

```text
AssertionError: expected 2 to be 1
```

Lo habitual es que, al verlo en rojo, el agente proponga cambiar `jobs.ts` para arreglarlo. No le dejes en este lab: rechaza el cambio. El arreglo, con su diagnóstico, es el lab 04.

El notifier envía y después registra. Si el registro falla, el reintento envía otra vez.

### 6 — Ejecuta todo y haz commit

**Acción:** en la terminal:
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

### 1 — Que el asistente justifique cada mock

Escribe un prompt para que el asistente revise `services/api/test/refund-service.test.ts` y justifique cada `vi.mock`: qué pasaría si se quitara (¿el test sigue pasando?, ¿qué deja de comprobar?, ¿abre alguna conexión real?). Que lo compruebe quitando cada mock de uno en uno y ejecutando el test, y que lo deje todo como estaba.

<details>
<summary>Ver solución</summary>

Un prompt que funciona:

```text
Revisa services/api/test/refund-service.test.ts. Para cada vi.mock: quítalo, ejecuta
npm test -w @telon/api -- refund-service, dime si pasa, si queda colgado y qué comprobación
de la regla se pierde, y vuelve a ponerlo antes de probar el siguiente. Termina con una
tabla: mock, ¿necesario?, por qué. Al acabar, el fichero tiene que quedar igual que al empezar.
```

Lo que suele salir: ninguno de los tres sobra. Sin el mock de `queue.js`, el import de `queue.ts` puede abrir una conexión a Redis y el test queda colgado. Sin el de `payments-client.js`, se pierde la comprobación «no se llama a la pasarela», que es la mitad de la regla. Sin el de `db.js`, el test intenta conectar con PostgreSQL. Quitar un mock está bien cuando la dependencia es lógica pura, como `pricing.ts`; aquí ninguna lo es.

Después, `git diff services/api/test/refund-service.test.ts` no debe mostrar nada. Si muestra algo, el agente no restauró algún mock.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `vi.mock` no surte efecto | El import del módulo probado va antes del `vi.mock` y no se eleva | Importa el módulo con `await import(...)` después del `vi.mock`, o confía en el hoisting de Vitest sin `import` dinámicos raros |
| El test cuelga al terminar | Una conexión real a Redis o PostgreSQL abierta | Falta el mock de `queue.js` o de `db.js` |
| `fetch is not defined` tras el test | No se restauró el global | `afterEach(() => vi.unstubAllGlobals())` |
