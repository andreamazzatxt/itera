"use client";

import { useLocalStorage } from "@uidotdev/usehooks";
import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import {
  generateTrackId,
  type GeoJSONCollection,
  type TrackData,
} from "../lib/gps-utils";

export interface TrackConfig {
  name: string;
  color: string;
}

interface TrackConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (track: TrackData) => void;
  defaultName: string;
  pendingTrackData?: {
    id?: string;
    geojson: GeoJSONCollection;
    filename: string;
    color?: string;
  } | null;
}

const DEFAULT_COLORS = [
  "#2E86C1",
  "#F39C12",
  "#1ABC9C",
  "#9B59B6",
  "#E74C3C",
  "#34495E",
  "#F1C40F",
  "#27AE60",
  "#D35400",
  "#FFC0CB",
];

export function TrackConfigModal({
  isOpen,
  onClose,
  onSave,
  defaultName = "",
  pendingTrackData,
}: TrackConfigModalProps) {
  const [tracks] = useLocalStorage<TrackData[]>("tracks", []);
  const [trackName, setTrackName] = useState(defaultName);

  const defaultColor =
    pendingTrackData?.color ??
    DEFAULT_COLORS.filter(
      (color) => !tracks.some((track) => track.color === color)
    )[0];

  const [selectedColor, setSelectedColor] = useState(defaultColor);

  const handleSave = (config: TrackConfig) => {
    if (pendingTrackData) {
      const trackData: TrackData = {
        id: pendingTrackData.id ?? generateTrackId(),
        name: config.name,
        color: config.color,
        geojson: pendingTrackData.geojson,
        filename: pendingTrackData.filename,
        createdAt: new Date().toISOString(),
      };
      onSave(trackData);
    }
  };

  const handleCancel = () => {
    setTrackName(defaultName);
    setSelectedColor(DEFAULT_COLORS[0]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md z-[9999]" glass>
        <DialogHeader>
          <DialogTitle>Track Config</DialogTitle>
          <DialogDescription className="text-muted font-thin">
            Configure the track name and color before saving.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="track-name"
              className="block text-sm font-medium mb-2"
            >
              Track Name
            </label>
            <Input
              id="track-name"
              type="text"
              value={trackName}
              onChange={(e) => setTrackName(e.target.value)}
              placeholder="Enter track name"
              autoFocus
            />
          </div>

          <div>
            <div className="flex gap-2 flex-wrap">
              {DEFAULT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all hover:border-gray-300 cursor-pointer ${
                    selectedColor === color
                      ? "border-gray-300 "
                      : "border-gray-800  scale-110"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  aria-label={`Choose color ${color}`}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              handleSave({ name: trackName.trim(), color: selectedColor })
            }
            disabled={!trackName.trim()}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
