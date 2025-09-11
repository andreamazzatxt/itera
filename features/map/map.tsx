"use client";

import { useMap } from "@/contexts/map-context";
import { getPositionsAtTime } from "@/lib/gps-utils";
import { hexToRgbTuple, isMapViewState } from "@/lib/utils";
import { PathLayer, IconLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import { useMemo, useState } from "react";
import { Map, ScaleControl } from "react-map-gl/maplibre";
import { useFlyOver } from "./use-fly-over";
import { MarkerPopup, svgMarker } from "./marker";
import { ScaleBar } from "./scale-bar";

const maxZoom = 18;

const ICON_MAPPING = {
  marker: { x: 0, y: 0, width: 128, height: 128, anchorY: 128, mask: true },
};

export default function MainMap() {
  const { tracks, time, viewState, setViewState } = useMap();
  const [hovered, setHovered] = useState<{
    x: number;
    y: number;
    trackId: string;
  } | null>(null);

  const positionsByTime = getPositionsAtTime(tracks, time);

  useFlyOver({
    active: tracks.length === 0,
    setViewState,
  });

  const trackLayers = useMemo(
    () =>
      tracks.map(
        (track) =>
          new PathLayer({
            id: `track-${track.id}`,
            data: track.geojson.features.map((f) =>
              f.geometry.coordinates.map((coord) => {
                const c = coord as [number, number];
                return [c[0], c[1]];
              })
            ),
            getPath: (d) => d,
            getColor: hexToRgbTuple(track.color, 160) || [255, 0, 0, 160],
            widthMinPixels: 4,
            extruded: true,
            getElevation: (d: [number, number, number?]) => d[2] || 0,
            elevationScale: 1,
            zIndex: 1,
          })
      ),
    [tracks]
  );

  const iconLayer = useMemo(() => {
    return new IconLayer({
      id: "icon-layer",
      data: positionsByTime.filter((p) => p.coordinates),
      pickable: true,
      iconAtlas: `data:image/svg+xml;utf8,${svgMarker}`,
      iconMapping: ICON_MAPPING,
      getIcon: () => "marker",
      getSize: () => 4,
      sizeScale: 10,
      getPosition: (d) => d.coordinates.slice(0, 2),
      onHover: (info) => {
        setHovered(
          info.object
            ? { x: info.x, y: info.y, trackId: info.object.trackId }
            : null
        );
      },
      getColor: (d) => {
        const trackColor =
          tracks.find((t) => t.id === d.trackId)?.color || "#0000ff";
        return hexToRgbTuple(trackColor, 255);
      },
    });
  }, [positionsByTime, tracks]);

  const hoveredTrack = tracks.find((t) => t.id === hovered?.trackId);

  console.log(hovered);

  return (
    <DeckGL
      viewState={{ ...viewState }}
      onViewStateChange={({ viewState }) => {
        if (isMapViewState(viewState)) {
          setViewState({
            ...viewState,
            zoom: Math.min(maxZoom, viewState.zoom),
          });
        }
      }}
      controller={true}
      layers={[iconLayer, ...trackLayers]}
    >
      <Map
        mapLib={import("maplibre-gl")}
        mapStyle={{
          version: 8,
          sources: {
            "esri-satellite": {
              type: "raster",
              tiles: [
                "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
              ],
              tileSize: 256,
            },
          },
          layers: [
            {
              id: "esri-satellite-layer",
              type: "raster",
              source: "esri-satellite",
            },
          ],
        }}
      ></Map>
      <ScaleBar latitude={viewState.latitude} zoom={viewState.zoom} />
      {hoveredTrack && (
        <MarkerPopup track={hoveredTrack} x={hovered?.x} y={hovered?.y} />
      )}
    </DeckGL>
  );
}
