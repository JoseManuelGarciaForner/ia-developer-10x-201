# Laboratorio: dev2, sin memoria

[← Página anterior](03-lab-macrocontexto-y-dinamica.md) · [Siguiente página →](05-antipatrones-y-adopcion.md)

Eres `dev2`. No estuviste en las sesiones de `dev1` y tu chat empieza vacío. Te llega DEV-430: una entrada devuelta entró en la Sala Faro y liquidaciones pagó entradas devueltas. Primero lo intentas sin el contexto que dejó `dev1`; después haces `git pull` y lo intentas con él. La diferencia entre los dos intentos es lo que vale el contexto versionado.

### Objetivo

DEV-430 resuelto por `dev2` en `control-acceso` y `liquidaciones`, comprobado contra la base de datos de Telón, y una comparación escrita entre el intento sin contexto y el intento con contexto.

### Punto de partida

- Desde `telon/`, en este orden:

```bash
make init-m06                 # repos heredados; dev1 y dev2 sin contexto
make contexto-m06             # dev1 sube su contexto (si ya hiciste los labs 02 y 03, sáltalo)
CONFIRM=1 make init-m05 && make up-m05     # Telón con devoluciones (déjalo en otra terminal)
npm run db:reset
curl -s localhost:3000/api/public/orders/PED-2026-0107/refunds \
  -H 'x-telon-tenant-slug: sala-faro' -H 'content-type: application/json' \
  -d '{"email":"ana.compradora@ejemplo.test","ticket_ids":["PED-2026-0107-1"]}'
```

- Resultado: la entrada `PED-2026-0107-1` (butaca F-12) está devuelta en Telón, y los clones de `dev2` todavía no tienen el contexto de `dev1`.
- Las memorias del asistente desactivadas o borradas (ver [Remotos y dos desarrolladores](01-remotos-y-dos-desarrolladores.md)).

La petición:

> **DEV-430 — Las devoluciones fuera del monorepo.** Que una entrada devuelta no entre en la sala, y que no se liquide.

### En qué consiste

Dos intentos de la misma tarea en los clones de `dev2`: el primero sin contexto (lo descartas), el segundo con contexto (lo subes). Comparas los dos diffs y compruebas el segundo contra Telón.

### 1 — Abre el chat de dev2 sin contexto

**Acción:** abre el asistente en `workspace/m06/dev2` (otra ventana o `cd ../workspace/m06/dev2 && claude`), en un chat nuevo. Comprueba que no tiene el contexto: `ls */AGENTS.md` en esa carpeta no debe encontrar nada.

**Por qué:** el primer intento mide lo que hace el asistente con lo que un desarrollador nuevo encuentra al clonar: código y README que mienten.

**Resultado esperado:** `ls: cannot access '*/AGENTS.md': No such file or directory`.

### 2 — Primer intento: sin contexto

**Acción:**

```text
DEV-430: una entrada devuelta en Telón no debe entrar en la sala (control-acceso) ni
liquidarse (liquidaciones). Implementa el cambio mínimo en los dos repositorios.
```

Deja que termine y guarda en un fichero aparte (por ejemplo, `/tmp/sin-contexto.md`):
- qué estado de entrada usa para «devuelta»;
- qué ficheros de `liquidaciones` toca;
- si ha comprobado algo contra Telón.

**Por qué:** sin contexto, el asistente tiene que adivinar cómo marca Telón una entrada devuelta. Ese dato no está en ninguno de estos repositorios.

**Resultado esperado:** algún supuesto equivocado o sin comprobar. Lo habitual: inventa el estado (`'devuelta'`, `'REFUNDED'`, `'cancelled'`), se fía del README (cambia la «llamada a la API» que `control-acceso` no hace) o solo toca `liquidar.py`, que no recibe el estado de la entrada porque `exportar.sh` no lo exporta.

### 3 — Descarta el primer intento

**Acción:** en `workspace/m06/dev2`: `for d in */; do git -C "$d" checkout -q . && git -C "$d" clean -qfd; done`

**Por qué:** el primer intento solo sirve para comparar. No debe mezclarse con el segundo.

**Resultado esperado:** `git -C control-acceso status` dice `nothing to commit, working tree clean`.

### 4 — Trae el contexto del equipo

**Acción:** `for d in */; do git -C "$d" pull -q; done`, y después `ls */AGENTS.md`

**Por qué:** es lo único que separa a `dev2` de `dev1`: lo que quedó versionado. Ni chat, ni memoria, ni conversación.

**Resultado esperado:** `AGENTS.md` en los cinco repositorios, incluido `contexto-equipo`.

### 5 — Segundo intento: chat nuevo, con contexto

**Acción:** cierra el chat y abre otro nuevo en `workspace/m06/dev2`. Usa el mismo prompt del paso 2.

**Por qué:** mismo asistente, mismo prompt, misma persona. Solo cambian los ficheros del repositorio.

**Resultado esperado:** el asistente cita `contexto-equipo/AGENTS.md`. Usa el estado `refunded`, o mejor aún, acepta solo `valid`. En `liquidaciones` cambia `exportar.sh` (para exportar el estado o filtrarlo) y, si hace falta, `liquidar.py`.

### 6 — Revisa el diff

**Acción:** en cada repositorio, `git diff`, y repasa:
- `control-acceso/lib/validar.js`: ¿rechaza todo lo que no sea `valid`, o solo `refunded`? Lo primero aguanta el próximo estado que añada Telón.
- `liquidaciones/exportar.sh`: ¿la consulta tiene en cuenta `t.status`?
- ¿Ha respetado las convenciones de cada repositorio (callbacks y `var` en uno, Python en español en el otro)?
- ¿Ha tocado algo que `AGENTS.md` dice que no se toque (el formato de `salida/`, las tarifas)?

