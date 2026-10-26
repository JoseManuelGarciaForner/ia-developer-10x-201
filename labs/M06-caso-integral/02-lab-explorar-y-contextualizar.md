# Laboratorio: explorar y contextualizar el legado (dev1)

[← Página anterior](01-remotos-y-dos-desarrolladores.md) · [Siguiente página →](03-lab-macrocontexto-y-dinamica.md)

Eres `dev1`. Llegas a cuatro repositorios heredados que no conoces, sin tests y con README dudosos. Con el asistente averiguas qué hace cada uno de verdad, lo compruebas ejecutándolo y dejas un `AGENTS.md` en cada repositorio para quien venga detrás. No arreglas nada: este lab es de descubrimiento y contexto.

### Objetivo

Un `AGENTS.md` comprobado en `control-acceso`, `liquidaciones`, `tarifas` y `widget-embebido`, subido al remoto del equipo.

### Punto de partida

- Repositorio del curso en el Dev Container. Desde `telon/`:

```bash
make init-m06                 # repos heredados y clones de dev1 y dev2
make init-m05                 # El proyecto Telón con devoluciones (CONFIRM=1 para no preguntar)
make up-m05                   # en otra terminal; déjala abierta
```

- Una entrada devuelta en el proyecto Telón, para probar la puerta. Desde `telon/`:

```bash
npm run db:reset
curl -s localhost:3000/api/public/orders/PED-2026-0107/refunds \
  -H 'x-telon-tenant-slug: sala-faro' -H 'content-type: application/json' \
  -d '{"email":"ana.compradora@ejemplo.test","ticket_ids":["PED-2026-0107-1"]}'
```

- El asistente abierto en `workspace/m06/dev1` (más detalle en [Remotos y dos desarrolladores](01-remotos-y-dos-desarrolladores.md)):

| Asistente | Cómo abrirlo en `workspace/m06/dev1` |
|-----------|---------------------------------------|
| VS Code o Codespaces + Copilot | En la terminal, desde `telon/`: `code ../workspace/m06/dev1`. Se abre otra ventana; en ella, <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>I</kbd> → **+** → modo **Agent** |
| Cursor | Desde `telon/`: `cursor ../workspace/m06/dev1`. En la ventana nueva, <kbd>Ctrl</kbd>+<kbd>L</kbd> → **+** → modo **Agent** |
| Claude Code | En una terminal nueva: `cd ../workspace/m06/dev1 && claude` |

> [!NOTE]
> Los repositorios heredados no tienen ningún fichero de contexto para la IA. El asistente solo tiene su código, sus README (que mienten) y lo que su herramienta trae de serie. Tampoco ve el proyecto Telón: está en otra carpeta. Lo que diga del proyecto Telón, o lo comprueba ejecutando o lo supone.

### En qué consiste

Un repositorio cada vez. Primero el asistente cuenta qué hace; después lo compruebas ejecutando o buscando en el código; al final escribes el contexto. El orden importa: `control-acceso` y `liquidaciones` dependen del proyecto Telón y de `tarifas`.

### 1 — Pregunta por `control-acceso`

**Acción:** ve al chat abierto en `dev1`, pega esto y pulsa <kbd>Enter</kbd>:

```text
En control-acceso: qué hace, cómo se ejecuta, de qué depende (incluido lo que esté fuera del
repo: bases de datos, otros servicios) y qué afirmaciones del README no son ciertas. Cita
fichero y línea. No cambies nada.
```

**Por qué:** un repositorio sin tests ni contexto se entiende antes preguntando, pero solo si cada respuesta viene con la línea que la respalda.

**Resultado esperado:** el agente lee `README.md`, `package.json`, `bin/validar.js` y `lib/`. Lo habitual es que encuentre que no usa la API sino la base de datos del proyecto Telón (`lib/db.js`), que no comprueba la firma del QR y que solo rechaza entradas `void`. Si no menciona la firma, pregúntale: «¿Dónde se comprueba la firma del QR?». Con un README que dice que valida contra la API, algunos modelos lo dan por cierto sin buscarlo.

### 2 — Compruébalo en la puerta

**Acción:** en una terminal, desde `telon/`:

