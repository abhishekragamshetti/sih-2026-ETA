import { getLiveTrain } from "./liveProvider.js";
import "dotenv/config";
import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { getSnapshots, startSimulator } from "./simulator.js";
import { createMySqlProvider, hasMySqlConfig } from "./mysql.js";
import type { TrainSnapshot, TrainStatus } from "./types.js";
const app = express(); const httpServer = createServer(app); const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
app.use(cors()); app.use(express.json());
let database = hasMySqlConfig() ? createMySqlProvider() : null;
let dataSource = database ? "mysql" : "simulator";
let simulatorStarted = false;
const liveCache = new Map<
  string,
  {
    snapshot: TrainSnapshot;
    expiresAt: number;
  }
>();
const normalizeTime = (
  value?: string | null
): string => {
  if (!value) return "00:00";

  const match = value.match(/(\d{2}):(\d{2})/);

  return match
    ? `${match[1]}:${match[2]}`
    : value.slice(0, 5);
};
const mergeLivePosition = (
  snapshot: TrainSnapshot,
  live: Awaited<ReturnType<typeof getLiveTrain>>
): TrainSnapshot => {
  const current = live.currentLocation;
  const existingRoute = snapshot.train.route;

const liveRoute =
  live.route
    ?.filter(
      (station) =>
        Number.isFinite(station.lat) &&
        Number.isFinite(station.lng)
    )
    .map((station, index) => {
      const existingStation = existingRoute.find(
        (item) => item.code === station.stationCode
      );

      return {
        code: station.stationCode,
        name: station.stationName,
        city:
          existingStation?.city ??
          station.stationName,

        lat: Number(station.lat),
        lon: Number(station.lng),

        sequence:
          Number(station.sequence) ||
          index,

        scheduledArrival:
          normalizeTime(station.scheduledArrival),

        scheduledDeparture:
          normalizeTime(
            station.scheduledDeparture ??
            station.scheduledArrival
          ),

        platform:
          station.platform ??
          existingStation?.platform
      };
    }) ?? [];
    const updatedTrain =
  liveRoute.length >= 2
    ? {
        ...snapshot.train,

        name:
          live.trainName ||
          snapshot.train.name,

        route: liveRoute
      }
    : snapshot.train;

  let status: TrainStatus = snapshot.position.status;

  if (live.status === "completed") {
    status = "terminated";
  } else if (
    current?.isHalt === true ||
    current?.status === "at-station"
  ) {
    status = "halted";
  } else {
    status = "running";
  }

  const latitude =
    current?.coordinates?.lat ?? snapshot.position.lat;

  const longitude =
    current?.coordinates?.lng ?? snapshot.position.lon;

  const lastReportedStation =
    current?.stationName ??
    live.previousHalt?.stationName ??
    snapshot.position.lastReportedStation;

  const nextStation =
    live.nextHalt?.stationCode ??
    snapshot.position.nextStation;

  const progress = Number(
    current?.segmentProgress ??
    snapshot.position.progress
  );

  const speed = Number(
    current?.speedKmh ??
    snapshot.position.speed
  );

  const delayMinutes = Number(
    live.delayMinutes ??
    current?.delayMinutes ??
    snapshot.position.delayMinutes
  );

 return {
  ...snapshot,
  train: updatedTrain,

  position: {
    ...snapshot.position,

    trainNumber: snapshot.train.number,

    lat: latitude,
    lon: longitude,
    speed,
    status,
    delayMinutes,

    lastReportedStation,
    nextStation,

    progress: Math.max(0, Math.min(1, progress)),

    updatedAt:
      live.lastUpdatedAt ??
      new Date().toISOString()
  },

  prediction: {
    ...snapshot.prediction,

    generatedAt:
      live.lastUpdatedAt ??
      new Date().toISOString(),

    trend:
      delayMinutes > snapshot.position.delayMinutes
        ? "increasing"
        : delayMinutes < snapshot.position.delayMinutes
          ? "recovering"
          : "stable",

    rows: snapshot.prediction.rows.map((row) => ({
      ...row,
      delayMinutes: Math.max(
        0,
        row.delayMinutes + delayMinutes - snapshot.position.delayMinutes
      )
    })),

    explanation: [
      `Live delay currently reported at ${delayMinutes} minutes.`,
      `Last reported location: ${lastReportedStation}.`,
      nextStation
        ? `Next reported station: ${nextStation}.`
        : "Next station information is unavailable."
    ]
  }
  };
};
const enrichWithLiveData = async (
  snapshots: TrainSnapshot[]
): Promise<TrainSnapshot[]> => {
  return Promise.all(
    snapshots.map(async (snapshot) => {
      const trainNumber = snapshot.train.number;

      const cached = liveCache.get(trainNumber);

      if (cached && cached.expiresAt > Date.now()) {
        return cached.snapshot;
      }

      try {
        const live = await getLiveTrain(trainNumber);

        const merged = mergeLivePosition(snapshot, live);

        liveCache.set(trainNumber, {
          snapshot: merged,
          expiresAt: Date.now() + LIVE_CACHE_MS
        });

        return merged;
      } catch (error) {
        console.warn(
          `Live data unavailable for ${trainNumber}:`,
          error instanceof Error
            ? error.message
            : error
        );

        return snapshot;
      }
    })
  );
};

