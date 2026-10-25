# Laboratorio: script de escenario, documentación de componente y prompts reutilizables

[← Página anterior](01-lab-readme-y-openapi.md) · [Siguiente página →](../M05-workflows-con-ia/README.md)

Cada vez que alguien del equipo prueba devoluciones en el proyecto Telón, repite lo mismo: crea pedidos en distintos estados, devuelve alguno y busca un evento que esté a menos de 48 h. En este lab conviertes esa tarea en un script con el asistente. Después documentas `SeatPicker` para los promotores, con un ejemplo comprobado en el editor, y guardas el prompt que has usado para que el equipo lo reutilice.

### Objetivo

`npm run escenario` crea datos de prueba de devoluciones y se puede ejecutar varias veces. `docs/componentes/SeatPicker.md` tiene un ejemplo que funciona en el editor del backoffice. Y queda un prompt reutilizable versionado para tu asistente.

### Punto de partida

- El proyecto abierto en el Dev Container, carpeta `telon/`.
- Estado: `make init-m04` y `make up-m04` en otra terminal. Ejecuta `npm run db:reset` para partir de los datos de ejemplo.
- Backoffice abierto con el token `faro-dev-token`.

### En qué consiste

Un script en `services/api/src/scripts/`, una página de documentación y un fichero de prompt. No cambias la lógica del proyecto.

### 1 — Describe el escenario que necesitas

**Acción:** en un chat nuevo:

```text
Crea services/api/src/scripts/escenario.ts y el script npm "escenario" (en services/api y en la
raíz), que añada al evento EV-FARO-0042:
- PRU-0001: pagado, 3 butacas de platea (C-4, C-5, C-6);
- PRU-0002: pagado, K-10 y K-11, con K-11 ya devuelta (registro en refunds y refund_tickets);
- PRU-0003: rechazado (D-1, entrada void);
- PRU-0004: pagado, A-1 devuelta;
- un evento EV-FARO-0099 que empieza dentro de 24 h, con un pase De pie, para probar el plazo de 48 h.
Importes con ticketAmounts de pricing.ts. Los pedidos pagados tienen que cobrarse de verdad en
la pasarela emulada (charge de payments-client) para que se puedan devolver.
Idempotente: si ya existen, bórralos y vuelve a crearlos, incluido lo que alguien haya comprado
en EV-FARO-0099. Nada más.
```

**Por qué:** es una tarea que el asistente hace bien si le das el detalle: qué datos, de dónde salen los importes y que se pueda repetir. Lo de cobrar en la pasarela es lo que nadie recuerda y lo que hace que la primera devolución de prueba falle con un 502.

**Resultado esperado:** un script de unas 80 líneas y `"escenario"` en los dos `package.json`.

### 2 — Revisa lo que borra

**Acción:** busca en el script todos los `DELETE`.

**Por qué:** un script de datos idempotente borra antes de crear. Un `DELETE FROM orders` sin filtro se lleva el pedido de Ana y todo lo que hayas comprado en la tienda.

**Resultado esperado:** todos los `DELETE` filtran por pedidos `PRU-%` o del evento `EV-FARO-0099`, y se borra en orden: primero `refund_tickets`, después `refunds`, `tickets`, `orders` y `events`. Si no, la segunda ejecución choca con las claves foráneas.

### 3 — Ejecútalo dos veces

**Acción:**

```bash
npm run escenario
npm run escenario
```

**Por qué:** la segunda ejecución prueba que es idempotente. Es lo que hará cualquiera que lo use sin pensar.

**Resultado esperado:** las dos terminan con un mensaje del tipo «escenario cargado: 4 pedidos PRU-* y el evento EV-FARO-0099». En el backoffice, **Pedidos y correos** muestra `PRU-0001` a `PRU-0004` una sola vez.

![Pedidos del escenario en el backoffice](../img/M04-02-pedidos-escenario.png)

### 4 — Prueba una devolución sobre el escenario

**Acción:**

```bash
curl -s localhost:3000/api/public/orders/PRU-0001/refunds \
  -H 'x-telon-tenant-slug: sala-faro' -H 'content-type: application/json' \
  -d '{"email":"marta@ejemplo.test","ticket_ids":["PRU-0001-1"]}'
```

**Por qué:** si el script no cobró en la pasarela, aquí sale un 502. Es la prueba de que los datos sirven para lo que se crearon.

**Resultado esperado:** `201` con `amount_cents: 3550`.

### 5 — Documenta `SeatPicker`

**Acción:**

```text
Crea docs/componentes/SeatPicker.md para promotores que escriben su página en TSX: qué hace,
un ejemplo de uso mínimo con Cart y Checkout, tabla de props, comportamiento (máximo de
entradas, butacas vendidas, recarga tras el pago) y cómo cambiar el color con --telon-accent.
Sácalo de packages/ui/src/SeatPicker.tsx y context.tsx. Solo props que existan.
```

