import { isValidGPXFile, parseGPXToGeoJSON } from "./gps-utils";

export const importGpxFile = async (
  fileList: FileList,
  acceptedFileTypes = [".gpx"]
) => {
  const file = Array.from(fileList)
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
    return [geojson, file.name] as const;
  } catch (error) {
    console.error(`Error importing GPX file: ${error}`);
  }
};
