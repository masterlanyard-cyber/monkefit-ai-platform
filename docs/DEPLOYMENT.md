# Monkefit AI Deployment Guide

## Hostinger Web Apps deployment

Deploy the repository as a Node.js Web App from GitHub.

Recommended settings:

```text
Repository: masterlanyard-cyber/monkefit-ai-platform
Branch: main
Node.js: 20 or newer
Build command: npm install
Start command: npm start
```

## Required environment variables

```env
NODE_ENV=production
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4.1-mini
MKB_ROOT=./mkb
DATA_DIR=./data
STORAGE_ADAPTER=json
SQLITE_PATH=./data/monkefit.db
API_SECRET=generate_a_long_random_secret
ALLOWED_ORIGINS=https://www.monkefit.com,https://monkefit.com
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60
```

Never commit `.env` or customer data.

## Storage adapters

The runtime uses a repository abstraction, so lead and session business logic is independent from the storage engine.

### JSON mode

```env
STORAGE_ADAPTER=json
```

This is the safest default for the first Hostinger deployment. It has no native dependency and automatically stores data under `DATA_DIR`.

### SQLite mode

```env
STORAGE_ADAPTER=sqlite
SQLITE_PATH=./data/monkefit.db
```

SQLite uses the optional `better-sqlite3` dependency. If the Hostinger build environment cannot compile or install it, the application automatically falls back to JSON and logs a warning.

To migrate existing JSON records into SQLite:

```bash
npm run migrate:storage
```

Run the migration before changing `STORAGE_ADAPTER` to `sqlite`.

## Persistence warning

Confirm with Hostinger that the application data directory survives redeployment. If deployment replaces the filesystem, use an external managed database before live customer traffic. The repository abstraction allows a PostgreSQL or Supabase adapter to be added without rewriting the lead and conversation engines.

## Health check

After deployment, open:

```text
https://YOUR-APP-DOMAIN/api/health
```

The response should report:

- MKB healthy,
- OpenAI key configured,
- API protection enabled,
- persistent storage enabled,
- active storage adapter.

## Production checks

1. `GET /api/health` returns HTTP 200.
2. MKB reports no missing active files.
3. `OPENAI_API_KEY` is present.
4. `API_SECRET` is set.
5. `DATA_DIR` is writable.
6. Allowed origins contain only approved Monkefit domains.
7. Customer personal-data retention is reviewed before WhatsApp rollout.
