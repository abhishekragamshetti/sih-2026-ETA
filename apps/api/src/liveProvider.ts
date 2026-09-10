const RAILRADAR_BASE_URL = "https://api.railradar.in";

export type LiveTrainData = {
  trainNumber: string;
  trainName: string;
  status: string;
  delayMinutes: number;
  lastUpdatedAt: string;

currentLocation?: {
  stationCode?: string;
  stationName?: string;
  sequence?: number;
  status?: string;
  isHalt?: boolean;
  isDiverted?: boolean;
  isActualPosition?: boolean;
  segmentProgress?: number;
  speedKmh?: number;
  bearingDegrees?: number;
  delayMinutes?: number;

  coordinates?: {
    lat: number;
    lng: number;
  };
};

  previousHalt?: {
    stationCode?: string;
    stationName?: string;
    sequence?: number;
    distance?: number;
  };

  nextHalt?: {
    stationCode?: string;
    stationName?: string;
    sequence?: number;
    distance?: number;
  };

  route?: Array<{
    sequence: number;
    stationCode: string;
    stationName: string;
    isHalt: boolean;
    lat: number;
    lng: number;
    scheduledArrival?: string | null;
    scheduledDeparture?: string | null;
    actualArrival?: string | null;
    actualDeparture?: string | null;
    delayArrival?: number | null;
    delayDeparture?: number | null;
    status?: string;
    distance?: number;
    speedToNextStationKmph?: number;
    platform?: string | null;
  }>;

  isLive?: boolean;
};

type RailRadarResponse = {
  success?: boolean;
  data?: {
    trainNumber?: string;
    trainName?: string;
    startDate?: string;
    lastUpdatedAt?: string;
    status?: string;
    delayMinutes?: number;

    currentLocation?: LiveTrainData["currentLocation"];
    previousHalt?: LiveTrainData["previousHalt"];
    nextHalt?: LiveTrainData["nextHalt"];

    route?: LiveTrainData["route"];
    isLive?: boolean;
  };
};

export async function getLiveTrain(
  trainNumber: string
): Promise<LiveTrainData> {
  const apiKey = process.env.RAILRADAR_API_KEY;

  if (!apiKey) {
    throw new Error("RAILRADAR_API_KEY is not configured");
  }

    const url =
  `${RAILRADAR_BASE_URL}/v1/trains/${encodeURIComponent(trainNumber)}/live` +
  `?authoritative=true&includeCoordinates=true`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json"
    }
  });

  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(
      `RailRadar request failed: ${response.status} ${rawBody}`
    );
  }

  let json: RailRadarResponse;

  try {
    json = JSON.parse(rawBody) as RailRadarResponse;
  } catch {
    throw new Error("RailRadar returned invalid JSON");
  }

  if (!json.success || !json.data) {
    throw new Error(
      "RailRadar returned an unsuccessful or empty response"
    );
  }

  const data = json.data;

  if (!data.trainNumber) {
    throw new Error(
      `RailRadar response did not contain trainNumber. Response: ${rawBody}`
    );
  }

  return {
    trainNumber: data.trainNumber,
    trainName: data.trainName ?? "Unknown train",
    status: data.status ?? "unknown",
    delayMinutes: Number(data.delayMinutes ?? 0),
    lastUpdatedAt:
      data.lastUpdatedAt ?? new Date().toISOString(),

    currentLocation: data.currentLocation,
    previousHalt: data.previousHalt,
    nextHalt: data.nextHalt,

    route: data.route ?? [],
    isLive: Boolean(data.isLive)
  };
}
export function toRailPulsePosition(live: LiveTrainData) {
  const current = live.currentLocation;
  const next = live.nextHalt;
  const previous = live.previousHalt;

  return {
    lat: current?.coordinates?.lat ?? 0,
    lon: current?.coordinates?.lng ?? 0,

    speed: Number(current?.speedKmh ?? 0),

    status:
      current?.status ??
      live.status ??
      "unknown",

    delayMinutes: Number(
      current?.delayMinutes ??
      live.delayMinutes ??
      0
    ),

    lastReportedStation:
      previous?.stationName ??
      current?.stationName ??
      "Unknown",

    nextStation:
      next?.stationCode ??
      "",

    progress: Number(
      current?.segmentProgress ?? 1
    ),

    updatedAt:
      live.lastUpdatedAt ??
      new Date().toISOString()
  };
}