"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMap } from "@/contexts/map-context";
import { DraftingCompass } from "lucide-react";

export const TrackControlPanel = () => {
  const { tracks, setTracks, centerMap } = useMap();

  const handleRemoveTrack = (trackId: string) => {
    if (confirm("Are you sure you want to remove this track?")) {
      setTracks((prev) => {
        const newTracks = prev.filter((track) => track.id !== trackId);
        if (newTracks.length > 0) {
          centerMap(newTracks);
        }
        return newTracks;
      });
    }
  };

  const handleClearAllTracks = () => {
    if (confirm("Are you sure you want to delete all saved tracks?")) {
      setTracks([]);
      centerMap();
    }
  };
  if (tracks.length === 0) return null;

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button size="circular">
          <DraftingCompass />
        </Button>
      </DrawerTrigger>
      <DrawerContent noOverlay className="p-6">
        <DrawerHeader>
          <DrawerTitle>Tracks</DrawerTitle>
          <DrawerDescription>
            Manage your saved tracks. You can remove individual tracks or clear
            all.
          </DrawerDescription>
        </DrawerHeader>

        <ul className="space-y-2">
          {tracks.map((track) => (
            <li key={track.id} className="flex items-center justify-between">
              <span className="font-medium">{track.name}</span>
              <button
                onClick={() => handleRemoveTrack(track.id)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <button
            onClick={() => console.log("Tracks:", tracks)}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            Load All
          </button>
          <button
            onClick={handleClearAllTracks}
            className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
          >
            Clear All
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
