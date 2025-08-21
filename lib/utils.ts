import { MapViewState } from "@deck.gl/core";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString();
}

export function hexToRgbTuple(
  hex: string,
  alpha = 255
): [number, number, number, number] {
  hex = hex.replace(/^#/, "");

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((ch) => ch + ch)
      .join("");
  }

  const num = parseInt(hex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  return [r, g, b, alpha];
}

export function isMapViewState(vs: unknown): vs is MapViewState {
  if (!vs || typeof vs !== "object") return false;

  if ("longitude" in vs && "latitude" in vs) {
    return (
      vs &&
      typeof vs === "object" &&
      typeof vs.longitude === "number" &&
      typeof vs.latitude === "number"
    );
  }

  return false;
}
