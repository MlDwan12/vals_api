#!/bin/sh
set -eu

echo "Starting container..."

: "${DB_HOST:?DB_HOST is required}"
: "${DB_PORT:?DB_PORT is required}"
: "${DB_USER:?DB_USER is required}"
: "${DB_PASS:?DB_PASS is required}"
: "${DB_NAME:?DB_NAME is required}"

echo "Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT}..."

until nc -z "$DB_HOST" "$DB_PORT"; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is up - running migrations"

yarn migration:run

echo "Migrations completed - starting application"

exec node dist/main.js