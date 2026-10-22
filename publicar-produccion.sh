#!/usr/bin/env bash
# Publica en producción (giandeco.com) lo que ya está en master.
#   bash publicar-produccion.sh
#
# Staging:    origin      -> yedi06/giandeco-studio-design   (yedi06.github.io/giandeco-studio-design)
# Producción: produccion  -> yedi06/giandeco-web             (giandeco.com)
#
# Producción recibe el mismo contenido de master más el CNAME con el dominio.
set -euo pipefail

DOMINIO="giandeco.com"
# Lo que NO se publica en producción: backend (SQL y funciones), documentación interna, herramientas de
# desarrollo y la lista interna de material pendiente. El sitio no los necesita; así el repositorio
# público de producción solo trae lo que el navegador carga.
FUERA="hacer-seo.js hacer-rutas.js hacer-proyectos.js rutas.js previsualizar.py publicar-produccion.sh package-lock.json material-pendiente.html"
FUERA_CARPETAS="backend docs _respaldo"

git diff --quiet master -- . ':!index.ANTES-HERO-VIDEO.html.bak' || { echo "Hay cambios sin commit: haga commit en master antes de publicar."; exit 1; }

export GIT_INDEX_FILE="$(mktemp)"
trap 'rm -f "$GIT_INDEX_FILE"' EXIT
git read-tree master
for f in $FUERA; do git update-index --force-remove "$f" 2>/dev/null || true; done
for d in $FUERA_CARPETAS; do git ls-tree -r --name-only master -- "$d" | while IFS= read -r f; do git update-index --force-remove "$f"; done; done
blob=$(printf '%s\n' "$DOMINIO" | git hash-object -w --stdin)
git update-index --add --cacheinfo 100644,"$blob",CNAME
tree=$(git write-tree)
commit=$(git commit-tree "$tree" -p master -m "Producción: $(git log -1 --format=%s master)")

git push --force produccion "$commit":refs/heads/main
echo "Publicado en https://$DOMINIO  (commit $(git rev-parse --short master) de master)"
