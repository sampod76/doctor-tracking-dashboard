#!/usr/bin/env sh
#! not use at this moment use directly pm2 in Dockerfile
set -e

echo "Starting PM2..."
exec pm2-runtime start ecosystem.config.js --env production
