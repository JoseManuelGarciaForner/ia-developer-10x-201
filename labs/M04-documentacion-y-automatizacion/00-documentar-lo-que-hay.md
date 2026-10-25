# Documentar lo que hay

[← Página anterior](README.md) · [Siguiente página →](01-lab-readme-y-openapi.md)

Un asistente escribe documentación que se lee bien en segundos. El riesgo es que se lea bien y sea falsa: si parte de un README antiguo, hereda sus errores y les añade otros nuevos igual de creíbles. El `README.md` del proyecto Telón se escribió cuando la plataforma tenía la mitad de piezas y ya no cuadra con el código. Esta demostración le pide al asistente que lo actualice de dos maneras, leyéndolo y ejecutándolo, y compara qué afirmaciones son ciertas en cada resultado.

## Punto de partida

- El proyecto Telón en el estado `make init-m04`: la devolución hecha y probada, y el README heredado.
- `make up-m04` arrancado.
- Asistente en modo agente.
- Lo que es cierto hoy, comprobado en el código y ejecutando:
  - la API escucha en el puerto 3000 (`curl localhost:3000/api/health` responde `{"ok":true}`);
  - no existe `npm run seed`: los datos se cargan al arrancar la API y con `npm run db:reset`;
  - la API aplica las migraciones al arrancar, y no hay `npm run migrate`;
  - el proveedor de correo lo configura cada promotor en el backoffice; no hay ninguna variable `SENDGRID_API_KEY`.

> [!NOTE]
> El texto exacto que genera el asistente cambia con el modelo. Lo que se repite es qué afirmaciones son ciertas con cada método.

## Recorrido

### 1. Actualizar leyendo: el README nuevo hereda los errores del viejo

El prompt:

```text
Actualiza el README.md con la funcionalidad de devoluciones.
```

El README resultante se lee bien y su sección «Devoluciones» es correcta, porque la ha sacado de `AGENTS.md`. Pero mantiene todo lo anterior sin comprobarlo:

- `npm run seed`, que no existe;
- la API en `http://localhost:8080`, cuando está en el 3000;
- «los correos se envían con SendGrid; configura `SENDGRID_API_KEY`», una variable que no lee nadie.

Y añade un error nuevo: un `npm run migrate` «para aplicar las migraciones», que tampoco existe. Es tan creíble que nadie lo nota hasta que lo ejecuta.

El asistente ha hecho lo que se le pidió: actualizar un texto a partir de otro texto. No tenía ningún motivo para dudar del README.

### 2. Actualizar ejecutando: cada línea con su comprobación

El prompt cambia el método, no el objetivo:

```text
Revisa el README.md afirmación por afirmación. Para cada comando, ejecútalo. Para cada URL,
haz una petición. Para cada afirmación sobre el código, busca el fichero que la demuestra.
Dame una tabla: afirmación, cómo lo has comprobado, ¿es cierta? Después reescríbelo
solo con lo comprobado.
```

El agente ejecuta `npm run seed` (`Missing script: "seed"`), hace `curl localhost:8080` (conexión rechazada) y `curl localhost:3000/api/health` (`{"ok":true}`), y busca `SENDGRID_API_KEY` en el repositorio (cero resultados). En la tabla salen seis afirmaciones falsas. El README nuevo es más corto, y cada línea tiene detrás una comprobación que se puede repetir.

Lo que cambia el resultado es pedir pruebas en lugar de redacción: un agente puede ejecutar comandos, y ejecutándolos encuentra lo que leyendo no ve.

### 3. El mismo método con la documentación de un componente

Los promotores usan componentes como `SeatPicker` para montar sus páginas, y su documentación incluye un ejemplo de uso. Para comprobarlo, el ejemplo se pega en el editor del backoffice y se mira la vista previa.

![Ejemplo de SeatPicker pegado en el editor del backoffice](../img/M04-02-ejemplo-seatpicker-editor.png)

Si el ejemplo usa una prop que no existe (`zona="platea"` en lugar de `zone`), Monaco la subraya y la vista previa muestra todas las zonas en lugar de solo la platea. El editor sirve para verificar la documentación.

## Qué queda visto

| Documento | Cómo se verifica |
|-----------|------------------|
| README | Cada comando se ejecuta tal cual en una terminal limpia; cada URL responde |
| OpenAPI | El esquema pasa un linter y una petición real devuelve lo que dice |
| Documentación de un componente | El ejemplo, pegado en el editor del backoffice, funciona |

La documentación generada vale lo que valen sus comprobaciones. Si el asistente solo lee, repite los errores que encuentra; si ejecuta, los descubre.

En [01 — README y OpenAPI](01-lab-readme-y-openapi.md) lo haces tú. Se puede hacer sin haber seguido esta demostración.
