#!/usr/bin/env bash
# Mantenedor: regenera los repos heredados del M06 como git bundles (.labs/m06-legado/*.bundle).
# Cada repo tiene historial con autores y fechas fijas, para que el resultado sea reproducible.
set -euo pipefail
OUT="$(cd "$(dirname "$0")" && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

repo() { cd "$TMP" && rm -rf "$1" && git init -q -b main "$1" && cd "$1"; }
commit() { # commit "Autor <email>" "fecha" "mensaje"
  git add -A
  GIT_AUTHOR_NAME="${1% <*}" GIT_AUTHOR_EMAIL="$(sed 's/.*<\(.*\)>/\1/' <<<"$1")" GIT_AUTHOR_DATE="$2" \
  GIT_COMMITTER_NAME="${1% <*}" GIT_COMMITTER_EMAIL="$(sed 's/.*<\(.*\)>/\1/' <<<"$1")" GIT_COMMITTER_DATE="$2" \
    git commit -q -m "$3"
}
bundle() { git bundle create -q "$OUT/$1.bundle" --all; echo "bundle: $1 ($(git rev-list --count HEAD) commits)"; }

PABLO="Pablo Ruiz <pablo.ruiz@telon.test>"
LUCIA="Lucía Méndez <lucia.mendez@telon.test>"
ANA="Ana Comercial <ana.comercial@telon.test>"
EXT="Kike (externo) <kike@agenciaweb.test>"
TL="Marta Soto <marta.soto@telon.test>"

# ───────────────────────── control-acceso ─────────────────────────
repo control-acceso
cat > README.md <<'EOF'
# Control de acceso

Servicio que usan los lectores de la puerta para validar entradas.

- Valida la firma del QR con la clave compartida de Telón.
- Consulta el estado de la entrada en la API de Telón (`/api/v0/entradas/:id`).
- Marca la entrada como usada.

## Arrancar

    npm install
    TELON_API=https://api.telon.test npm start

El lector hace `POST /validar` con `{ "qr": "..." }`.
EOF
cat > package.json <<'EOF'
{
  "name": "acceso-puerta",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": { "start": "node index.js" },
  "dependencies": { "pg": "^8.11.0" }
}
EOF
mkdir -p lib bin
cat > lib/db.js <<'EOF'
var pg = require('pg')

// conexion directa a la bd de telon (mas rapido que la api en la puerta)
var pool = new pg.Pool({ connectionString: process.env.TELON_DB || 'postgres://telon:telon@localhost:5432/telon' })

module.exports = pool
EOF
cat > lib/validar.js <<'EOF'
var db = require('./db')

// qr = "<id entrada>.<firma>"
function validar(qr, cb) {
  var id = String(qr).split('.')[0]
  db.query("SELECT id, event_id, status, checked_in_at FROM tickets WHERE id = '" + id + "'", function (err, res) {
    if (err) return cb(err)
    if (res.rows.length == 0) return cb(null, { ok: false, motivo: 'NO_EXISTE' })
    var e = res.rows[0]
    if (e.checked_in_at) return cb(null, { ok: false, motivo: 'YA_DENTRO', hora: e.checked_in_at })
    db.query("UPDATE tickets SET checked_in_at = now() WHERE id = '" + id + "'", function (err2) {
      if (err2) return cb(err2)
      cb(null, { ok: true, entrada: e.id, evento: e.event_id })
    })
  })
}

module.exports = validar
EOF
cat > index.js <<'EOF'
var http = require('http')
var validar = require('./lib/validar')

var PUERTO = process.env.PUERTO || 4100

http.createServer(function (req, res) {
  if (req.method == 'POST' && req.url == '/validar') {
    var body = ''
    req.on('data', function (c) { body += c })
    req.on('end', function () {
      var qr
      try { qr = JSON.parse(body).qr } catch (e) { res.writeHead(400); return res.end('json?') }
      validar(qr, function (err, r) {
        if (err) { console.log(err); res.writeHead(500); return res.end('error') }
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(r))
      })
    })
  } else {
    res.writeHead(404); res.end()
  }
}).listen(PUERTO, function () { console.log('control acceso en ' + PUERTO) })
EOF
cat > .gitignore <<'EOF'
node_modules
EOF
commit "$PABLO" "2023-09-14T10:12:00+02:00" "control de acceso inicial"

cat > lib/aforo.js <<'EOF'
var db = require('./db')