const LIVE_CACHE_MS = 30_000;
const activateSimulator = () => { if (!simulatorStarted) { startSimulator(wss); simulatorStarted = true; } database = null; dataSource = "simulator"; };
const readSnapshots = async (): Promise<TrainSnapshot[]> => {
  let snapshots: TrainSnapshot[];

  if (!database) {
    activateSimulator();
    snapshots = getSnapshots();
  } else {
    try {
      snapshots = await database.getSnapshots();
    } catch (error) {
      console.error(
        "MySQL unavailable; using simulator:",
        error instanceof Error
          ? error.message
          : error
      );

      activateSimulator();
      snapshots = getSnapshots();
    }
  }

  return enrichWithLiveData(snapshots);
};
app.get("/health", (_request, response) => response.json({ status: "ok", service: "railpulse-api", dataSource }));
app.get("/api/trains", async (request, response) => { try { const search = String(request.query.search ?? "").toLowerCase(); const snapshots = await readSnapshots(); return response.json(snapshots.filter((snapshot) => !search || snapshot.train.number.includes(search) || snapshot.train.name.toLowerCase().includes(search) || snapshot.train.route.some((station) => station.name.toLowerCase().includes(search)))); } catch (error) { return response.status(503).json({ error: "Database unavailable", detail: error instanceof Error ? error.message : "Unknown database error" }); } });
app.get("/api/trains/:number", async (request, response) => { try { const snapshot = (await readSnapshots()).find((item) => item.train.number === request.params.number); if (!snapshot) return response.status(404).json({ error: "Train not found" }); return response.json(snapshot); } catch (error) { return response.status(503).json({ error: "Database unavailable", detail: error instanceof Error ? error.message : "Unknown database error" }); } });
app.get("/api/live-train/:number", async (request, response) => {
  try {
    const trainNumber = String(request.params.number);

    const liveTrain = await getLiveTrain(trainNumber);

    response.json({
      success: true,
      data: liveTrain
    });
  } catch (error) {
    console.error("Live train error:", error);

    response.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to fetch live train data"
    });
  }
});
app.get("/api/openapi.json", (_request, response) => response.json({ openapi: "3.0.0", info: { title: "RailPulse API", version: "0.1.0" }, paths: { "/api/trains": { get: { summary: "Search live trains" } }, "/api/trains/{number}": { get: { summary: "Get live train and ETAs" } } } }));
wss.on("connection", async (socket) => { socket.send(JSON.stringify({ type: "snapshot", payload: await readSnapshots() })); });
if (database) { setInterval(async () => { if (!database) return; const snapshots = await readSnapshots(); const message = JSON.stringify({ type: "snapshot", payload: snapshots }); wss.clients.forEach((client) => { if (client.readyState === 1) client.send(message); }); }, 4000); } else { activateSimulator(); }
const port = Number(process.env.PORT ?? 4000); httpServer.listen(port, "0.0.0.0", () => console.log(`RailPulse API listening on http://localhost:${port}`));