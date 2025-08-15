import toGeoJSON from "@mapbox/togeojson";

export interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "LineString" | "Point" | string;
    coordinates: [number, number][] | [number, number] | number[] | number[][];
  };
  properties: {
    name?: string;
    description?: string;
    time?: string;
    [key: string]: string | number | undefined;
  };
}

export interface GeoJSONCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

export interface TrackData {
  id: string;
  name: string;
  color: string;
  geojson: GeoJSONCollection;
  filename: string;
  createdAt: string;
}

/**
 * Converts a GPX file to GeoJSON format using the @mapbox/togeojson library
 *
 * Benefits of using the library:
 * - Complete GPX 1.1 standard support
 * - Support for tracks, waypoints, routes
 * - Correct parsing of coordinates, elevation, timestamps
 * - Automatic XML namespace handling
 * - Tested and maintained by Mapbox
 *
 * @param gpxText - GPX file content as string
 * @returns GeoJSON FeatureCollection object
 */
export function parseGPXToGeoJSON(gpxText: string): GeoJSONCollection {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxText, "text/xml");

  // Use @mapbox/togeojson library for conversion
  const geojson = toGeoJSON.gpx(xmlDoc);

  // Add additional metadata if needed
  if (geojson.features) {
    geojson.features.forEach((feature: GeoJSONFeature, index: number) => {
      if (feature.properties) {
        feature.properties = {
          ...feature.properties,

          id: String(feature.properties.id || `feature_${index}`),

          name: String(
            feature.properties.name ||
              feature.properties.desc ||
              `Feature ${index + 1}`
          ),
        };
      }
    });
  }

  return geojson as GeoJSONCollection;
}

/**
 * Generates a unique ID for a track
 * @returns Unique ID string
 */
export function generateTrackId(): string {
  return `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validates if a file is a valid GPX file
 * @param file - File to validate
 * @returns true if the file is a valid GPX file
 */
export function isValidGPXFile(file: File): boolean {
  return (
    (file.name.toLowerCase().endsWith(".gpx") &&
      file.type === "application/gpx+xml") ||
    file.type === ""
  );
}

export function getPositionsAtTime(
  tracks: TrackData[],
  targetTime: number
): { trackId: string; coordinates: [number, number, number] | null }[] {
  const targetTimestamp = targetTime;

  return tracks.map((track) => {
    const coords = track.geojson.features[0].geometry.coordinates;
    const coordTimes = track.geojson.features[0].properties.coordTimes;

    if (!Array.isArray(coordTimes) || coordTimes.length === 0)
      return { trackId: track.id, coordinates: null };

    const times = coordTimes.map((t) => new Date(t).getTime());

    if (
      !Array.isArray(coords) ||
      coords.length === 0 ||
      !Array.isArray(coords[0]) ||
      typeof coords[0][0] !== "number" ||
      typeof coords[0][1] !== "number"
    )
      return { trackId: track.id, coordinates: null };

    const coordsArr = coords as number[][];

    if (targetTimestamp <= times[0])
      return {
        trackId: track.id,
        coordinates: coordsArr[0] as [number, number, number],
      };

    if (targetTimestamp >= times[times.length - 1])
      return {
        trackId: track.id,
        coordinates: coordsArr[coordsArr.length - 1] as [
          number,
          number,
          number
        ],
      };

    for (let i = 0; i < times.length - 1; i++) {
      const t1 = times[i];
      const t2 = times[i + 1];
      if (targetTimestamp >= t1 && targetTimestamp <= t2) {
        const ratio = (targetTimestamp - t1) / (t2 - t1);

        const lon =
          coordsArr[i][0] + (coordsArr[i + 1][0] - coordsArr[i][0]) * ratio;
        const lat =
          coordsArr[i][1] + (coordsArr[i + 1][1] - coordsArr[i][1]) * ratio;

        const alt1 = coordsArr[i][2] ?? 0;
        const alt2 = coordsArr[i + 1][2] ?? 0;
        const alt = alt1 + (alt2 - alt1) * ratio;

        return { trackId: track.id, coordinates: [lon, lat, alt] };
      }
    }

    return { trackId: track.id, coordinates: null };
  });
}

export function findMinMaxTime(
  tracks: GeoJSONFeature[]
): { minTime: number; maxTime: number } | null {
  if (tracks.length === 0) return null;

  let minTime = Infinity;
  let maxTime = -Infinity;

  for (const track of tracks) {
    const coordTimes = track.properties.coordTimes;
    if (!Array.isArray(coordTimes) || coordTimes.length === 0) continue;
    const times = coordTimes.map((t) => new Date(t).getTime());
    for (const t of times) {
      if (t < minTime) minTime = t;
      if (t > maxTime) maxTime = t;
    }
  }

  if (minTime === Infinity || maxTime === -Infinity) return null;

  return { minTime, maxTime };
}

export function getAllTrackCoordinates(
  tracks: TrackData[]
): [number, number][] {
  const allCoords: [number, number][] = [];
  tracks.forEach((track) => {
    if (track.geojson && track.geojson.features) {
      track.geojson.features.forEach((feature) => {
        if (feature.geometry.type === "LineString") {
          (feature.geometry.coordinates as [number, number][]).forEach(
            ([lng, lat]) => {
              if (typeof lng === "number" && typeof lat === "number") {
                allCoords.push([lat, lng]);
              }
            }
          );
        } else if (feature.geometry.type === "MultiLineString") {
          const multiCoords = feature.geometry.coordinates;
          if (Array.isArray(multiCoords)) {
            multiCoords.forEach((line) => {
              if (Array.isArray(line)) {
                line.forEach((coord) => {
                  if (Array.isArray(coord) && coord.length === 2) {
                    const [lng, lat] = coord;
                    if (typeof lng === "number" && typeof lat === "number") {
                      allCoords.push([lat, lng]);
                    }
                  }
                });
              }
            });
          }
        }
      });
    }
  });
  return allCoords;
}