// cuantos han entrado ya en un evento
module.exports = function aforo(evento, cb) {
  db.query('SELECT count(*) AS dentro FROM tickets WHERE event_id = $1 AND checked_in_at IS NOT NULL', [evento], function (err, res) {
    if (err) return cb(err)
    cb(null, { evento: evento, dentro: Number(res.rows[0].dentro) })
  })
}
EOF
python3 - <<'EOF'
s=open('index.js').read()
s=s.replace("var validar = require('./lib/validar')","var validar = require('./lib/validar')\nvar aforo = require('./lib/aforo')")
s=s.replace("""  } else {
    res.writeHead(404); res.end()""","""  } else if (req.method == 'GET' && req.url.indexOf('/aforo/') == 0) {
    aforo(req.url.split('/')[2], function (err, r) {
      if (err) { res.writeHead(500); return res.end('error') }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(r))
    })
  } else {
    res.writeHead(404); res.end()""")
open('index.js','w').write(s)
EOF
commit "$PABLO" "2024-02-20T18:40:00+01:00" "aforo en tiempo real para la sala"

cat > bin/validar.js <<'EOF'
#!/usr/bin/env node
// uso: node bin/validar.js <contenido del qr>
var validar = require('../lib/validar')
var db = require('../lib/db')

validar(process.argv[2], function (err, r) {
  if (err) console.error(err)
  else console.log(JSON.stringify(r))
  db.end()
})
EOF
python3 - <<'EOF'
s=open('lib/validar.js').read()
s=s.replace("""    var e = res.rows[0]
""","""    var e = res.rows[0]
    // hotfix incidencia sala lumen: entraba gente con pedidos que no se pagaron
    if (e.status == 'void') return cb(null, { ok: false, motivo: 'ANULADA' })
""")
open('lib/validar.js','w').write(s)
EOF
commit "$PABLO" "2024-11-08T22:51:00+01:00" "hotfix: las entradas anuladas no pasan"
bundle control-acceso

# ───────────────────────── tarifas ─────────────────────────
repo tarifas
mkdir -p promotores
cat > README.md <<'EOF'
# Tarifas de liquidación

Una tarifa por promotor, en `promotores/<slug>.tarifa`. La mantiene el equipo comercial.
La gramática está en GRAMATICA.md.
EOF
cat > GRAMATICA.md <<'EOF'
# Gramática de las tarifas

Una instrucción por línea. `#` es comentario.

    PROMOTOR <id>
    COMISION <porcentaje>% POR ENTRADA
    ZONA <zona> COMISION <porcentaje>%
    INVITACIONES SIN COMISION

Los porcentajes llevan coma decimal: `7,5%`.
EOF
cat > promotores/_defecto.tarifa <<'EOF'
# Tarifa por defecto para promotores sin acuerdo propio
COMISION 7,5% POR ENTRADA
INVITACIONES SIN COMISION
EOF
cat > promotores/sala-faro.tarifa <<'EOF'
# Sala Faro — acuerdo comercial marzo 2023
PROMOTOR TN-FARO
COMISION 7,5% POR ENTRADA
ZONA anfiteatro COMISION 5%
INVITACIONES SIN COMISION
EOF
commit "$ANA" "2023-03-02T12:00:00+01:00" "tarifas iniciales"

cat > promotores/teatro-lumen.tarifa <<'EOF'
# Teatro Lumen — acuerdo 2024
PROMOTOR TN-LUMEN
COMISION 8% POR ENTRADA
INVITACIONES SIN COMISION
EOF
commit "$ANA" "2024-01-15T09:30:00+01:00" "alta teatro lumen"

cat >> promotores/sala-faro.tarifa <<'EOF'
# renegociado 2025: minimo por entrada
MINIMO 0,30 POR ENTRADA
DESDE 2025-01-01 ZONA anfiteatro COMISION 6%
EOF
commit "$ANA" "2024-12-19T17:05:00+01:00" "sala faro: minimo y anfiteatro 2025"
bundle tarifas

# ───────────────────────── liquidaciones ─────────────────────────
repo liquidaciones
mkdir -p datos/2026-10-02 salida
cat > README.md <<'EOF'
# Liquidaciones

Batch nocturno que calcula cuánto se paga a cada promotor. Usa la comisión que guarda Telón en cada entrada.

    ./exportar.sh 2026-10-02       # saca los datos del día de Telón
    python3 liquidar.py 2026-10-02 # calcula y deja el resultado en salida/
