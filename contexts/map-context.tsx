import {
  findMinMaxTime,
  getAllTrackCoordinates,
  TrackData,
} from "@/lib/gps-utils";
import { FlyToInterpolator } from "@deck.gl/core";
import DeckGL from "@deck.gl/react";
import { useGeolocation, useLocalStorage } from "@uidotdev/usehooks";
import {
  ComponentProps,
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const mapCenter = [12.4964, 41.9028];
const mapZoom = 15;

export type MapViewState = ComponentProps<typeof DeckGL>["viewState"];

const MapContext = createContext<{
  tracks: TrackData[];
  setTracks: Dispatch<SetStateAction<TrackData[]>>;
  clearAllTracks?: () => void;
  time: number;
  setTime: Dispatch<SetStateAction<number>>;
  minTime?: number;
  maxTime?: number;
  is3d?: boolean;
  setIs3d?: Dispatch<SetStateAction<boolean>>;
  centerMap: (value?: TrackData[]) => void;
  viewState: MapViewState;
  setViewState: Dispatch<SetStateAction<MapViewState>>;
}>({
  tracks: [],
  setTracks: () => {},
  time: 0,
  setTime: () => {},
  minTime: undefined,
  maxTime: undefined,
  is3d: false,
  setIs3d: () => {},
  viewState: {
    longitude: mapCenter[0],
    latitude: mapCenter[1],
    zoom: mapZoom,
    pitch: 45,
  },
  setViewState: () => {},
  centerMap: () => {},
});
export const MapContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { longitude, latitude } = useGeolocation();

  const [tracks, setTracks] = useLocalStorage<TrackData[]>("tracks", []);
  const [time, setTime] = useLocalStorage<number>("time", 0);
  const [is3d, setIs3d] = useLocalStorage<boolean>("is3d", false);

  const { minTime, maxTime } =
    findMinMaxTime(tracks.map((track) => track.geojson.features).flat()) || {};

  const centerMapState = useCallback(
    (value?: TrackData[]) => {
      const allCoords = getAllTrackCoordinates(value || []);
      if (allCoords.length > 0) {
        const lats = allCoords.map((c) => c[0]);
        const lngs = allCoords.map((c) => c[1]);
        return {
          longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
          latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
          zoom: mapZoom,
          pitch: 45,
        };
      }
      return {
        longitude: longitude ?? mapCenter[0],
        latitude: latitude ?? mapCenter[1],
        zoom: mapZoom,
        pitch: 45,
      };
    },
    [longitude, latitude]
  );

  const [viewState, setViewState] = useState<MapViewState>(
    centerMapState(tracks)
  );

  const centerMap = useCallback(
    (value?: TrackData[]) => {
      setViewState({
        ...centerMapState(value),
        transitionDuration: 1000,
        transitionInterpolator: new FlyToInterpolator(),
      });
    },
    [centerMapState]
  );

  useEffect(() => {
    if (!tracks.length) {
      centerMap();
    }
  }, [longitude, latitude, tracks.length, centerMap]);

  return (
    <MapContext.Provider
      value={{
        tracks,
        setTracks,
        time,
        setTime,
        minTime,
        maxTime,
        is3d,
        setIs3d,
        viewState,
        setViewState,
        centerMap,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};
export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useTracks must be used within a TracksProvider");
  }
  return context;
};
