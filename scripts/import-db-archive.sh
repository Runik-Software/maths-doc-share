#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MEDIA_DIR="${ROOT_DIR}/public/media"
MODE="host"
ARCHIVE_PATH=""
DB_DOCKER_SERVICE="${DB_DOCKER_SERVICE:-postgres}"

usage() {
  cat <<'EOF'
Usage: ./scripts/import-db-archive.sh [--docker|--host] [archive-path]

Restores the database dump and copies the media files from a backup archive.

Examples:
  ./scripts/import-db-archive.sh ./backups/backup.tar.gz
  ./scripts/import-db-archive.sh --docker ./backups/backup.tar.gz
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --docker)
      MODE="docker"
      ;;
    --host)
      MODE="host"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      if [[ -n "${ARCHIVE_PATH}" ]]; then
        echo "Unexpected argument: $1" >&2
        usage >&2
        exit 1
      fi
      ARCHIVE_PATH="$1"
      ;;
  esac
  shift
done

if [[ -z "${ARCHIVE_PATH}" ]]; then
  if [[ -d "${ROOT_DIR}/backups" ]]; then
    ARCHIVE_PATH="$(find "${ROOT_DIR}/backups" -maxdepth 1 -type f -name '*.tar.gz' | sort | tail -n 1)"
  fi
fi

if [[ -z "${ARCHIVE_PATH}" || ! -f "${ARCHIVE_PATH}" ]]; then
  echo "A valid archive path is required. Pass a .tar.gz file or place one under backups/." >&2
  exit 1
fi

if [[ "${MODE}" == "docker" ]]; then
  if command -v docker >/dev/null 2>&1; then
    if docker compose version >/dev/null 2>&1; then
      COMPOSE_CMD=(docker compose)
    elif command -v docker-compose >/dev/null 2>&1; then
      COMPOSE_CMD=(docker-compose)
    else
      echo "docker compose is required for --docker mode." >&2
      exit 1
    fi
  else
    echo "docker is required for --docker mode." >&2
    exit 1
  fi
else
  if ! command -v pg_restore >/dev/null 2>&1; then
    echo "pg_restore is required for host mode." >&2
    exit 1
  fi
fi

DB_HOST="${DB_HOST:-}"
DB_PORT="${DB_PORT:-}"
DB_NAME="${DB_NAME:-}"
DB_USER="${DB_USER:-}"
DB_PASSWORD="${DB_PASSWORD:-}"

if [[ -n "${DATABASE_URL:-}" ]] && [[ -z "${DB_HOST}${DB_PORT}${DB_NAME}${DB_USER}${DB_PASSWORD}" ]]; then
  DB_HOST="$(DATABASE_URL="${DATABASE_URL}" node -e 'const u = new URL(process.env.DATABASE_URL); console.log(u.hostname || "localhost")')"
  DB_PORT="$(DATABASE_URL="${DATABASE_URL}" node -e 'const u = new URL(process.env.DATABASE_URL); console.log(u.port || "5432")')"
  DB_NAME="$(DATABASE_URL="${DATABASE_URL}" node -e 'const u = new URL(process.env.DATABASE_URL); console.log((u.pathname || "/").replace(/^\/+/, "") || "postgres")')"
  DB_USER="$(DATABASE_URL="${DATABASE_URL}" node -e 'const u = new URL(process.env.DATABASE_URL); console.log(decodeURIComponent(u.username || ""))')"
  DB_PASSWORD="$(DATABASE_URL="${DATABASE_URL}" node -e 'const u = new URL(process.env.DATABASE_URL); console.log(decodeURIComponent(u.password || ""))')"
fi

if [[ "${MODE}" == "host" ]] && [[ -z "${DATABASE_URL:-}" ]] && [[ -z "${DB_HOST}${DB_PORT}${DB_NAME}${DB_USER}${DB_PASSWORD}" ]]; then
  echo "DATABASE_URL must be set for host mode, or provide DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD." >&2
  exit 1
fi

if [[ "${MODE}" == "docker" ]]; then
  DB_HOST="${DB_HOST:-}"
  DB_PORT="${DB_PORT:-}"
  DB_NAME="${DB_NAME:-${POSTGRES_DB:-maths-doc-share}}"
  DB_USER="${DB_USER:-${POSTGRES_USER:-postgres}}"
  DB_PASSWORD="${DB_PASSWORD:-${POSTGRES_PASSWORD:-S3cret}}"
else
  DB_HOST="${DB_HOST:-localhost}"
  DB_PORT="${DB_PORT:-5432}"
  DB_NAME="${DB_NAME:-postgres}"
  DB_USER="${DB_USER:-postgres}"
fi

TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TEMP_DIR}"' EXIT

echo "Extracting archive: ${ARCHIVE_PATH}"
tar -xzf "${ARCHIVE_PATH}" -C "${TEMP_DIR}"

DUMP_FILE="${TEMP_DIR}/database.dump"
if [[ ! -f "${DUMP_FILE}" ]]; then
  echo "Archive does not contain a database dump at database.dump" >&2
  exit 1
fi

mkdir -p "${MEDIA_DIR}"
if [[ -d "${TEMP_DIR}/media" ]]; then
  cp -R "${TEMP_DIR}/media/." "${MEDIA_DIR}/"
fi

echo "Restoring database..."
if [[ "${MODE}" == "docker" ]]; then
  CONTAINER_DUMP_PATH="/tmp/database.dump"
  (
    cd "${ROOT_DIR}"
    "${COMPOSE_CMD[@]}" cp "${DUMP_FILE}" "${DB_DOCKER_SERVICE}:${CONTAINER_DUMP_PATH}"
    "${COMPOSE_CMD[@]}" exec -T "${DB_DOCKER_SERVICE}" env PGPASSWORD="${DB_PASSWORD}" pg_restore --clean --if-exists --no-owner --no-acl -U "${DB_USER}" -d "${DB_NAME}" "${CONTAINER_DUMP_PATH}"
    "${COMPOSE_CMD[@]}" exec -T "${DB_DOCKER_SERVICE}" rm -f "${CONTAINER_DUMP_PATH}"
  )
else
  PGPASSWORD="${DB_PASSWORD}" pg_restore --clean --if-exists --no-owner --no-acl -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" "${DUMP_FILE}"
fi

echo "Import complete."
