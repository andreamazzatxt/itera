"use client";

import { Slider } from "@/components/ui/slider";
import { useMap } from "@/contexts/map-context";
import { formatTimestamp } from "@/lib/utils";
import { useLocalStorage } from "@uidotdev/usehooks";
import {
  getBounds,
  getPositionsAtTime,
  getViewBounds,
  getZoomForBounds,
  markersOutsideView,
  type TrackData,
} from "../lib/gps-utils";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { LinearInterpolator, MapViewState } from "@deck.gl/core";

export const TimeControlPanel = () => {
  const { minTime, maxTime, time, viewState, setTime, setViewState } = useMap();
  const [tracks] = useLocalStorage<TrackData[]>("tracks", []);

  function handleValueChange(newValue: number[]) {
    const positionsByTime = getPositionsAtTime(tracks, time);
    setTime(newValue[0]);

    const bounds = getBounds(
      positionsByTime
        .filter((p) => p.coordinates)
        .map((p) => [p.coordinates![0], p.coordinates![1]])
    );

    if (!bounds) return;

    const viewBounds = getViewBounds(viewState as MapViewState);

    if (
      !markersOutsideView(
        positionsByTime.map((p) => [p.coordinates![0], p.coordinates![1]]),
        viewBounds
      )
    ) {
      return;
    }

    const [sw, ne] = bounds;
    const padding = 50;

    setViewState((prev) => {
      const prevZoom =
        prev && "zoom" in prev && typeof prev.zoom === "number" ? prev.zoom : 0;
      return {
        ...prev,
        longitude: (sw[0] + ne[0]) / 2,
        latitude: (sw[1] + ne[1]) / 2,
        zoom: Math.min(prevZoom, getZoomForBounds(sw, ne, padding)),
        transitionDuration: 300,
        transitionInterpolator: new LinearInterpolator(),
      };
    });
  }

  if (tracks.length === 0) return null;

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button size="circular">
          <Clock />
        </Button>
      </DrawerTrigger>
      <DrawerContent noOverlay>
        <DrawerHeader>
          <DrawerTitle>Select Time</DrawerTitle>
          <DrawerDescription>
            Use the slider to select a specific time for the tracks.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 p-4">
          <Slider
            value={[time ? +time : 0]}
            min={minTime}
            max={maxTime}
            step={1000}
            onValueChange={handleValueChange}
            aria-label="Time slider"
          />
          <div className="mt-2 font-mono text-sm">
            {formatTimestamp(time ? +time : 0)}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
