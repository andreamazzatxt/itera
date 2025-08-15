declare module "@mapbox/togeojson" {
  interface GeoJSONFeature {
    type: "Feature";
    geometry: {
      type: "LineString" | "Point" | string;
      coordinates: number[] | number[][];
    };
    properties: {
      [key: string]: string | number | undefined;
    };
  }

  interface GeoJSONCollection {
    type: "FeatureCollection";
    features: GeoJSONFeature[];
  }

  interface ToGeoJSON {
    gpx: (gpx: Document) => GeoJSONCollection;
    kml: (kml: Document) => GeoJSONCollection;
  }

  const toGeoJSON: ToGeoJSON;
  export default toGeoJSON;
}