EOF
cat > exportar.sh <<'EOF'
#!/bin/sh
# Exporta de la bd de Telón las ventas de un día. Necesita psql y TELON_DB.
set -e
DIA=$1
mkdir -p datos/$DIA
psql "$TELON_DB" -c "\copy (SELECT o.id, o.tenant_id, o.event_id, o.paid_at FROM orders o WHERE o.status = 'paid' AND o.paid_at::date = '$DIA') TO 'datos/$DIA/pedidos.csv' CSV HEADER"
psql "$TELON_DB" -c "\copy (SELECT t.id, t.order_id, t.kind, t.seat_id, s.zone, t.price_cents FROM tickets t JOIN orders o ON o.id = t.order_id LEFT JOIN seats s ON s.event_id = t.event_id AND s.id = t.seat_id WHERE o.status = 'paid' AND o.paid_at::date = '$DIA') TO 'datos/$DIA/entradas.csv' CSV HEADER"
echo "exportado datos/$DIA"
EOF
chmod +x exportar.sh
cat > liquidar.py <<'EOF'
import csv
import os
import sys

TARIFAS = os.path.join(os.path.dirname(__file__), '..', 'tarifas', 'promotores')


def leer_tarifa(tenant):
    # busca la tarifa del promotor por su id; si no hay, la de defecto
    t = {'comision': 0.0, 'zonas': {}, 'invitaciones': True}
    for fichero in os.listdir(TARIFAS):
        lineas = open(os.path.join(TARIFAS, fichero)).read().splitlines()
        if 'PROMOTOR ' + tenant in lineas:
            break
    else:
        lineas = open(os.path.join(TARIFAS, '_defecto.tarifa')).read().splitlines()
    for l in lineas:
        l = l.strip()
        if not l or l.startswith('#'):
            continue
        p = l.split()
        if p[0] == 'COMISION':
            t['comision'] = float(p[1].replace('%', '').replace(',', '.'))
        elif p[0] == 'ZONA':
            t['zonas'][p[1]] = float(p[3].replace('%', '').replace(',', '.'))
        elif p[0] == 'INVITACIONES':
            t['invitaciones'] = False
    return t


def comision(entrada, tarifa):
    precio = int(entrada['price_cents'])
    if precio == 0 and not tarifa['invitaciones']:
        return 0
    pct = tarifa['zonas'].get(entrada['zone'], tarifa['comision'])
    return round(precio * pct / 100)


def main(dia):
    pedidos = {p['id']: p for p in csv.DictReader(open('datos/%s/pedidos.csv' % dia))}
    entradas = list(csv.DictReader(open('datos/%s/entradas.csv' % dia)))
    por_promotor = {}
    for e in entradas:
        tenant = pedidos[e['order_id']]['tenant_id']
        r = por_promotor.setdefault(tenant, {'ventas': 0, 'comision': 0, 'entradas': 0})
        tarifa = leer_tarifa(tenant)
        r['ventas'] += int(e['price_cents'])
        r['comision'] += comision(e, tarifa)
        r['entradas'] += 1
    os.makedirs('salida', exist_ok=True)
    with open('salida/%s.csv' % dia, 'w') as f:
        w = csv.writer(f)
        w.writerow(['promotor', 'entradas', 'ventas_cents', 'comision_cents', 'a_pagar_cents'])
        for tenant, r in sorted(por_promotor.items()):
            w.writerow([tenant, r['entradas'], r['ventas'], r['comision'], r['ventas'] - r['comision']])
            print('%-10s %3d entradas  ventas %8.2f  comision %7.2f  a pagar %8.2f' % (
                tenant, r['entradas'], r['ventas'] / 100, r['comision'] / 100, (r['ventas'] - r['comision']) / 100))


if __name__ == '__main__':
    main(sys.argv[1])
