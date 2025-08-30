"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Slider } from "@/components/ui/slider";
import { DRAWER, useDrawer } from "@/contexts/drawer-context";
import { useMap } from "@/contexts/map-context";
import { formatTimestamp } from "@/lib/utils";
import { LinearInterpolator, MapViewState } from "@deck.gl/core";
import { useLocalStorage } from "@uidotdev/usehooks";
import { Clock } from "lucide-react";
import {
  getBounds,
  getPositionsAtTime,
  getViewBounds,
  getZoomForBounds,
  markersOutsideView,
  type TrackData,
} from "../lib/gps-utils";
import { FloatingDrawer } from "@/components/ui/floating-drawer";

export const TimeControlPanel = () => {
  const { open, close, openDrawer } = useDrawer();
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
        positionsByTime
          .filter((p) => p.coordinates)
          .map((p) => [p.coordinates![0], p.coordinates![1]]),
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
    <>
      <Button
        size="circular"
        onClick={() =>
          openDrawer === DRAWER.TIME ? close() : open(DRAWER.TIME)
        }
      >
        <Clock />
      </Button>
      <FloatingDrawer open={openDrawer === DRAWER.TIME} onClose={close} glass>
        <div className="w-full">
          <div className="flex items-center justify-between mb-2 space-x-2 px-4">
            <h2 className="hidden sm:block text-lg font-medium">Select Time</h2>
            <div className="mt-2 font-mono text-xl sm:text-lg mr-8">
              {formatTimestamp(time ? +time : 0)}
            </div>
          </div>
          <div className="flex flex-col gap-4 p-4">
            <Slider
              value={[time ? +time : 0]}
              min={minTime}
              max={maxTime}
              step={1000}
              onValueChange={handleValueChange}
              aria-label="Time slider"
            />
          </div>
        </div>
      </FloatingDrawer>
    </>
  );
};
