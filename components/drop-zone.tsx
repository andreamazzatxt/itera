"use client";

import { useMap } from "@/contexts/map-context";
import { TrackConfigModal } from "@/features/track-config-modal";
import { importGpxFile } from "@/lib/files";
import { GeoJSONCollection, TrackData } from "@/lib/gps-utils";
import { ReactNode, useCallback, useRef, useState } from "react";
import { Card } from "./ui/card";
import { FloatingDrawer } from "./ui/floating-drawer";
import { Button } from "./ui/button";
import { FlaskConical, Import } from "lucide-react";
import { Input } from "./ui/input";
import { useTranslations } from "next-intl";

interface DropZoneProps {
  children: ReactNode;
  onFilesDrop?: (files: File[]) => void;
  showUploadedFiles?: boolean;
}

export default function DropZone({ children }: DropZoneProps) {
  const t = useTranslations("DropZone");
  const { setTracks, centerMap, tracks, loadExampleTracks } = useMap();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pendingTrackData, setPendingTrackData] = useState<{
    geojson: GeoJSONCollection;
    filename: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const [geojson, filename] =
      (await importGpxFile(e.dataTransfer.files)) || [];

    if (!geojson) return;

    setPendingTrackData({ geojson, filename: filename || "Track" });
    setIsModalOpen(true);
  }, []);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const [geojson, filename] = (await importGpxFile(files)) || [];
    if (!geojson) return;

    setPendingTrackData({ geojson, filename: filename || "Track" });
    setIsModalOpen(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
      {tracks.length === 0 && (
        <FloatingDrawer open className="sm:max-w-sm" glass>
          <div className=" w-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-around gap-2 w-full">
              <Button variant="secondary" onClick={loadExampleTracks}>
                <FlaskConical /> {t("load-example-tracks")}
              </Button>

              <Button onClick={() => fileInputRef.current?.click()}>
                <Input
                  type="file"
                  accept=".gpx"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleUploadFile}
                />
                <Import />
                {t("import-gpx")}
              </Button>
            </div>
          </div>
        </FloatingDrawer>
      )}
      ;
      {isDragOver && (
        <div className="fixed inset-0 bg-teal-800/50 flex items-center justify-center z-[9999] pointer-events-none">
          <Card className="bg-white p-8 rounded-lg shadow-xl text-center pointer-events-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {t("drop-it")}
            </h3>
            <p className="text-gray-600">
              {t("your-files-will-be-uploaded-to-the-map")}
            </p>
          </Card>
        </div>
      )}
      {isModalOpen && (
        <TrackConfigModal
          isOpen={isModalOpen}
          onClose={handleTrackConfigCancel}
          onSave={handleTrackConfigSave}
          defaultName={pendingTrackData?.filename.replace(".gpx", "") || ""}
          pendingTrackData={pendingTrackData}
        />
      )}
    </div>
  );
}
