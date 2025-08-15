"use client";

import { useMap } from "@/contexts/map-context";
import { TrackConfigModal } from "@/features/track-config-modal";
import {
  GeoJSONCollection,
  isValidGPXFile,
  parseGPXToGeoJSON,
  TrackData,
} from "@/lib/gps-utils";
import { MonitorUp } from "lucide-react";
import { ReactNode, useCallback, useState } from "react";
import { Card } from "./ui/card";

interface DropZoneProps {
  children: ReactNode;
  onFilesDrop?: (files: File[]) => void;
  acceptedFileTypes?: string[];
  showUploadedFiles?: boolean;
}

export default function DropZone({
  children,
  acceptedFileTypes = [".gpx"],
}: DropZoneProps) {
  const { setTracks, centerMap } = useMap();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pendingTrackData, setPendingTrackData] = useState<{
    geojson: GeoJSONCollection;
    filename: string;
  } | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = Array.from(e.dataTransfer.files)
        .filter((file) =>
          acceptedFileTypes.some((ext) =>
            file.name.toLowerCase().endsWith(ext.toLowerCase())
          )
        )
        .at(0);

      if (!file) return;

      try {
        if (!isValidGPXFile(file)) {
          console.warn(`File ${file.name} is not a valid GPX`);
          return;
        }
        const gpxText = await file.text();
        const geojson = parseGPXToGeoJSON(gpxText);
        setPendingTrackData({
          geojson,
          filename: file.name,
        });
        setIsModalOpen(true);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    },
    [acceptedFileTypes]
  );

  const handleTrackConfigSave = (track: TrackData) => {
    setTracks((prev) => {
      const newTracks = [...prev, track];
      centerMap(newTracks);
      return newTracks;
    });
    setIsModalOpen(false);
    setPendingTrackData(null);
  };

  const handleTrackConfigCancel = () => {
    setIsModalOpen(false);
    setPendingTrackData(null);
  };

  return (
    <div
      className={`w-full h-full relative m-0 p-0`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}

      {isDragOver && (
        <div className="fixed inset-0 bg-teal-800/50 flex items-center justify-center z-[9999] pointer-events-none">
          <Card className="bg-white p-8 rounded-lg shadow-xl text-center pointer-events-auto">
            <MonitorUp className="text-6xl mb-4 m-auto" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Drop GPX files here
            </h3>
            <p className="text-gray-600">
              Your files will be uploaded to the map
            </p>
          </Card>
        </div>
      )}

      <TrackConfigModal
        isOpen={isModalOpen}
        onClose={handleTrackConfigCancel}
        onSave={handleTrackConfigSave}
        defaultName={pendingTrackData?.filename.replace(".gpx", "") || ""}
        pendingTrackData={pendingTrackData}
      />
    </div>
  );
}
