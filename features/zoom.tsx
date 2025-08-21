"use client";
import { Button } from "@/components/ui/button";
import { useMap } from "@/contexts/map-context";
import { LinearInterpolator, MapViewState } from "@deck.gl/core";
import { ZoomIn, ZoomOut } from "lucide-react";

export const Zoom = ({}) => {
  const { setViewState } = useMap();

  const getCurrentZoom = (viewState: MapViewState) =>
    viewState && "zoom" in viewState && typeof viewState.zoom === "number"
      ? viewState.zoom
      : 0;

  const handleZoomIn = () => {
    setViewState((prev) => {
      return {
        ...prev,
        zoom: getCurrentZoom(prev) + 1,
        transitionDuration: 300,
        transitionInterpolator: new LinearInterpolator(),
      };
    });
  };

  const handleZoomOut = () => {
    setViewState((prev) => ({
      ...prev,
      zoom: getCurrentZoom(prev) - 1,
      transitionDuration: 300,
      transitionInterpolator: new LinearInterpolator(),
    }));
  };
  return (
    <>
      <Button size="circular" onClick={handleZoomIn}>
        <ZoomIn />
      </Button>
      <Button size="circular" onClick={handleZoomOut}>
        <ZoomOut />
      </Button>
    </>
  );
};
