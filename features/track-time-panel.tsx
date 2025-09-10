"use client";

import { Button } from "@/components/ui/button";
import { FloatingDrawer } from "@/components/ui/floating-drawer";
import { TimeScrollPicker } from "@/components/ui/time-scroll-picker";
import { DRAWER, useDrawer } from "@/contexts/drawer-context";
import { Speed, useMap } from "@/contexts/map-context";
import { formatTimestamp } from "@/lib/utils";
import { LinearInterpolator, MapViewState } from "@deck.gl/core";
import { useLocalStorage } from "@uidotdev/usehooks";
import {
  Clock,
  FastForward,
  Pause,
  Play,
  Rabbit,
  Snail,
  Turtle,
} from "lucide-react";
import {
  getBounds,
  getPositionsAtTime,
  getViewBounds,
  getZoomForBounds,
  markersOutsideView,
  type TrackData,
} from "../lib/gps-utils";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { HoldButton } from "@/components/ui/hold-button";

export const TimeControlPanel = () => {
  const { open, close, openDrawer } = useDrawer();
  const {
    minTime,
    maxTime,
    time,
    viewState,
    setTime,
    setViewState,
    play,
    pause,
    isPlaying,
    speed,
    setSpeed,
  } = useMap();
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
        <div className="w-full flex flex-col gap-5 select-none">
          <div className="flex flex-col items-center justify-center  space-x-2 px-4 gap-6 sm:gap-2">
            <div className="mt-2 font-mono text-xl sm:text-lg mr-8 self-start select-text">
              {formatTimestamp(time ? +time : 0)}
            </div>

            <div className="flex gap-2 justify-center w-full">
              <HoldButton
                onHold={() => {
                  setTime((p) => p - 60000);
                }}
                className="transition-all active:scale-125 active:animate-pulse"
              >
                <FastForward className="size-4 rotate-180" />
              </HoldButton>
              <Button variant="ghost" onClick={isPlaying ? pause : play}>
                {isPlaying ? (
                  <Pause className="size-8" fill="white" />
                ) : (
                  <Play className="size-8" fill="white" />
                )}
              </Button>
              <HoldButton
                onHold={() => setTime((p) => p + 60000)}
                className="transition-all active:scale-125 active:animate-pulse"
              >
                <FastForward className="size-4" />
              </HoldButton>
            </div>
          </div>
          <div className="sm:hidden mx-[-36px]">
            <TimeScrollPicker
              startDate={new Date(minTime!)}
              endDate={new Date(maxTime!)}
              stepMinutes={5}
              selectedDate={time ? new Date(+time) : undefined}
              onChange={(date) => handleValueChange([date.getTime()])}
              isPlaying={isPlaying}
            />
          </div>
          <div className="hidden sm:block">
            <Slider
              value={[time ? +time : 0]}
              min={minTime}
              max={maxTime}
              step={1000}
              onValueChange={handleValueChange}
              aria-label="Time slider"
            />
          </div>
          <ToggleGroup
            value={`${speed}`}
            type="single"
            className="self-end"
            onValueChange={(value) => {
              if (value) {
                setSpeed(parseInt(value, 10));
              }
            }}
          >
            <ToggleGroupItem
              value={`${Speed.Slow}`}
              aria-label="Set Slow Speed"
            >
              <Snail className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value={`${Speed.Medium}`}
              aria-label="Set Medium Speed"
            >
              <Turtle className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value={`${Speed.Fast}`}
              aria-label="Set Fast Speed"
            >
              <Rabbit className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </FloatingDrawer>
    </>
  );
};
