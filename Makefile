# Developer 10x — comandos del curso
#
#   make up-mXX     levanta Telón tal como lo tienes (con tus cambios)
#   make init-mXX   devuelve telon/ al punto de partida del lab mXX (descarta cambios)
#   make init-m06   prepara los repos heredados del M06 en workspace/m06/
#
# Funciona dentro del Dev Container (local o Codespaces) y en tu máquina con Node 22 + Docker.

SHELL := /bin/bash
COMPOSE := docker compose -f infra/compose.yaml
LABS := m01 m02 m03 m04 m05

.DEFAULT_GOAL := help
.PHONY: help setup infra dev db-reset test up-docker status init-m06 up-m06 contexto-m06 $(addprefix up-,$(LABS)) $(addprefix init-,$(LABS))

help:
	@echo "Telón · Developer 10x"
	@echo
	@echo "  make up-m01 … up-m05     levanta la plataforma en el estado actual de telon/"
	@echo "  make init-m01 … init-m05 devuelve telon/ al punto de partida del lab (pide confirmación)"
	@echo "  make init-m06 / up-m06   repos heredados y clones dev1/dev2 del M06"
	@echo "  make contexto-m06        contexto de referencia subido por dev1 (para el lab de dev2)"
	@echo "  make status              en qué lab está telon/"
	@echo "  make db-reset            base de datos limpia con los datos de ejemplo"
	@echo "  make test                tests de Telón"
	@echo "  make up-docker           toda la plataforma en contenedores (sin Node en tu máquina)"
	@echo
	@echo "  Tienda      http://localhost:5173   (Sala Faro: http://entradas.salafaro.localhost:5173)"
	@echo "  Backoffice  http://localhost:5174   (token: faro-dev-token)"
	@echo "  Mailpit     http://localhost:8025"

setup:
	cd telon && npm install

# Dentro del Dev Container la infraestructura ya está levantada por el compose
infra:
	@if [ -z "$$TELON_DEVCONTAINER" ]; then $(COMPOSE) up -d --wait postgres redis mailpit; fi

dev: infra
	@[ -d telon/node_modules ] || $(MAKE) --no-print-directory setup
	cd telon && npm run dev

$(addprefix up-,$(LABS)): up-%:
	@node scripts/lab.mjs check $*
	@$(MAKE) --no-print-directory dev

$(addprefix init-,$(LABS)): init-%:
	@node scripts/lab.mjs init $*
	@$(MAKE) --no-print-directory infra
	@[ -d telon/node_modules ] || $(MAKE) --no-print-directory setup
	@cd telon && npm install --no-audit --no-fund >/dev/null && npm run db:reset
	@echo "Listo. Arranca con: make up-$*"

status:
	@node scripts/lab.mjs status

db-reset: infra
	cd telon && npm run db:reset

test:
	cd telon && npm test

up-docker:
	$(COMPOSE) --profile app up

init-m06:
	@node scripts/m06.mjs init

up-m06:
	@node scripts/m06.mjs up

contexto-m06:
	@node scripts/m06.mjs contexto
