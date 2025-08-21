import { MapViewState } from "@deck.gl/core";
import { useEffect, useRef } from "react";

type AutoCameraMoveOptions = {
  active: boolean;
  setViewState: React.Dispatch<React.SetStateAction<MapViewState>>;
  stopOnUserMove?: boolean;
};

export function useFlyOver({ active, setViewState }: AutoCameraMoveOptions) {
  const animatingRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const directionRef = useRef({ lon: 1, lat: 1 });
  const stepRef = useRef({ lon: 0.00002, lat: 0.000015, bearing: 0.005 });

  useEffect(() => {
    if (active && !animatingRef.current) {
      animatingRef.current = true;

      const animate = () => {
        setViewState((vs) => {
          const lonDelta = stepRef.current.lon * directionRef.current.lon;
          const latDelta = stepRef.current.lat * directionRef.current.lat;

          if ((vs.longitude ?? 0) > 180 || (vs.longitude ?? 0) < -180) {
            directionRef.current.lon *= -1;
          }
          if ((vs.latitude ?? 0) > 85 || (vs.latitude ?? 0) < -85) {
            directionRef.current.lat *= -1;
          }

          return {
            ...vs,
            bearing: ((vs.bearing ?? 0) + stepRef.current.bearing) % 360,
            longitude: (vs.longitude ?? 0) + lonDelta,
            latitude: (vs.latitude ?? 0) + latDelta,
          };
        });

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    if (!active && animatingRef.current) {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      animatingRef.current = false;
    }

    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      animatingRef.current = false;
    };
  }, [active, setViewState]);

  const stop = () => {
    if (animatingRef.current && animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animatingRef.current = false;
    }
  };

  return { stop };
}
