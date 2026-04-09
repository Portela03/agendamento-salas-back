#!/bin/sh
set -e

echo "[backend] Running database migrations..."
npx prisma migrate deploy

echo "[backend] Starting API server..."
exec node dist/main/server.js
