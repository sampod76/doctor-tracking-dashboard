#!/usr/bin/env bash
set -Eeuo pipefail

log() { echo -e "\n\033[1;32m*$1*\033[0m"; }

APP_DIR="$HOME/apps/doctor-tracking-dashboard"
OWNER="sampod76"
IMAGE="ghcr.io/$OWNER/doctor-tracking-dashboard:latest"

cd "$APP_DIR"

log "Pulling latest image"
docker pull "$IMAGE"

log "Restarting frontend container"
docker compose -f docker-compose.pro.yml up -d --no-build --force-recreate app

log "Cleaning unused images"
docker image prune -f
docker builder prune -f
# docker container prune -f

log "Frontend deployed successfully"

exit 0
