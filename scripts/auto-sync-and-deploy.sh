#!/usr/bin/env bash
set -euo pipefail

export PATH="/Users/teste/.bun/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
REPO_DIR="/Users/teste/.gemini/antigravity/scratch/rr-store"

cd "$REPO_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Iniciando sincronização automática GSM + Souza Eletrônicos..."
node scripts/sync-all.mjs

if [ -n "$(git status --porcelain data/sousa-live.json data/gsm-live.json data/last-sync-report.json)" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Mudanças detectadas. Publicando no GitHub e Vercel..."
  git add data/sousa-live.json data/gsm-live.json data/last-sync-report.json
  git commit -m "chore: auto-sync GSM Digital & Souza Eletrônicos catalog"
  git push origin main
  /Users/teste/.bun/bin/vercel deploy "$REPO_DIR" --prod --yes
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Publicação concluída com sucesso."
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Nenhuma alteração nos catálogos."
fi
