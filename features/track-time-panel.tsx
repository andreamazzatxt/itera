"use client";

import { Slider } from "@/components/ui/slider";
import { useMap } from "@/contexts/map-context";
import { formatTimestamp } from "@/lib/utils";
import { useLocalStorage } from "@uidotdev/usehooks";
import { type TrackData } from "../lib/gps-utils";
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

export const TimeControlPanel = () => {
  const { minTime, maxTime, time, setTime } = useMap();
  const [tracks] = useLocalStorage<TrackData[]>("tracks", []);

  function handleValueChange(newValue: number[]) {
    setTime(newValue[0]);
  }

  if (tracks.length === 0) return null;

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button size="circular">
          <Clock />
        </Button>
      </DrawerTrigger>
      <DrawerContent noOverlay className="p-6">
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
