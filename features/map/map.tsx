"use client";

import { useMap } from "@/contexts/map-context";
import { getPositionsAtTime } from "@/lib/gps-utils";
import { hexToRgbTuple, isMapViewState } from "@/lib/utils";
import { IconLayer, PathLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import { useMemo } from "react";
import { Map } from "react-map-gl/maplibre";
import { useFlyOver } from "./use-fly-over";

export default function MainMap() {
  const { tracks, time, viewState, setViewState } = useMap();
  const positionsByTime = getPositionsAtTime(tracks, time);

  const { stop } = useFlyOver({
    active: tracks.length === 0,
    setViewState,
  });

  const trackLayers = useMemo(() => {
    return tracks.map(
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
          getColor: hexToRgbTuple(track.color) || [255, 0, 0],
          widthMinPixels: 4,
          extruded: true,
          getElevation: (d: [number, number, number?]) => d[2] || 0,
          elevationScale: 1,
        })
    );
  }, [tracks]);

  const markerLayer = useMemo(() => {
    const points = positionsByTime
      .filter((p) => p.coordinates)
      .map((p) => ({
        position: [p.coordinates![0], p.coordinates![1]],
        color: hexToRgbTuple(
          tracks.find((t) => t.id === p.trackId)?.color || "#0000ff"
        ) || [0, 0, 255],
      }));

    return new IconLayer({
      id: "markers",
      data: points,
      pickable: true,
      iconAtlas: "/icons/marker-atlas.png",
      iconMapping: {
        marker: {
          x: 0,
          y: 0,
          width: 128,
          height: 128,
          anchorY: 128,
          mask: true,
        },
      },
      getIcon: () => "marker",
      getPosition: (d) => d.position,
      getSize: 40,
      getColor: (d) => d.color,
    });
  }, [positionsByTime, tracks]);

  return (
    <DeckGL
      viewState={{ ...viewState }}
      onViewStateChange={({ viewState }) => {
        if (isMapViewState(viewState)) {
          setViewState(viewState);
        }
      }}
      controller={true}
      layers={[markerLayer, ...trackLayers]}
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
    </DeckGL>
  );
}
