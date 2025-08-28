# Database for local development

This folder contains everything needed to run a local MongoDB instance with starter data and indexes.

### Files
- `docker-compose.yml` - runs MongoDB and mounts `mongo-init/` scripts into the container.

- `mongo-init/01-create-indexes.js` - creates indexes for `meetings` and `phrases`.

- `mongo-init/02-seed-demo.js` - adds a demo meeting and a demo phrase.

- `.env.example` - example env variables for local use.

### Getting started
From the repository root:
```sh
cp db/.env.example .env
docker compose -f db/docker-compose.yml up -d
```

Recommended app env (used by the orchestrator):
- `MONGODB_URI` — Mongo connection string, e.g. `mongodb://root:example@localhost:27017/?authSource=admin`

- `DB_NAME` — database name (default: `verbatim-db`)

The orchestrator uses [`connect_to_mongodb`](apps/services/orchestrator/db/connection.py) to connect. Application DB helpers can be found at:

- [`apps/services/orchestrator/db/connection.py`](apps/services/orchestrator/db/connection.py)

- [`apps/services/orchestrator/db/meetings.py`](apps/services/orchestrator/db/meetings.py)

- [`apps/services/orchestrator/db/phrases.py`](apps/services/orchestrator/db/phrases.py)