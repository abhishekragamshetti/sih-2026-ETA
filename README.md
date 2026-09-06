# RailPulse

RailPulse is a Phase 1 real-time train ETA prototype for Indian Railways coaching trains. It includes a simulated live feed, an isolated baseline ETA predictor, REST endpoints, WebSocket snapshots, and a passenger dashboard.

## Structure

```text
railpulse/
  apps/
    api/
      src/data.ts          seeded train and station corridors
      src/simulator.ts     pluggable simulated position feed
      src/prediction.ts    baseline ETA service contract
      src/server.ts        REST + WebSocket API
      schema.sql           PostgreSQL production schema
    web/
      src/App.tsx          passenger dashboard
      src/styles.css       responsive visual system
  README.md
```

## Run locally

Prerequisite: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The API runs at `http://localhost:4000`; its WebSocket endpoint is `ws://localhost:4000/ws`.

Useful endpoints:

- `GET /health`
- `GET /api/trains?search=rajdhani`
- `GET /api/trains/12951`
- `GET /api/openapi.json`

## Data-source boundary

`apps/api/src/simulator.ts` is the live-feed adapter. It produces the same `LivePosition` contract a future NTES, GPS hardware, or IoT adapter should publish. `apps/api/src/prediction.ts` consumes that contract and returns `EtaPrediction`, so the baseline can later be replaced by a Python/ML service without changing the REST or WebSocket payloads.

The demo uses an in-memory store so it starts without local infrastructure. `apps/api/schema.sql` defines the PostgreSQL tables for trains, stations, schedules, live positions, ETA predictions, and disruption events. The production repository should persist each simulator/feed update there and optionally mirror hot state to Redis.

## Connect the supplied MySQL database

The GitHub database module at [sih-2026-ETA](https://github.com/abhishekragamshetti/sih-2026-ETA) is now supported directly by the API. Its MySQL tables (`train`, `station`, `section`, `historicdelays`, and `livestatus`) are read by `apps/api/src/mysql.ts`. The adapter reconstructs ordered routes from sections, reads the newest live status, averages historical delays, and sends the same snapshot contract used by the dashboard.

1. Create a MySQL database named `indianrailways`.
2. Run the supplied repository files in MySQL Workbench in this order: `schema.sql`, then `sample_data.sql`.
3. Copy `apps/api/.env.example` to `apps/api/.env` and set the MySQL credentials. The API reads these environment variables directly, so a process manager or shell can provide the values.
4. Start the API with `npm.cmd run dev --workspace apps/api`.

When `MYSQL_HOST`, `MYSQL_USER`, and `MYSQL_DATABASE` are present, `/health` reports `"dataSource":"mysql"` and REST/WebSocket reads come from MySQL. Without them, the simulator remains active. This makes the same UI usable both for the seeded demo and the supplied database.

## Current scope

- Three seeded corridors: Mumbai Rajdhani, Howrah Rajdhani, and Karnataka Express.
- Four-second position and ETA broadcasts.
- Search by train number/name and live station table.
- Route map with passed stations, current train marker, and speed callout.
- Baseline delay trend, confidence band, and rule-based explanation.
- TODO markers for NTES/GPS/IoT ingestion and PostgreSQL persistence.