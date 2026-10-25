# Documentar lo que hay

[← Página anterior](README.md) · [Siguiente página →](01-lab-readme-y-openapi.md)

El `README.md` del proyecto Telón se escribió cuando la plataforma tenía la mitad de piezas, y ya no cuadra con el código. Esta demostración pide al asistente que lo «actualice» de dos formas: leyéndolo y ejecutándolo.

## Punto de partida

- El proyecto en el estado `make init-m04`: la devolución hecha y probada, y el README heredado.
- `make up-m04` arrancado.
- Asistente en modo agente.

## Recorrido

> [!NOTE]
> El texto exacto que genera el asistente cambia con el modelo. Lo que se repite es qué afirmaciones sobreviven a cada enfoque.

### 1. Actualizar leyendo

El prompt:

```text
Actualiza el README.md con la funcionalidad de devoluciones.
```

El README resultante se lee bien. Añade una sección «Devoluciones» correcta, porque está en `AGENTS.md`. Pero conserva todo lo anterior:
- `npm run seed`, que no existe;
- la API en `http://localhost:8080`, cuando está en el 3000;
- «los correos se envían con SendGrid; configura `SENDGRID_API_KEY`», una variable que no lee nadie.

Además añade algo nuevo: un `npm run migrate` «para aplicar las migraciones», que tampoco existe (la API migra al arrancar). Es plausible, así que nadie lo nota hasta que lo ejecuta.

### 2. Actualizar ejecutando

El prompt cambia el método:

```text
Revisa el README.md afirmación por afirmación. Para cada comando, ejecútalo. Para cada URL,
haz una petición. Para cada afirmación sobre el código, busca el fichero que la demuestra.
Dame una tabla: afirmación, cómo lo has comprobado, ¿es cierta? Después reescríbelo
solo con lo comprobado.
```

El agente ejecuta `npm run seed` (`Missing script: "seed"`), hace `curl localhost:8080` (conexión rechazada) y `curl localhost:3000/api/health` (`{"ok":true}`), y busca `SENDGRID_API_KEY` en el repositorio (cero resultados). La tabla tiene seis filas en rojo. El README nuevo es más corto y cada línea tiene detrás una comprobación.

### 3. La documentación que ve el promotor

El mismo método vale para la documentación de un componente como `SeatPicker`. El ejemplo de uso se pega en el editor del backoffice y se mira la vista previa. Si el ejemplo usa una prop que no existe (`zona="platea"` en lugar de `zone`), Monaco la subraya y la vista previa pinta todas las zonas.

## Qué queda visto

| Documento | Cómo se verifica |
|-----------|------------------|
| README | Cada comando se ejecuta tal cual en una terminal limpia; cada URL responde |
| OpenAPI | El esquema pasa un linter y una petición real devuelve lo que dice |
| Documentación de componente | El ejemplo, pegado en el editor del backoffice, funciona |

En [01 — README y OpenAPI](01-lab-readme-y-openapi.md) lo haces tú. Se puede hacer sin haber seguido esta demostración.