**Por qué:** con contexto el diff es mejor, pero sigue siendo tuyo. La diferencia entre «solo `refunded`» y «solo `valid`» decide si DEV-430 vuelve a pasar con el siguiente estado.

**Resultado esperado:** un diff pequeño en los dos repositorios, con el estilo de cada uno.

### 7 — Comprueba la puerta

**Acción:** en `dev2/control-acceso`:

```bash
npm install
TELON_DB="$DATABASE_URL" node bin/validar.js "$(cd ../../../../telon && npm run -s qr -- PED-2026-0107-1)"
TELON_DB="$DATABASE_URL" node bin/validar.js "$(cd ../../../../telon && npm run -s qr -- PED-2026-0107-2)"
```

**Por qué:** la primera es la butaca devuelta (F-12) y la segunda una que no se devolvió (F-13). El arreglo tiene que distinguirlas.

**Resultado esperado:** F-12: `{"ok":false,"motivo":…}` con un motivo como `DEVUELTA` o `NO_VALIDA`. F-13: `{"ok":true,…}`.

### 8 — Comprueba la liquidación con datos reales

**Acción:** en `dev2/liquidaciones`:

```bash
TELON_DB="$DATABASE_URL" ./exportar.sh 2026-10-02
python3 liquidar.py 2026-10-02
git checkout datos/
```

**Por qué:** `exportar.sh` saca de Telón los pedidos pagados el 2 de octubre: solo `PED-2026-0107`, con F-12 devuelta. Es el caso de DEV-430 con datos de verdad. El `git checkout` final deja los datos de ejemplo como estaban.

**Resultado esperado:**

```text
TN-FARO      2 entradas  ventas    95.50  comision    7.16  a pagar    88.34
```

Sin el arreglo saldrían 3 entradas, 131,00 € de ventas y 121,18 € a pagar.

### 9 — Sube el cambio

**Acción:** en `control-acceso` y en `liquidaciones` de `dev2`:

```bash
git add -A && git commit -m "DEV-430: las entradas devueltas no entran ni se liquidan" && git push
```

Si el cambio ha revelado algo que el contexto no decía, añádelo a su `AGENTS.md` en un commit aparte (`contexto: …`).

**Por qué:** el arreglo llega al equipo por el mismo camino que llegó el contexto. Y si `dev2` aprendió algo, `dev1` lo recibirá en su próximo `pull`.

**Resultado esperado:** desde `telon/`, `make up-m06` muestra los clones de `dev1` con `[behind 1]` en los dos repositorios.

### 10 — Compara los dos intentos

**Acción:** completa esta tabla en `dev2/contexto-equipo/DEV-430.md` y súbela:

| | Sin contexto | Con contexto |
|---|---|---|
| Estado que usó para «devuelta» | | |
| Ficheros que tocó | | |
| ¿Comprobó contra Telón? | | |
| ¿Respetó las convenciones? | | |
| ¿Qué habría pasado en producción? | | |

**Por qué:** es la prueba del módulo: el conocimiento de `dev1` llegó a `dev2` sin conversación. Escrito, sirve para convencer al resto del equipo de mantener el contexto.

**Resultado esperado:** la tabla, con diferencias concretas en al menos tres filas.

## Comprueba tu entendimiento

**El próximo estado de Telón**
Pregunta en el chat de `dev2`: «Si Telón añade mañana el estado `transferred` (entrada cedida a otra persona), ¿qué pasa en la puerta con tu cambio?».
→ Si aceptas solo `valid`, la entrada cedida no entra hasta que alguien lo decida, y el fallo es visible. Si rechazabas solo `refunded`, entraría. El asistente lo razona con `contexto-equipo/AGENTS.md`.

## Reto

### 1 — DESDE

`tarifas/promotores/sala-faro.tarifa` dice que desde 2025 el anfiteatro paga el 6 %, y liquidaciones aplica el 5 %. Como `dev2`, prepara el cambio en una rama (`feat/tarifas-desde`) pero no lo fusiones. ¿Por qué no?

<details>
<summary>Ver solución</summary>

El cambio en `leer_tarifa` es sencillo: entender `DESDE <fecha> <instrucción>` y aplicar la instrucción si el día que se liquida es posterior. Pero cambia lo que se paga a un promotor, y `tarifas/AGENTS.md` dice que eso requiere el visto bueno de comercial (además, habría que decidir si se recalculan las liquidaciones de 2025). La rama con su handoff en la descripción, según `DINAMICA.md`, es la forma de dejarlo preparado sin decidir por otros.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| El primer intento ya cita `AGENTS.md` | `dev2` hizo `pull` antes de tiempo, o el chat está en `dev1` | `make init-m06 && make contexto-m06` y empieza de nuevo |
| El segundo intento recuerda el primero | Memoria del asistente activa o mismo chat | Chat nuevo y memorias desactivadas |
| `psql: command not found` | Fuera del Dev Container | Instala el cliente de PostgreSQL o ejecuta la consulta de `exportar.sh` con `docker compose -f ../infra/compose.yaml exec postgres psql -U telon` |
| F-12 sale `YA_DENTRO` | Validaste la entrada antes del arreglo y quedó marcada como usada | `npm run db:reset` en `telon/`, repite la devolución y vuelve a validar |
