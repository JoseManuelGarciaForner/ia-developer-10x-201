# Documentar lo que hay

[← Página anterior](README.md) · [Siguiente página →](01-lab-readme-y-openapi.md)

Un asistente escribe documentación que se lee bien en segundos. El riesgo es que se lea bien y sea falsa: si parte de un README antiguo, hereda sus errores y les añade otros nuevos igual de creíbles. El `README.md` del proyecto Telón se escribió cuando la plataforma tenía la mitad de piezas y ya no cuadra con el código. Esta demostración le pide al asistente que lo actualice de dos maneras, leyéndolo y ejecutándolo, y compara qué afirmaciones son ciertas en cada resultado.

## Punto de partida

- Repositorio del curso abierto en el Dev Container (local o Codespaces), con dos terminales en `telon/`.
- Un asistente en modo agente: Copilot o Cursor en modo **Agent**, o Claude Code (`claude` en la terminal, desde `telon/`).
- Lo que es cierto hoy, comprobado en el código y ejecutando:
  - la API escucha en el puerto 3000 (`curl localhost:3000/api/health` responde `{"ok":true}`);
  - no existe `npm run seed`: los datos se cargan al arrancar la API y con `npm run db:reset`;
  - la API aplica las migraciones al arrancar, y no hay `npm run migrate`;
  - el proveedor de correo lo configura cada promotor en el backoffice; no hay ninguna variable `SENDGRID_API_KEY`.

### Preparación

1. Terminal 1: `CONFIRM=1 make init-m04`. Deja la devolución hecha y probada, y el README heredado.
2. Terminal 2: `make up-m04`, y se deja abierta.
3. Se abre `README.md` (el de `telon/`) y se enseñan tres líneas que el paso 1 va a heredar:
   - línea 9: `npm run seed      # carga los datos de ejemplo`;
   - línea 13: `- API: http://localhost:8080`;
   - línea 27: `Los correos de confirmación se envían con SendGrid. Configura la API key en SENDGRID_API_KEY.`

Las tres son falsas, y de momento no se dice.

> [!NOTE]
> El texto exacto que genera el asistente cambia con el modelo. Lo que se repite es qué afirmaciones son ciertas con cada método.

## Recorrido

### 1. Actualizar leyendo: el README nuevo hereda los errores del viejo

1. Se abre una conversación nueva en modo agente y se pide:

```text
Actualiza el README.md con la funcionalidad de devoluciones.
```

2. Cuando termina, en la terminal 1: `git diff README.md`.

**Qué se ve:** una sección «Devoluciones» nueva y correcta, porque la ha sacado de `AGENTS.md`. Pero las líneas de `npm run seed`, el puerto 8080 y `SENDGRID_API_KEY` siguen igual. Y a menudo aparece una línea nueva, como `npm run migrate` «para aplicar las migraciones», que tampoco existe.

3. Para comprobarlo en directo, en la terminal 1: `npm run seed`. Responde `Missing script: "seed"`.

**Qué muestra:** el asistente ha hecho lo que se le pidió, actualizar un texto a partir de otro texto. No tenía ningún motivo para dudar del README, y lo que inventa es tan creíble como lo que copia.

4. Se descarta el cambio: `git checkout README.md`. Se cierra la conversación.

### 2. Actualizar ejecutando: cada línea con su comprobación

1. En una conversación **nueva** se pide, con el mismo objetivo y otro método:

```text
Revisa el README.md afirmación por afirmación. Para cada comando, ejecútalo. Para cada URL,
haz una petición. Para cada afirmación sobre el código, busca el fichero que la demuestra.
Dame una tabla: afirmación, cómo lo has comprobado, ¿es cierta? Después reescríbelo
solo con lo comprobado.
```

2. El agente pide permiso para cada comando. Se le permiten los de lectura y los que fallan sin efectos: `npm run seed`, `curl`, búsquedas en el repositorio.
3. Se lee la tabla antes de mirar el README nuevo.

**Qué se ve:** el agente ejecuta `npm run seed` (`Missing script: "seed"`), `curl localhost:8080` (conexión rechazada) y `curl localhost:3000/api/health` (`{"ok":true}`), y busca `SENDGRID_API_KEY` en el repositorio (cero resultados). La tabla marca seis afirmaciones como falsas. Después, `git diff README.md` enseña un README más corto en el que cada línea tiene una comprobación detrás.

**Qué muestra:** lo que cambia el resultado es pedir pruebas en lugar de redacción. Un agente puede ejecutar comandos, y ejecutándolos encuentra lo que leyendo no ve.

4. Se descarta el cambio: `git checkout README.md`.

### 3. El mismo método con la documentación de un componente

Los promotores montan sus páginas con componentes como `SeatPicker`, y su documentación incluye un ejemplo de uso. La forma de comprobar ese ejemplo es pegarlo en el editor del backoffice.

1. Se abre el backoffice (local: `http://localhost:5174`; Codespaces: **Ports** → **Backoffice (5174)**), se entra con el token `faro-dev-token` y, en **Eventos**, se pulsa **Editar página** en «Jazz en el Faro».
2. En el editor de la izquierda se selecciona todo (<kbd>Ctrl</kbd>+<kbd>A</kbd>) y se pega este ejemplo:

```tsx
import { Cart, Checkout, SeatPicker, useEvent } from '@telon/ui';

export default function Pagina() {
  const event = useEvent();
  return (
    <main>
      <h1>{event.title}</h1>
      <SeatPicker zone="platea" />
      <Cart />
      <Checkout />
    </main>
  );
}
```

**Qué se ve:** la vista previa de la derecha muestra solo la platea (filas A a J), el carrito y el pago.

![Ejemplo de SeatPicker pegado en el editor del backoffice](../img/M04-02-ejemplo-seatpicker-editor.png)

3. Se cambia `zone="platea"` por `zona="platea"`, el error típico de una documentación escrita sin probar.

**Qué se ve:** Monaco subraya `zona` porque esa prop no existe, y la vista previa vuelve a mostrar todas las zonas, platea y anfiteatro.

**Qué muestra:** el editor del backoffice compila el ejemplo con los mismos tipos que usará el promotor, así que un ejemplo que funciona ahí funciona en su página.

4. Para dejarlo como estaba: no se pulsa **Guardar**. Se recarga la página del navegador y se descartan los cambios.

## Qué queda visto

| Documento | Cómo se verifica |
|-----------|------------------|
| README | Cada comando se ejecuta tal cual en una terminal limpia; cada URL responde |
| OpenAPI | El esquema pasa un linter y una petición real devuelve lo que dice |
| Documentación de un componente | El ejemplo, pegado en el editor del backoffice, funciona |

La documentación generada vale lo que valen sus comprobaciones. Si el asistente solo lee, repite los errores que encuentra; si ejecuta, los descubre.

En [01 — README y OpenAPI](01-lab-readme-y-openapi.md) lo haces tú. Se puede hacer sin haber seguido esta demostración.
