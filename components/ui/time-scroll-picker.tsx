import { cn } from "@/lib/utils";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface TimeScrollPickerProps {
  startDate: Date;
  endDate: Date;
  stepMinutes: number;
  selectedDate?: Date;
  onChange?: (date: Date) => void;
}

export function TimeScrollPicker({
  startDate,
  endDate,
  stepMinutes,
  selectedDate,
  onChange,
}: TimeScrollPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalSelected, setInternalSelected] = useState<Date>(startDate);

  const selected = selectedDate ?? internalSelected;

  const slots = useMemo(() => {
    const result: Date[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      result.push(new Date(current));
      current.setMinutes(current.getMinutes() + stepMinutes);
    }
    return result;
  }, [startDate, endDate, stepMinutes]);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const getSlotIndexForDate = useCallback(
    (date: Date) => {
      for (let i = 0; i < slots.length; i++) {
        const slotStart = slots[i];
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + stepMinutes);

        if (date >= slotStart && date < slotEnd) {
          return i;
        }
      }
      return 0;
    },
    [slots, stepMinutes]
  );

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || slots.length === 0) return;

    const idx = getSlotIndexForDate(selected);
    const el = container.querySelector<HTMLElement>(
      `[data-slot-index='${idx}']`
    );
    el?.scrollIntoView({
      behavior: "instant" as ScrollBehavior,
      inline: "center",
      block: "nearest",
    });
  }, [slots.length, selected, getSlotIndexForDate]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeout: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        const slotEls = Array.from(
          container.querySelectorAll<HTMLElement>("[data-slot-index]")
        );
        if (slotEls.length === 0) return;

        const containerRect = container.getBoundingClientRect();
        const containerCenter = containerRect.left + container.clientWidth / 2;

        let closestEl: HTMLElement | null = null;
        let closestDistance = Infinity;

        for (const el of slotEls) {
          const rect = el.getBoundingClientRect();
          const elCenter = rect.left + rect.width / 2;
          const distance = Math.abs(elCenter - containerCenter);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestEl = el;
          }
        }

        if (closestEl) {
          const idxAttr = closestEl.getAttribute("data-slot-index");
          const idx = idxAttr ? parseInt(idxAttr, 10) : -1;
          if (idx >= 0 && idx < slots.length) {
            const newDate = slots[idx];
            if (!selectedDate) setInternalSelected(newDate);
            onChange?.(newDate);
            closestEl.scrollIntoView({
              behavior: "smooth",
              inline: "center",
              block: "nearest",
            });
          }
        }
      }, 120);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll as EventListener);
    };
  }, [slots, onChange, selectedDate]);

  const handleClick = (slot: Date, element: HTMLDivElement) => {
    if (!selectedDate) setInternalSelected(slot);
    onChange?.(slot);
    element.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-[80%] w-24 -translate-x-1/2 -translate-y-1/2 border border-primary rounded-[23px]" />

      <div
        ref={containerRef}
        className="flex w-full snap-x snap-mandatory overflow-x-scroll scroll-smooth py-4 gap-4 touch-pan-x [&::-webkit-scrollbar]:hidden"
        style={{
          scrollbarWidth: "none" as const,
          msOverflowStyle: "none" as const,
        }}
      >
        <div className="shrink-0 basis-1/2" aria-hidden />
        {slots.map((slot, idx) => {
          const slotStart = slot;
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + stepMinutes);

          const isSelected = selected >= slotStart && selected < slotEnd;

          return (
            <div
              key={idx}
              data-slot-index={idx}
              onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                handleClick(slot, e.currentTarget)
              }
              className={cn(
                "shrink-0 snap-center rounded-xl px-4 py-2 text-lg font-medium transition-colors cursor-pointer select-none bg-white/20 backdrop-blur-md border border-white/30",
                isSelected
                  ? "bg-primary/40 text-primary-foreground border-primary/60"
                  : "bg-white/20 text-white border-white/30"
              )}
            >
              {formatTime(slot)}
            </div>
          );
        })}
        <div className="shrink-0 basis-1/2" aria-hidden />
      </div>
    </div>
  );
}
