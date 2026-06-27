#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MEDIA_DIR="${ROOT_DIR}/public/media"
BACKUP_DIR="${ROOT_DIR}/backups"
MODE="host"
ARCHIVE_PATH=""
DB_DOCKER_SERVICE="${DB_DOCKER_SERVICE:-postgres}"

usage() {
  cat <<'EOF'
Usage: ./scripts/export-db-archive.sh [--docker|--host] [archive-path]

Exports the database and the contents of public/media into a .tar.gz archive.

Examples:
  ./scripts/export-db-archive.sh
  ./scripts/export-db-archive.sh --docker ./backups/backup.tar.gz
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
  mkdir -p "${BACKUP_DIR}"
  TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
  ARCHIVE_PATH="${BACKUP_DIR}/maths-doc-share-${TIMESTAMP}.tar.gz"
fi

mkdir -p "$(dirname "${ARCHIVE_PATH}")"

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
  if ! command -v pg_dump >/dev/null 2>&1; then
    echo "pg_dump is required for host mode." >&2
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

DUMP_FILE="${TEMP_DIR}/database.dump"

mkdir -p "${MEDIA_DIR}"
mkdir -p "${TEMP_DIR}/media"

echo "Exporting database..."
if [[ "${MODE}" == "docker" ]]; then
  (
    cd "${ROOT_DIR}"
    "${COMPOSE_CMD[@]}" exec -T "${DB_DOCKER_SERVICE}" env PGPASSWORD="${DB_PASSWORD}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --format=custom > "${DUMP_FILE}"
  )
else
  PGPASSWORD="${DB_PASSWORD}" pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" --format=custom > "${DUMP_FILE}"
fi

if [[ -d "${MEDIA_DIR}" ]]; then
  cp -R "${MEDIA_DIR}/." "${TEMP_DIR}/media/"
fi

echo "Creating archive: ${ARCHIVE_PATH}"
tar -czf "${ARCHIVE_PATH}" -C "${TEMP_DIR}" database.dump media

echo "Backup complete: ${ARCHIVE_PATH}"
