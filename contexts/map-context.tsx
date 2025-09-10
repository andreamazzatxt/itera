import {
  findMinMaxTime,
  getAllTrackCoordinates,
  getCenterState,
  TrackData,
} from "@/lib/gps-utils";
import { FlyToInterpolator, MapViewState } from "@deck.gl/core";
import { useGeolocation, useLocalStorage } from "@uidotdev/usehooks";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { exampleTracks } from "./example-tracks";

const SCALE = 1000;

export enum Speed {
  Slow = 100,
  Medium = 500,
  Fast = 700,
}

const MapContext = createContext<{
  tracks: TrackData[];
  setTracks: Dispatch<SetStateAction<TrackData[]>>;
  time: number;
  setTime: (val: number | ((prev: number) => number)) => void;
  minTime?: number;
  maxTime?: number;
  centerMap: (value?: TrackData[]) => void;
  viewState: MapViewState;
  setViewState: Dispatch<SetStateAction<MapViewState>>;
  loadExampleTracks: () => void;
  play: () => void;
  pause: () => void;
  isPlaying: boolean;
  speed: Speed;
  setSpeed: (speed: Speed) => void;
}>({
  tracks: [],
  setTracks: () => {},
  time: 0,
  setTime: () => {},
  minTime: undefined,
  maxTime: undefined,
  viewState: {
    longitude: 0,
    latitude: 0,
    zoom: 0,
    pitch: 45,
  },
  setViewState: () => {},
  centerMap: () => {},
  loadExampleTracks: () => {},
  play: () => {},
  pause: () => {},
  isPlaying: false,
  speed: Speed.Slow,
  setSpeed: () => {},
});

export const MapContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { longitude, latitude } = useGeolocation();

  const [tracks, setTracks] = useLocalStorage<TrackData[]>("tracks", []);
  const [timeLS, setTimeLS] = useLocalStorage<number>("time", 0);
  const [time, setTimeState] = useState<number>(timeLS || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<Speed>(Speed.Slow);

  const { minTime, maxTime } =
    findMinMaxTime(tracks.map((track) => track.geojson.features).flat()) || {};

  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const speedRef = useRef<Speed>(playbackSpeed);

  const play = useCallback(() => {
    if (isPlaying || !minTime || !maxTime) return;
    setIsPlaying(true);

    const loop = (now: number) => {
      if (!lastFrameRef.current) {
        lastFrameRef.current = now;
      }
      const deltaSec = (now - lastFrameRef.current) / 1000;
      lastFrameRef.current = now;

      setTimeState((prev) => {
        const next = (prev || minTime) + deltaSec * speedRef.current * SCALE;
        if (next >= maxTime) {
          cancelAnimationFrame(rafRef.current!);
          setIsPlaying(false);
          return maxTime;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  }, [isPlaying, minTime, maxTime]);

  const pause = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    lastFrameRef.current = null;
    setIsPlaying(false);
    setTimeLS(time);
  }, [time, setTimeLS]);

  const setTime = useCallback(
    (val: number | ((prev: number) => number)) => {
      pause();
      setTimeState(val);
      setTimeLS(val);
    },
    [pause, setTimeLS]
  );

  const centerMapState = useCallback(
    (value?: TrackData[]) => {
      const allCoords = getAllTrackCoordinates(value || []);
      return getCenterState(allCoords, longitude, latitude);
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

  const loadExampleTracks = useCallback(() => {
    setTracks(exampleTracks);
    setTime(0);
    centerMap(exampleTracks);
  }, [centerMap, setTime, setTracks]);

  const setSpeed = useCallback(
    (speed: Speed) => {
      setPlaybackSpeed(speed);
    },
    [setPlaybackSpeed]
  );

  useEffect(() => {
    if (!tracks.length) {
      centerMap();
    }
  }, [longitude, latitude, tracks.length, centerMap]);

  useEffect(() => {
    speedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  return (
    <MapContext.Provider
      value={{
        tracks,
        setTracks,
        time: time || minTime || 0,
        setTime,
        minTime,
        maxTime,
        viewState,
        setViewState,
        centerMap,
        loadExampleTracks,
        play,
        pause,
        isPlaying,
        speed: playbackSpeed,
        setSpeed,
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
