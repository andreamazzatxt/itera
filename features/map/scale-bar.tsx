import { useMemo } from "react";

export function ScaleBar({
  latitude,
  zoom,
}: {
  latitude: number;
  zoom: number;
}) {
  const { label, px } = useMemo(() => {
    const mPerPx = metersPerPixel(latitude, zoom);
    const targetWidthPx = 100;
    const meters = mPerPx * targetWidthPx;
    const niceMeters = niceScaleLength(meters);
    const px = niceMeters / mPerPx;
    const label =
      niceMeters >= 1000 ? `${niceMeters / 1000} km` : `${niceMeters} m`;
    return { label, px };
  }, [latitude, zoom]);

  return (
    <div className="absolute bottom-2 left-2 flex items-center text-xs text-white">
      <div className="h-[4px] bg-white" style={{ width: `${px}px` }} />
      <span className="ml-2">{label}</span>
    </div>
  );
}

function metersPerPixel(latitude: number, zoom: number): number {
  const earthCircumference = 40075016.686; // in metri
  const latitudeRad = (latitude * Math.PI) / 180;
  return (earthCircumference * Math.cos(latitudeRad)) / Math.pow(2, zoom + 8);
}

function niceScaleLength(meters: number): number {
  const scales = [
    1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000,
    100000, 200000, 500000,
  ];

  const predefined = scales.find((s) => s >= meters);
  if (predefined) return predefined;

  const exp = Math.floor(Math.log10(meters));
  const base = Math.pow(10, exp);
  const normalized = meters / base;
  let multiplier: number;
  if (normalized <= 2) multiplier = 2;
  else if (normalized <= 5) multiplier = 5;
  else multiplier = 10;
  return multiplier * base;
}
