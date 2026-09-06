import mysql, { Pool } from "mysql2/promise";
import { RowDataPacket } from "mysql2";
import { predictEta } from "./prediction.js";
import { EtaPrediction, LivePosition, Station, Train, TrainSnapshot } from "./types.js";

type TrainRow = RowDataPacket & { train_id: number; train_number: string; train_name: string; train_type: string | null; source_station_id: number; destination_station_id: number };
type StationRow = RowDataPacket & { station_id: number; station_code: string; station_name: string; latitude: number; longitude: number; zone: string };
type SectionRow = RowDataPacket & { section_id: number; from_station_id: number; to_station_id: number; distance_km: number; scheduled_time_min: number };
type StatusRow = RowDataPacket & { train_id: number; current_station_id: number | null; next_station_id: number | null; current_delay_minutes: number | null; current_speed_kmph: number | null; latitude: number | null; longitude: number | null; status_time: Date };
type DelayRow = RowDataPacket & { train_id: number; avg_delay: number | null };

const timeFromMinutes = (total: number) => { const normalized = ((Math.round(total) % 1440) + 1440) % 1440; return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`; };

function orderedRoute(train: TrainRow, stations: StationRow[], sections: SectionRow[]): Station[] {
  const byId = new Map(stations.map((station) => [station.station_id, station]));
  const route: Station[] = [];
  let current = train.source_station_id;
  let totalMinutes = 360;
  for (let sequence = 0; sequence < stations.length + 1; sequence += 1) {
    const currentStation = byId.get(current);
    if (!currentStation) break;
    route.push({ code: currentStation.station_code, name: currentStation.station_name, city: currentStation.station_name.replace(/\s+(Junction|Jn|Central)$/i, ""), lat: Number(currentStation.latitude), lon: Number(currentStation.longitude), sequence, scheduledArrival: timeFromMinutes(totalMinutes), scheduledDeparture: timeFromMinutes(totalMinutes) });
    if (current === train.destination_station_id) break;
    const nextSection = sections.find((section) => section.from_station_id === current);
    if (!nextSection) break;
    totalMinutes += Number(nextSection.scheduled_time_min ?? 0);
    current = nextSection.to_station_id;
  }
  return route;
}

export function hasMySqlConfig() { return Boolean(process.env.MYSQL_HOST && process.env.MYSQL_USER && process.env.MYSQL_DATABASE); }

export function createMySqlProvider() {
  const pool: Pool = mysql.createPool({ host: process.env.MYSQL_HOST, port: Number(process.env.MYSQL_PORT ?? 3306), user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD, database: process.env.MYSQL_DATABASE, waitForConnections: true, connectionLimit: 5, enableKeepAlive: true });
  return {
    async getSnapshots(): Promise<TrainSnapshot[]> {
      const [trainRows] = await pool.query<TrainRow[]>("SELECT train_id, train_number, train_name, train_type, source_station_id, destination_station_id FROM train ORDER BY train_number");
      const [stationRows] = await pool.query<StationRow[]>("SELECT station_id, station_code, station_name, latitude, longitude, zone FROM station");
      const [sectionRows] = await pool.query<SectionRow[]>("SELECT section_id, from_station_id, to_station_id, distance_km, scheduled_time_min FROM section ORDER BY section_id");
      const [statusRows] = await pool.query<StatusRow[]>("SELECT ls.train_id, ls.current_station_id, ls.next_station_id, ls.current_delay_minutes, ls.current_speed_kmph, ls.latitude, ls.longitude, ls.status_time FROM livestatus ls INNER JOIN (SELECT train_id, MAX(status_time) AS latest_time FROM livestatus GROUP BY train_id) latest ON latest.train_id = ls.train_id AND latest.latest_time = ls.status_time");
      const [delayRows] = await pool.query<DelayRow[]>("SELECT train_id, ROUND(AVG(delay_minutes), 2) AS avg_delay FROM historicdelays GROUP BY train_id");
      const stationById = new Map(stationRows.map((station) => [station.station_id, station]));
      const statusByTrain = new Map(statusRows.map((status) => [status.train_id, status]));
      const delayByTrain = new Map(delayRows.map((delay) => [delay.train_id, Number(delay.avg_delay ?? 0)]));
      return trainRows.map((trainRow): TrainSnapshot => {
        const route = orderedRoute(trainRow, stationRows, sectionRows);
        const status = statusByTrain.get(trainRow.train_id);
        const currentStation = status?.current_station_id ? stationById.get(status.current_station_id) : undefined;
        const nextStation = status?.next_station_id ? stationById.get(status.next_station_id) : undefined;
        const fallbackStation = currentStation ?? stationById.get(trainRow.source_station_id)!;
        const position: LivePosition = { trainNumber: trainRow.train_number, lat: Number(status?.latitude ?? fallbackStation.latitude), lon: Number(status?.longitude ?? fallbackStation.longitude), speed: Number(status?.current_speed_kmph ?? 0), status: "running", delayMinutes: Math.round(Number(status?.current_delay_minutes ?? delayByTrain.get(trainRow.train_id) ?? 0)), lastReportedStation: fallbackStation.station_name, nextStation: nextStation?.station_code ?? fallbackStation.station_code, progress: status ? 0.55 : 0, updatedAt: status?.status_time?.toISOString() ?? new Date().toISOString() };
        const train: Train = { number: trainRow.train_number, name: trainRow.train_name, zone: stationById.get(trainRow.source_station_id)?.zone ?? "Indian Railways", route, color: trainRow.train_type?.toLowerCase().includes("super") ? "#3f88c5" : "#ef8354", startTime: route[0]?.scheduledDeparture ?? "06:00" };
        const prediction: EtaPrediction = predictEta(train, position);
        return { train, position, prediction };
      });
    },
    async close() { await pool.end(); }
  };
}