```bash
cd ../workspace/m06/dev1/control-acceso
npm install
TELON_DB="$DATABASE_URL" node bin/validar.js "$(cd ../../../../telon && npm run -s qr -- PED-2026-0107-1)"
TELON_DB="$DATABASE_URL" node bin/validar.js "PED-2026-0107-3.firma-inventada"
```

**Por qué:** lo que dijo el asistente se confirma ejecutándolo. La primera línea valida la entrada F-12, que está devuelta. La segunda valida el VIP con una firma falsa.

**Resultado esperado:** las dos dan `{"ok":true,…}`. La entrada devuelta entra en la sala, y una firma inventada también. Ese es el fallo de DEV-430, y hay otro de regalo.

> [!TIP]
> Fuera del Dev Container, `DATABASE_URL` no existe: usa `TELON_DB=postgres://telon:telon@localhost:5432/telon`.

### 3 — Pregunta por `liquidaciones` y ejecútalo

**Acción:**
1. En el mismo chat, pega el prompt del paso 1 cambiando `control-acceso` por `liquidaciones`.
2. En la terminal, desde `workspace/m06/dev1/liquidaciones`: `python3 liquidar.py 2026-10-02`

**Por qué:** el README dice que usa la comisión del proyecto Telón. Si es verdad, la comisión de la Sala Faro debería ser la de los pedidos (7,5 % de todo).

**Resultado esperado:**

```text
TN-FARO      5 entradas  ventas   179.00  comision   12.22  a pagar   166.78
TN-LUMEN     2 entradas  ventas    30.00  comision    2.40  a pagar    27.60
```

Al 7,5 % sobre 179 € saldría 13,42 €. La diferencia está en que liquida con `../tarifas`, donde el anfiteatro de la Sala Faro paga el 5 % y el Lumen el 8 %. El README miente, y hay una dependencia de una carpeta hermana.

### 4 — Comprueba un número a mano

**Acción:** en el mismo chat, escribe «Desglosa la comisión de TN-FARO del 2026-10-02 entrada a entrada: precio, zona, porcentaje aplicado y de qué línea de la tarifa sale» y pulsa <kbd>Enter</kbd>. Repásalo y repásalo con `datos/2026-10-02/entradas.csv` y `../tarifas/promotores/sala-faro.tarifa`.

**Por qué:** un desglose que cuadra con los datos te dice que el asistente ha entendido el parser. Uno que no cuadra te dice dónde está lo raro.

**Resultado esperado:** M-3 y M-4 (anfiteatro, 24,00 €) al 5 %: 1,20 € cada una. F-12 y F-13 (platea, 35,50 €) al 7,5 %: 2,66 € cada una. El VIP (60 €) al 7,5 %: 4,50 €. Total: 12,22 €.

### 5 — Descubre la gramática de `tarifas`

**Acción:** en el mismo chat, pega esto y pulsa <kbd>Enter</kbd>:

```text
Las tarifas de tarifas/promotores/*.tarifa usan un formato propio. Escribe su gramática
completa a partir de los ficheros reales y de cómo las lee liquidaciones/liquidar.py
(leer_tarifa). Para cada instrucción: qué significa y si liquidar.py la aplica.
Compáralo con tarifas/GRAMATICA.md.
```

**Por qué:** ningún modelo conoce este formato: no está en internet. La gramática solo se puede sacar de los ficheros y del único código que los lee.

**Resultado esperado:** seis instrucciones (`PROMOTOR`, `COMISION`, `ZONA`, `MINIMO`, `INVITACIONES`, `DESDE`). `GRAMATICA.md` no recoge ni `MINIMO` ni `DESDE`, y `liquidar.py` ignora `DESDE` sin avisar, así que el 6 % del anfiteatro de 2025 no se aplica.

Compruébalo: `grep -n DESDE ../liquidaciones/liquidar.py` no devuelve nada.

### 6 — Revisa `widget-embebido`

**Acción:** en el mismo chat, pega el prompt del paso 1 cambiando `control-acceso` por `widget-embebido`. Después, en la terminal, desde `workspace/m06/dev1/widget-embebido`: `grep -n "api/" widget.js`.

