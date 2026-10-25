# Contexto del equipo — lo que une los repositorios

Léelo antes de cambiar cualquier repo heredado. Cada repo tiene además su propio `AGENTS.md`.

## Mapa

```text
            ┌────────────── BD de Telón (PostgreSQL) ──────────────┐
            │ orders · tickets · seats                              │
            └──▲──────────────────▲─────────────────────────────────┘
   lee/escribe │ tickets           │ lee (exportar.sh)
     control-acceso          liquidaciones ──lee──▶ ../tarifas/promotores/*.tarifa
                                                         (repo tarifas)
     widget-embebido ──HTTP──▶ API pública de Telón (/api/public/events/:id)
```

## Contratos

| Quién | Usa | Qué asume | Riesgo |
|-------|-----|-----------|--------|
| control-acceso | `tickets.id`, `status`, `checked_in_at`, `event_id` | Solo `void` es inválido | Cualquier estado nuevo de Telón entra en la sala |
| liquidaciones | `orders` (pagados), `tickets.price_cents`, `seats.zone` | Toda entrada de un pedido pagado es venta | Entradas devueltas se liquidan |
| liquidaciones | `../tarifas/promotores/*.tarifa` | `tarifas` clonado al lado | Sin él, falla al abrir el directorio |
| widget-embebido | `GET /api/public/events/:id` (`title`, `passes`) | Campos estables | Webs de terceros rotas |

**Estados de `tickets.status` en Telón:** `pending`, `valid`, `void`, `refunded` (desde DEV-412, octubre de 2026). Solo `valid` es una entrada que vale.

## Cuando cambies…

- …el esquema o los estados de `tickets` en Telón → revisa control-acceso y liquidaciones.
- …una tarifa → avisa a quien mantenga liquidaciones si usa una instrucción nueva.
- …la API pública de eventos → el widget.

## Dinámica del equipo

Ver `DINAMICA.md`.
