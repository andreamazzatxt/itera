"use client";

import { useMap } from "@/contexts/map-context";
import { getPositionsAtTime } from "@/lib/gps-utils";
import { hexToRgbTuple, isMapViewState } from "@/lib/utils";
import { PathLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import { useMemo } from "react";
import { Map, Marker } from "react-map-gl/maplibre";
import { useFlyOver } from "./use-fly-over";
import { MyCustomMarker } from "./marker";

const maxZoom = 18;

export default function MainMap() {
  const { tracks, time, viewState, setViewState } = useMap();

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
      layers={[...trackLayers]}
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
      >
        {positionsByTime
          .filter((p) => p.coordinates)
          .map((p) => {
            const trackColor =
              tracks.find((t) => t.id === p.trackId)?.color || "#0000ff";
            return (
              <Marker
                key={p.trackId}
                longitude={p.coordinates![0]}
                latitude={p.coordinates![1]}
                anchor="bottom"
                style={{ zIndex: 10 }}
              >
                <MyCustomMarker color={trackColor} />
              </Marker>
            );
          })}
      </Map>
    </DeckGL>
  );
}