**Por qué:** el README habla de `apiKey` y de `/api/v0/widget`. Si un agente se lo cree, «arreglará» el widget para una API que no existe.

**Resultado esperado:** el código llama a `/api/public/events/<evento>` con `x-telon-tenant-slug`. No hay `apiKey` en ningún sitio.

### 7 — Escribe el `AGENTS.md` de cada repositorio

**Acción:** en el mismo chat (así aprovecha todo lo comprobado), pega esto una vez por repositorio, cambiando `<repo>`:

```text
Escribe AGENTS.md en <repo> con: qué es, cómo se ejecuta (comandos que hemos probado), cómo
funciona de verdad (lo comprobado en esta sesión, con fichero), convenciones del repo y "No
hacer". Indica qué partes del README no son fiables. Máximo 40 líneas. Nada sin comprobar.
```

Revísalo línea a línea y añade un `CLAUDE.md` con `@AGENTS.md` si usas Claude Code.

**Por qué:** lo que has descubierto en esta sesión se pierde al cerrar el chat. Escrito en el repositorio, le llega a `dev2` y a cualquiera que venga después.

**Resultado esperado:** cuatro `AGENTS.md`. Cada uno contiene al menos una afirmación que contradice su README.

### 8 — Sube el contexto

**Acción:** en la terminal, en cada repositorio de `workspace/m06/dev1` (`cd` a cada uno):

```bash
git add -A
git commit -m "contexto: AGENTS.md comprobado contra el código"
git push
```

**Por qué:** hasta que no está en el remoto, `dev2` no lo tiene.

**Resultado esperado:** desde `telon/`, `make up-m06` muestra los cuatro clones de `dev1` sin cambios pendientes, y los de `dev2` con `[behind 1]`.

## Comprueba tu entendimiento

**El contexto sustituye a la sesión**
Abre un chat nuevo en `dev1/liquidaciones` y pregunta: «¿Por qué la Sala Faro paga menos del 7,5 % de comisión?».
→ Responde con las tarifas por zona citando `AGENTS.md`, sin volver a explorar el código.

## Reto

### 1 — Una auditoría de seguridad que se pueda comprobar

Además de las entradas devueltas y la firma, `control-acceso` tiene un tercer problema de seguridad. Escribe un prompt para que el asistente lo encuentre con una lista de comprobación concreta (no «revisa la seguridad»), con fichero, línea y una forma de demostrarlo sin cambiar código. Después escríbelo en su `AGENTS.md`, sin arreglarlo.

<details>
<summary>Ver solución</summary>

Un prompt que funciona:

```text
Audita control-acceso con esta lista, citando fichero y línea:
1. ¿Se construye SQL concatenando texto que viene de fuera (el contenido del QR)?
2. ¿Se valida la firma antes de usar el id?
3. ¿Qué podría hacer un QR manipulado?
Para cada hallazgo, explica el riesgo con un ejemplo, sin ejecutarlo contra la base de datos.
```

Lo que tiene que salir: las dos consultas de `lib/validar.js` concatenan el id en el SQL (`"… WHERE id = '" + id + "'"`). Es inyección SQL desde el contenido del QR, que llega del lector sin comprobar la firma: un QR con `x' OR '1'='1` haría que el `UPDATE` marcara todas las entradas como usadas. `lib/aforo.js` sí usa parámetros.

Va en «Cómo funciona» del `AGENTS.md`, como hecho comprobado, y el arreglo queda para otra petición. La lista concreta es lo que hace que el asistente mire el SQL en lugar de dar consejos generales de seguridad.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `{"ok":false,"motivo":"NO_EXISTE"}` con F-12 | Hiciste `db:reset` después del `curl` de la devolución, o el proyecto Telón no está en el estado `m05` | Repite el punto de partida |
| `{"ok":false,"motivo":"YA_DENTRO"}` | Ya validaste esa entrada | `npm run db:reset` en `telon/` y repite la devolución |
| `FileNotFoundError: …/tarifas/promotores` | Ejecutas `liquidar.py` desde otra carpeta | Ejecútalo desde `dev1/liquidaciones` (busca `../tarifas`) |
| El asistente lee los repos de `dev2` | El chat se abrió en `workspace/m06` | Ábrelo en `workspace/m06/dev1` |
