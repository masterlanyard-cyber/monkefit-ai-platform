# Monkefit AI Deployment Guide

## Recommended architecture

Run the Monkefit AI API as a separate Node.js service, then connect the Hostinger website and WhatsApp provider to its HTTPS URL.

Hostinger shared website hosting may remain unchanged. The API can run on a Hostinger VPS or another Docker-compatible service.

## Required environment variables

Copy `.env.example` to `.env` and fill:

```env
PORT=3000
NODE_ENV=production
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4.1-mini
MKB_ROOT=./mkb
DATA_DIR=./data
```

Never commit `.env`.

## Run with Docker Compose

```bash
docker compose up -d --build
```

Check health:

```bash
curl http://localhost:3000/api/health
```

## Persistent data

Docker Compose mounts a named volume at `/app/data`. Leads and conversation sessions survive container restarts.

For an MVP this JSON persistence is sufficient for low-to-moderate traffic. Before high-volume production, migrate the storage adapter to PostgreSQL.

## Reverse proxy and HTTPS

Expose the API through an HTTPS subdomain, for example:

```text
ai-api.monkefit.com
```

Configure Nginx or the VPS control panel to proxy HTTPS traffic to `http://127.0.0.1:3000`.

## Production checks

1. `GET /api/health` returns HTTP 200.
2. MKB reports no missing active files.
3. `OPENAI_API_KEY` is present.
4. `DATA_DIR` is writable and persistent.
5. CORS and API authentication are added before public website or WhatsApp rollout.
6. Customer personal data retention is reviewed before production use.
