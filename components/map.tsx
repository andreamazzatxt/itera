"use client";

import { MapViewState, useMap } from "@/contexts/map-context";
import { getPositionsAtTime } from "@/lib/gps-utils";
import { hexToRgbTuple } from "@/lib/utils";
import { PathLayer, ScatterplotLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import { useMemo } from "react";
import { Map } from "react-map-gl/maplibre";

export default function MainMap() {
  const { tracks, time, viewState, setViewState } = useMap();
  const positionsByTime = getPositionsAtTime(tracks, time);

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
      }));

    return new ScatterplotLayer({
      id: "markers",
      data: points,
      getPosition: (d) => d.position,
      getFillColor: [0, 0, 255],
      getRadius: 8,
      radiusMinPixels: 8,
    });
  }, [positionsByTime]);

  return (
    <DeckGL
      viewState={{ ...viewState }}
      onViewStateChange={({ viewState }) =>
        setViewState(viewState as MapViewState)
      }
      controller={true}
      layers={[...trackLayers, markerLayer]}
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