EOF
cat > datos/2026-10-02/pedidos.csv <<'EOF'
id,tenant_id,event_id,paid_at
PED-2026-0101,TN-FARO,EV-FARO-0042,2026-10-02 10:02:11+02
PED-2026-0104,TN-LUMEN,EV-LUMEN-0007,2026-10-02 13:20:45+02
PED-2026-0107,TN-FARO,EV-FARO-0042,2026-10-02 18:42:00+02
EOF
cat > datos/2026-10-02/entradas.csv <<'EOF'
id,order_id,kind,seat_id,zone,price_cents
PED-2026-0101-1,PED-2026-0101,seat,M-3,anfiteatro,2400
PED-2026-0101-2,PED-2026-0101,seat,M-4,anfiteatro,2400
PED-2026-0104-1,PED-2026-0104,pass,,,1500
PED-2026-0104-2,PED-2026-0104,pass,,,1500
PED-2026-0107-1,PED-2026-0107,seat,F-12,platea,3550
PED-2026-0107-2,PED-2026-0107,seat,F-13,platea,3550
PED-2026-0107-3,PED-2026-0107,pass,,,6000
EOF
cat > .gitignore <<'EOF'
salida/
__pycache__/
EOF
commit "$LUCIA" "2022-06-30T20:15:00+02:00" "liquidacion diaria por promotor"

python3 - <<'EOF'
s=open('liquidar.py').read()
s=s.replace("""        elif p[0] == 'INVITACIONES':""","""        elif p[0] == 'MINIMO':
            t['minimo'] = int(round(float(p[1].replace(',', '.')) * 100))
        elif p[0] == 'INVITACIONES':""")
s=s.replace("""    pct = tarifa['zonas'].get(entrada['zone'], tarifa['comision'])
    return round(precio * pct / 100)""","""    pct = tarifa['zonas'].get(entrada['zone'], tarifa['comision'])
    return max(round(precio * pct / 100), tarifa.get('minimo', 0))""")
open('liquidar.py','w').write(s)
EOF
commit "$LUCIA" "2025-01-09T11:48:00+01:00" "minimo por entrada (tarifa sala faro 2025)"
bundle liquidaciones

# ───────────────────────── widget-embebido ─────────────────────────
repo widget-embebido
cat > README.md <<'EOF'
# Widget de Telón para webs de promotores

Pega esto en tu web y tendrás el botón de compra:

    <div id="telon"></div>
    <script src="https://cdn.telon.test/widget.js"></script>
    <script>Telon.init({ apiKey: 'TU_API_KEY', evento: 'EV-...' })</script>

El widget llama a `GET /api/v0/widget?apiKey=...&evento=...` y pinta los precios.
EOF
cat > widget.js <<'EOF'
/* Telon widget v1 — no tocar sin hablar con Kike */
(function (w, $) {
  var Telon = {}
  Telon.init = function (opts) {
    var base = opts.base || 'https://entradas.telon.test'
    $.ajax({
      url: base + '/api/public/events/' + opts.evento,
      headers: { 'x-telon-tenant-slug': opts.promotor },
      success: function (ev) {
        var html = '<div class="telon-w"><b>' + ev.title + '</b><ul>'
        $.each(ev.passes, function (i, p) { html += '<li>' + p.name + ' — ' + (p.price_cents / 100) + ' €</li>' })
        html += '</ul><a href="' + base + '/t/' + opts.promotor + '/e/' + opts.evento + '">Comprar</a></div>'
        $('#telon').html(html)
      }
    })
  }
  w.Telon = Telon
})(window, jQuery)
EOF
cat > ejemplo.html <<'EOF'
<!doctype html>
<html><head><meta charset="utf-8"><script src="https://code.jquery.com/jquery-1.12.4.min.js"></script></head>
<body>
  <h1>Web de la Sala Faro</h1>
  <div id="telon"></div>
  <script src="widget.js"></script>
  <script>Telon.init({ promotor: 'sala-faro', evento: 'EV-FARO-0042', base: 'http://localhost:5173' })</script>
</body></html>
EOF
commit "$EXT" "2023-05-22T16:00:00+02:00" "widget v1"
sed -i 's|/api/v0/widget?apiKey=|/api/v0/widget?apiKey=|' README.md
echo "" >> widget.js
commit "$EXT" "2024-06-03T09:14:00+02:00" "compatibilidad con la api publica nueva"
bundle widget-embebido

# ───────────────────────── contexto-equipo ─────────────────────────
repo contexto-equipo
cat > README.md <<'EOF'
# Contexto del equipo

Aquí debería estar lo que une los repositorios: qué hace cada uno, de quién depende y qué contratos comparten.

Pendiente.
EOF
commit "$TL" "2026-09-30T09:00:00+02:00" "repo para el contexto comun"
bundle contexto-equipo
