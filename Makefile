.PHONY: help install dev build preview typecheck original

help:
	@echo "install    - npm install em app/ (via mise exec)"
	@echo "dev        - sobe o dev server da versao TypeScript/Vite (app/)"
	@echo "build      - build de producao da versao TypeScript/Vite (app/)"
	@echo "preview    - preview do build de producao (app/)"
	@echo "typecheck  - roda tsc --noEmit em app/"
	@echo "original   - serve os arquivos originais (v1.straight.html etc.) na raiz, porta 8000"

install:
	cd app && mise exec -- npm install

dev:
	cd app && mise exec -- npm run dev

build:
	cd app && mise exec -- npm run build

preview:
	cd app && mise exec -- npm run preview

typecheck:
	cd app && mise exec -- npm run typecheck

original:
	python3 -m http.server 8000
