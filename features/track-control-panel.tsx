"use client";

import { confirmModal } from "@/components/confirm-modal";
import { Button } from "@/components/ui/button";
import { FloatingDrawer } from "@/components/ui/floating-drawer";
import { Separator } from "@/components/ui/separator";
import { DRAWER, useDrawer } from "@/contexts/drawer-context";
import { useMap } from "@/contexts/map-context";
import { DraftingCompass, Trash2Icon } from "lucide-react";
import { Fragment } from "react";

export const TrackControlPanel = () => {
  const { openDrawer, open, close } = useDrawer();
  const { tracks, setTracks, centerMap } = useMap();

  const handleRemoveTrack = async (trackId: string) => {
    const confirmed = await confirmModal({
      title: "Are you sure you want to remove this track?",
    });

    if (confirmed) {
      setTracks((prev) => {
        const newTracks = prev.filter((track) => track.id !== trackId);
        if (newTracks.length > 0) {
          centerMap(newTracks);
        }
        return newTracks;
      });
    }
  };

  const handleClearAllTracks = async () => {
    const confirmed = await confirmModal({
      title: "Are you sure you want to delete all saved tracks?",
    });
    if (confirmed) {
      setTracks([]);
      centerMap();
    }
  };

  return (
    <>
      <Button
        size="circular"
        onClick={() =>
          DRAWER.TRACKS === openDrawer ? close() : open(DRAWER.TRACKS)
        }
      >
        <DraftingCompass />
      </Button>
      <FloatingDrawer
        open={openDrawer === DRAWER.TRACKS}
        onClose={close}
        className="max-w-3xl"
        glass
      >
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-medium">Tracks</h2>
            <p className="text-sm font-light">
              Manage your saved tracks. You can remove individual tracks or
              clear all.
            </p>
          </div>

          <ul className="space-y-2">
            {tracks.map((track) => (
              <Fragment key={track.id}>
                <li className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: track.color }}
                  />
                  <span className="font-medium">{track.name}</span>

                  <Button
                    onClick={() => handleRemoveTrack(track.id)}
                    variant="ghost"
                  >
                    <Trash2Icon stroke="var(--destructive)" />
                  </Button>
                </li>
                <Separator />
              </Fragment>
            ))}
          </ul>
          <div className="flex gap-2 justify-end">
            <Button onClick={handleClearAllTracks} variant="destructive">
              Clear All
            </Button>
          </div>
        </div>
      </FloatingDrawer>
    </>
  );
};