**Por qué:** el promotor no ve el código de `@telon/ui`, solo el editor y la documentación. Una prop inventada en la documentación es un ticket de soporte.

**Resultado esperado:** una página con un ejemplo de 15 líneas y una tabla con una sola prop, `zone`.

### 6 — Comprueba el ejemplo en el editor

**Acción:**
1. En el backoffice, ve a **Eventos** → **Editar página** de «Jazz en el Faro».
2. Selecciona todo el código del editor (<kbd>Ctrl</kbd>+<kbd>A</kbd>) y pega el ejemplo de la documentación.
3. Mira la vista previa. **No guardes.**

**Por qué:** así se verifica la documentación de un componente: con el mismo editor y el mismo runtime que usa el promotor.

**Resultado esperado:** la vista previa muestra el plano (solo la platea si el ejemplo usa `zone="platea"`), el carrito y el pago, sin errores en rojo. Si Monaco subraya algo o la vista previa muestra «Error en la página del evento», el ejemplo está mal: corrígelo en la documentación.

![Ejemplo de la documentación en el editor del backoffice](../img/M04-02-ejemplo-seatpicker-editor.png)

### 7 — Guarda el prompt para el equipo

**Acción:** guarda el prompt del paso 5, generalizado para cualquier componente, en el sitio de tu asistente:

| Asistente | Fichero | Se usa con |
|-----------|---------|------------|
| GitHub Copilot | `.github/prompts/documentar-componente.prompt.md` | `/documentar-componente` en el chat |
| Cursor | `.cursor/commands/documentar-componente.md` | `/documentar-componente` en el chat |
| Claude Code | `.claude/commands/documentar-componente.md` | `/documentar-componente` en `claude` |

Contenido (igual para los tres):

```markdown
Documenta el componente $ARGUMENTS de packages/ui para promotores que escriben su página en TSX.
Crea docs/componentes/$ARGUMENTS.md con: qué hace, ejemplo mínimo dentro de una página
(export default), tabla de props (solo las que existan en el código), comportamiento y estilos.
Sácalo de packages/ui/src/. Al terminar, dime cómo comprobar el ejemplo en el editor del backoffice.
```

**Por qué:** un prompt que funciona es conocimiento del equipo. Si se queda en tu historial de chat, se pierde. Versionado, lo usa cualquiera y se mejora por pull request.

**Resultado esperado:** el fichero creado. En un chat nuevo, `/documentar-componente PassSelector` genera `docs/componentes/PassSelector.md`.

> [!NOTE]
> En Copilot, la variable del argumento se escribe distinto según la versión (`${input:componente}`). Si `$ARGUMENTS` no se sustituye, cambia esa palabra por el nombre del componente al usarlo.

### 8 — Haz commit

**Acción:** `git add -A && git commit -m "Escenario de devoluciones, documentación de SeatPicker y prompt reutilizable"`

**Por qué:** script, documentación y prompt son herramientas del equipo. Van al repositorio.

**Resultado esperado:** commit con el script, los `package.json`, `docs/` y el fichero de prompt.

## Comprueba tu entendimiento

**El plazo, con datos**
Con el escenario cargado, compra un pase **De pie** de «Jam de mañana» en la tienda (`/e/EV-FARO-0099`) y devuélvelo desde **Mis entradas**.
→ «las devoluciones cierran 48 h antes del evento». El escenario te ha dado el caso sin tocar fechas a mano.

**El prompt en otro componente**
Usa `/documentar-componente Checkout`.
→ Genera `docs/componentes/Checkout.md` sin props en la tabla (`Checkout` no tiene) y con las tres tarjetas de prueba.

## Reto

### 1 — Escenario con varios promotores

Amplía el script para que cree también un pedido pagado del Teatro Lumen. ¿Qué tienes que cambiar en los `DELETE` para que siga siendo seguro?

<details>
<summary>Ver solución</summary>

El pedido del Lumen necesita `tenant_id = 'TN-LUMEN'`, `event_id = 'EV-LUMEN-0007'` y un pase (`EV-LUMEN-0007-GEN`, con `kind = 'pass'` y `pass_type_id`), porque ese evento no tiene butacas. Si su id también empieza por `PRU-`, los `DELETE` no cambian. Lo que no debes hacer es filtrar por `tenant_id = 'TN-FARO'`, porque eso borraría los pedidos reales de la Sala Faro.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `duplicate key value violates unique constraint "orders_pkey"` | El script no borra antes de crear | Añade los `DELETE` del paso 2 |
| `502 la pasarela no ha podido hacer la devolución` | El pedido se creó sin cobrar en la pasarela | Usa `charge()` de `payments-client.ts` y guarda su `id` en `charge_id` |
| `fetch failed` al ejecutar el script | La pasarela no está arrancada | `make up-m04` en otra terminal |
| La vista previa dice `la página no puede importar «…»` | El ejemplo importa algo que no es `react` ni `@telon/ui` | Solo esos módulos están disponibles en las páginas |
