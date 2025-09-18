"use client";

import { confirmModal } from "@/components/confirm-modal";
import { Button } from "@/components/ui/button";
import { FloatingDrawer } from "@/components/ui/floating-drawer";
import { Separator } from "@/components/ui/separator";
import { DRAWER, useDrawer } from "@/contexts/drawer-context";
import { useMap } from "@/contexts/map-context";
import { TrackData } from "@/lib/gps-utils";
import { DraftingCompass, SquarePen, Trash2Icon } from "lucide-react";
import { Fragment, useState } from "react";
import { TrackConfigModal } from "./track-config-modal";
import { useTranslations } from "next-intl";

export const TrackControlPanel = () => {
  const t = useTranslations("TrackControlPanel");
  const { openDrawer, open, close } = useDrawer();
  const { tracks, setTracks, centerMap } = useMap();

  const handleClearAllTracks = async () => {
    const confirmed = await confirmModal({
      title: "Are you sure you want to delete all saved tracks?",
    });
    if (confirmed) {
      setTracks([]);
      centerMap();
      close();
    }
  };

  return (
    <>
      <Button
        size="square"
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
            <h2 className="text-lg font-medium">{t("tracks")}</h2>
            <p className="text-sm font-light">{t("description")}</p>
          </div>

          <ul className="space-y-2">
            {tracks.map((track) => (
              <TrackRow key={track.id} track={track} />
            ))}
          </ul>
          <div className="flex gap-2 justify-end">
            <Button onClick={handleClearAllTracks} variant="destructive">
              {t("clear-all")}
            </Button>
          </div>
        </div>
      </FloatingDrawer>
    </>
  );
};

const TrackRow = ({ track }: { track: TrackData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { setTracks, centerMap } = useMap();

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
        if (newTracks.length === 0) {
          close();
        }
        return newTracks;
      });
    }
  };

  const handleUpdateTrack = (updatedTrack: TrackData) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === updatedTrack.id ? updatedTrack : t))
    );
    setIsEditing(false);
  };

  return (
    <Fragment key={track.id}>
      <li className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: track.color }}
        />
        <span className="font-medium">{track.name}</span>

        <div>
          <Button onClick={() => handleRemoveTrack(track.id)} variant="ghost">
            <Trash2Icon stroke="var(--destructive)" />
          </Button>
          <Button onClick={() => setIsEditing(true)} variant="ghost">
            <SquarePen />
          </Button>
        </div>
      </li>
      <Separator />
      <TrackConfigModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={handleUpdateTrack}
        pendingTrackData={track}
        defaultName={track.name}
      />
    </Fragment>
  );
};
