import { MapViewState } from "@deck.gl/core";
import toGeoJSON from "@mapbox/togeojson";

const mapCenter = [12.4964, 41.9028];
const mapZoom = 16;

export interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "LineString" | "Point" | string;
    coordinates: [number, number][] | [number, number] | number[] | number[][];
  };
  properties: {
    name?: string;
    description?: string;
    coordTimes?: string[];
    time?: string;
    [key: string]: string | number | string[] | undefined;
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

export function getBounds(positions: [number, number][]) {
  if (positions.length === 0) return null;

  let minX = positions[0][0];
  let minY = positions[0][1];
  let maxX = positions[0][0];
  let maxY = positions[0][1];

  positions.forEach(([lon, lat]) => {
    if (lon < minX) minX = lon;
    if (lon > maxX) maxX = lon;
    if (lat < minY) minY = lat;
    if (lat > maxY) maxY = lat;
  });

  return [
    [minX, minY], // SW
    [maxX, maxY], // NE
  ] as [[number, number], [number, number]];
}

export function getZoomForBounds(
  sw: [number, number],
  ne: [number, number],
  padding: number
) {
  const WORLD_DIM = { width: 256, height: 256 };
  const ZOOM_MAX = 24;

  function latRad(lat: number) {
    const sin = Math.sin((lat * Math.PI) / 180);
    const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
  }

  function zoom(mapPx: number, worldPx: number, fraction: number) {
    return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
  }

  const latFraction = (latRad(ne[1]) - latRad(sw[1])) / Math.PI;
  const lonDiff = ne[0] - sw[0];
  const lonFraction = (lonDiff < 0 ? lonDiff + 360 : lonDiff) / 360;

  const latZoom = zoom(
    window.innerHeight - padding * 2,
    WORLD_DIM.height,
    latFraction
  );
  const lonZoom = zoom(
    window.innerWidth - padding * 2,
    WORLD_DIM.width,
    lonFraction
  );

  return Math.min(latZoom, lonZoom, ZOOM_MAX);
}

export function getViewBounds(viewState: MapViewState) {
  const { latitude, longitude, zoom } = viewState;
  const width = window.innerWidth;
  const height = window.innerHeight;

  const scale = 512 * Math.pow(2, zoom);
  const degPerPixelX = 360 / scale;
  const degPerPixelY = 360 / scale;

  const lonDelta = (width / 2) * degPerPixelX;
  const latDelta = (height / 2) * degPerPixelY;

  return {
    west: longitude - lonDelta,
    east: longitude + lonDelta,
    south: latitude - latDelta,
    north: latitude + latDelta,
  };
}

export function markersOutsideView(
  positions: [number, number][],
  viewBounds: { west: number; east: number; south: number; north: number }
) {
  return positions.some(([lon, lat]) => {
    return (
      lon < viewBounds.west ||
      lon > viewBounds.east ||
      lat < viewBounds.south ||
      lat > viewBounds.north
    );
  });
}

export const getCenterState = (
  positions: [number, number][],
  longitude?: number | null,
  latitude?: number | null,
  zoom = mapZoom
) => {
  if (positions.length > 0) {
    const lats = positions.map((c) => c[0]);
    const lngs = positions.map((c) => c[1]);
    return {
      longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
      zoom,
      pitch: 45,
    };
  }
  return {
    longitude: longitude ?? mapCenter[0],
    latitude: latitude ?? mapCenter[1],
    zoom,
    pitch: 45,
  };
};
