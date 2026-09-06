export type TrainStatus = "running" | "halted" | "terminated";
export interface Station { code: string; name: string; city: string; lat: number; lon: number; sequence: number; scheduledArrival: string; scheduledDeparture: string; platform?: string; }
export interface Train { number: string; name: string; zone: string; route: Station[]; color: string; startTime: string; }
export interface LivePosition { trainNumber: string; lat: number; lon: number; speed: number; status: TrainStatus; delayMinutes: number; lastReportedStation: string; nextStation: string; progress: number; updatedAt: string; }
export interface EtaRow { station: Station; predictedArrival: string; predictedDeparture: string; delayMinutes: number; isPassed: boolean; }
export interface EtaPrediction { trainNumber: string; generatedAt: string; confidence: "high" | "medium" | "low"; confidenceMinutes: number; trend: "increasing" | "decreasing" | "recovering" | "stable"; rows: EtaRow[]; explanation: string[]; }
export interface TrainSnapshot { train: Train; position: LivePosition; prediction: EtaPrediction; }