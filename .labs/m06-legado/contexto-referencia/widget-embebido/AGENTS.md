# widget-embebido — contexto para agentes

Widget v1 (jQuery 1.x) que algunos promotores pegan en su web para mostrar precios y enlazar a la tienda. Sin build ni tests.

## Cómo funciona (comprobado; el README no es fiable)

- `Telon.init({ promotor, evento, base })`: llama a `GET <base>/api/public/events/<evento>` con la cabecera `x-telon-tenant-slug`. **No** usa `/api/v0/widget` ni `apiKey`, aunque el README lo diga.
- Pinta los pases (`ev.passes`) y un enlace a `<base>/t/<promotor>/e/<evento>`. No muestra butacas.
- `ejemplo.html` lo prueba contra la tienda local (`base: 'http://localhost:5173'`).

## Contrato

Depende de la respuesta pública de `GET /api/public/events/:id` de Telón (`title`, `passes[].name`, `passes[].price_cents`). Si Telón cambia esos campos, el widget se rompe en webs de terceros que no controlamos.

## No hacer

- No cambiar la firma de `Telon.init`: está pegada en webs de promotores.
