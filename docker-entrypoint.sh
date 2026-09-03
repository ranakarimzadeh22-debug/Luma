#!/bin/sh
set -e

npx prisma migrate deploy

if [ -n "$LUMA_CORE_DATABASE_URL" ]; then
  node scripts/apply-luma-core-migrations.mjs
fi

exec node server.js
