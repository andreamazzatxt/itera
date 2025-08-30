"use client";

import dynamic from "next/dynamic";
import DropZone from "../components/drop-zone";
import { ClientOnly } from "@/components/client-only";
import { TrackControlPanel } from "@/features/track-control-panel";
import { TimeControlPanel } from "@/features/track-time-panel";
import { MapContextProvider } from "@/contexts/map-context";
import { Zoom } from "@/features/zoom";
import { DrawerProvider } from "@/contexts/drawer-context";

const Map = dynamic(() => import("../features/map/map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-black"></div>
  ),
});

export default function Home() {
  return (
    <ClientOnly>
      <DrawerProvider>
        <MapContextProvider>
          <div className="relative w-full h-screen">
            <DropZone>
              <Map />
            </DropZone>
            <div className="absolute top-0 right-0 flex flex-col gap-3 p-4 z-10">
              <TimeControlPanel />
              <TrackControlPanel />
            </div>

            <div className="absolute top-0 left-0 flex flex-col gap-3 p-4 z-10">
              <Zoom />
            </div>
          </div>
        </MapContextProvider>
      </DrawerProvider>
    </ClientOnly>
  );
}
