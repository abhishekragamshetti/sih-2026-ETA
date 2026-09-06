import { EtaPrediction, LivePosition, Train } from "./types.js";
const minutesFromTime = (value: string) => { const [hours, minutes] = value.split(":").map(Number); return hours * 60 + minutes; };
const timeFromMinutes = (total: number) => { const normalized = ((Math.round(total) % 1440) + 1440) % 1440; return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`; };
export function predictEta(train: Train, position: LivePosition, previousDelay = position.delayMinutes): EtaPrediction {
  const recovery = position.speed > 82 ? 0.18 : 0.06;
  const projectedDelay = Math.max(0, position.delayMinutes - recovery);
  const nextIndex = train.route.findIndex((item) => item.code === position.nextStation);
  const rows = train.route.map((station, index) => { const delay = index <= nextIndex ? position.delayMinutes : Math.max(0, projectedDelay - Math.max(0, index - nextIndex) * recovery); return { station, predictedArrival: timeFromMinutes(minutesFromTime(station.scheduledArrival) + delay), predictedDeparture: timeFromMinutes(minutesFromTime(station.scheduledDeparture) + delay), delayMinutes: Math.round(delay), isPassed: index < nextIndex }; });
  const trend = projectedDelay > previousDelay + 1 ? "increasing" : projectedDelay < previousDelay - 1 ? "recovering" : Math.abs(projectedDelay - previousDelay) > 0.25 ? "decreasing" : "stable";
  const confidenceMinutes = Math.max(4, Math.round(5 + position.delayMinutes * 0.35));
  const confidence = confidenceMinutes <= 7 ? "high" : confidenceMinutes <= 12 ? "medium" : "low";
  return { trainNumber: train.number, generatedAt: new Date().toISOString(), confidence, confidenceMinutes, trend, rows, explanation: [position.speed < 65 ? `Reduced speed on the ${position.lastReportedStation} section (+${Math.round(position.delayMinutes * 0.45)} min)` : "Section speed is close to the corridor average", position.delayMinutes > 8 ? `Late departure carried forward from ${position.lastReportedStation} (+${Math.round(position.delayMinutes * 0.55)} min)` : "The timetable has recovery margin ahead", "No active disruption reported on the next section"] };
}