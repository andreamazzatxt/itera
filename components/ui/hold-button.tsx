import { Button } from "@/components/ui/button";
import { useRef } from "react";

interface HoldButtonProps {
  onHold: () => void;
  className?: string;
  children: React.ReactNode;
  interval?: number;
}

export function HoldButton({
  onHold,
  children,
  className,
  interval = 200,
}: HoldButtonProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startHold = () => {
    onHold();
    intervalRef.current = setInterval(() => {
      onHold();
    }, interval);
  };

  const stopHold = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <Button
      className={className}
      variant="ghost"
      onMouseDown={startHold}
      onMouseUp={stopHold}
      onMouseLeave={stopHold}
      onTouchStart={startHold}
      onTouchEnd={stopHold}
    >
      {children}
    </Button>
  );
}
