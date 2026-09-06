import { trains } from "./data.js";
console.log(`Seed preview ready: ${trains.length} trains across ${new Set(trains.flatMap((train) => train.route.map((station) => station.code))).size} stations.`);