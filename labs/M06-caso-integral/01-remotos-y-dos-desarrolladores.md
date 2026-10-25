# Remotos y dos desarrolladores

[← Página anterior](00-el-legado.md) · [Siguiente página →](02-lab-explorar-y-contextualizar.md)

Para comprobar que el contexto vive en el repositorio y no en la cabeza (o en el chat) de alguien, hacen falta dos personas que solo se comunican por git. En este curso eres las dos: `dev1` y `dev2`, con dos clones de cada repositorio heredado y un remoto común. Esta página explica cómo se monta y cómo se comprueba.

## Cómo queda

```text
workspace/m06/                       (no se versiona; lo crea make init-m06)
├── remotes/                         modo local: el «servidor» del equipo
│   ├── control-acceso.git
│   ├── liquidaciones.git
│   ├── tarifas.git
│   ├── widget-embebido.git
│   └── contexto-equipo.git
├── dev1/                            clones de dev1 (user.name «Dev Uno»)
│   ├── control-acceso/   ──origin──▶ remotes/control-acceso.git
│   └── …
└── dev2/                            clones de dev2 (user.name «Dev Dos»)
    ├── control-acceso/   ──origin──▶ remotes/control-acceso.git
    └── …
```

`dev1` hace `git push` y `dev2` hace `git pull` del mismo remoto. Nada más los une.

## Dónde están los remotos

| Modo | Remotos | Qué necesitas | Para qué |
|------|---------|---------------|----------|
| `local` (por defecto) | Repos *bare* en `workspace/m06/remotes/` | Nada | Trabajar sin red ni credenciales |
| `github` | Repos privados en tu cuenta: `telon-legado-control-acceso`, … | `gh auth login` | Pull requests reales entre `dev1` y `dev2` |

El modo se elige en el fichero `.env` de la raíz de tu fork:

```bash
cp .env.example .env      # desde la raíz del repositorio (no desde telon/)
```

```ini
M06_REMOTE_MODE=local
# Solo modo github:
M06_GH_OWNER=tu-usuario
M06_GH_PREFIX=telon-legado-
M06_GH_VISIBILITY=private
```

`.env` no se versiona: es configuración tuya.

## Comandos

| Comando | Qué hace |
|---------|----------|
| `make init-m06` | Borra `workspace/m06/` y lo crea desde cero: remotos con el historial original y clones de `dev1` y `dev2` |
| `make up-m06` | No cambia nada: hace `fetch` y muestra la rama, los cambios pendientes y el `origin` de cada clon |

En modo `github`, `init` crea los repos si no existen y **reescribe** su historial (*force push*). Por eso pide confirmación:

```bash
CONFIRM=1 make init-m06
```

Solo toca repos cuyo nombre empieza por el prefijo de `M06_GH_PREFIX`.

## Comprobar que está bien montado

Desde `telon/`:

```bash
make init-m06
cd ../workspace/m06/dev1/control-acceso && git remote -v && git log --format='%an · %ad · %s' --date=short
```

Resultado:

```text
origin  /workspaces/developer-10x/workspace/m06/remotes/control-acceso.git (fetch)
origin  /workspaces/developer-10x/workspace/m06/remotes/control-acceso.git (push)
Pablo Ruiz · 2024-11-08 · hotfix: las entradas anuladas no pasan
Pablo Ruiz · 2024-02-20 · aforo en tiempo real para la sala
Pablo Ruiz · 2023-09-14 · control de acceso inicial
```

El mismo comando en `dev2/control-acceso` da el mismo `origin` y el mismo historial.

## Dos ventanas, dos chats

Cada desarrollador trabaja en su carpeta, con su propio chat del asistente:

| Entorno | `dev1` | `dev2` |
|---------|--------|--------|
| Cursor o VS Code (local) | Desde la terminal del contenedor: `code ../workspace/m06/dev1` (o `cursor …`). Abre otra ventana | Lo mismo con `dev2` |
| Claude Code | Terminal 1: `cd ../workspace/m06/dev1 && claude` | Terminal 2: `cd ../workspace/m06/dev2 && claude` |
| Codespaces en el navegador | La pestaña del codespace con **File → Open Folder** en `dev1` | Una segunda pestaña del mismo codespace abierta en `dev2`, o Claude Code en otra terminal |

Lo importante es que el chat de `dev2` empiece vacío y abierto en la carpeta de `dev2`.

> [!WARNING]
> Las «memorias» del asistente pueden pasar información entre chats sin que se vea: las de Cursor, la memoria de Copilot o el `~/.claude` de Claude Code. Para que la prueba de `dev2` sea limpia, desactívalas o bórralas antes de empezar con `dev2`.

## Si algo se tuerce

| Síntoma | Causa | Arreglo |
|---------|-------|---------|
| `No hay nada en workspace/m06/` | No se ha hecho `init` | `make init-m06` |
| `Modo github: falta M06_GH_OWNER en .env` | `.env` incompleto | Rellena `M06_GH_OWNER` |
| `dev2` no ve los cambios de `dev1` | `dev1` hizo commit pero no `push` | `git push` en el clon de `dev1` |
| Quieres empezar otra vez | — | `make init-m06` (borra todo lo de `workspace/m06/`) |
