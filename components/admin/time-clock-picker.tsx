"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const MINUTE_STEP = 5;
const CLOCK_RADIUS = 84;

function parseClockValue(value: string | undefined) {
  if (!value) return { hours: 13, minutes: 0 };
  const [hours, minutes] = value.split(":").map((part) => Number(part) || 0);
  return {
    hours: Math.min(23, Math.max(0, hours)),
    minutes: Math.min(59, Math.max(0, minutes)),
  };
}

function toClockValue(hours: number, minutes: number) {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function hour12FromHours(hours: number) {
  return hours % 12 || 12;
}

function hoursFromParts(hour12: number, isPm: boolean) {
  if (hour12 === 12) return isPm ? 12 : 0;
  return hour12 + (isPm ? 12 : 0);
}

function snapMinutes(minutes: number) {
  const snapped = Math.round(minutes / MINUTE_STEP) * MINUTE_STEP;
  return snapped === 60 ? 0 : snapped;
}

function faceItems(mode: "hour" | "minute") {
  return Array.from({ length: 12 }, (_, index) =>
    mode === "hour" ? (index === 0 ? 12 : index) : index * MINUTE_STEP,
  );
}

function pointForIndex(index: number) {
  const angle = (index / 12) * 2 * Math.PI - Math.PI / 2;
  return {
    x: Math.cos(angle) * CLOCK_RADIUS,
    y: Math.sin(angle) * CLOCK_RADIUS,
  };
}

export function TimeClockPicker({
  id,
  name,
  defaultValue,
  required,
  align = "start",
}: {
  id: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  align?: "start" | "end";
}) {
  const parsed = parseClockValue(defaultValue);
  const [hours, setHours] = useState(parsed.hours);
  const [minutes, setMinutes] = useState(snapMinutes(parsed.minutes));
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"hour" | "minute">("hour");
  const rootRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<HTMLDivElement>(null);

  const value = toClockValue(hours, minutes);
  const isPm = hours >= 12;
  const hour12 = hour12FromHours(hours);
  const selectedIndex = mode === "hour" ? hour12 % 12 : minutes / MINUTE_STEP;
  const handAngle = selectedIndex * 30;

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setMode("hour");
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setMode("hour");
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function selectHour(nextHour12: number) {
    setHours(hoursFromParts(nextHour12, isPm));
    setMode("minute");
  }

  function selectMinute(nextMinute: number) {
    setMinutes(snapMinutes(nextMinute));
  }

  function setPeriod(nextPm: boolean) {
    setHours(hoursFromParts(hour12, nextPm));
  }

  function pickFromFace(clientX: number, clientY: number) {
    const face = faceRef.current;
    if (!face) return;
    const rect = face.getBoundingClientRect();
    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;
    let angle = Math.atan2(y, x) + Math.PI / 2;
    if (angle < 0) angle += 2 * Math.PI;
    const index = Math.round((angle / (2 * Math.PI)) * 12) % 12;
    if (mode === "hour") {
      selectHour(index === 0 ? 12 : index);
    } else {
      selectMinute(index * MINUTE_STEP);
    }
  }

  return (
    <div ref={rootRef} className={cn("relative", open && "z-50")}>
      <input type="hidden" name={name} value={value} required={required} />
      <button
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${id}-clock`}
        onClick={() => {
          setOpen((current) => !current);
          setMode("hour");
        }}
        className={cn(
          "flex h-8 w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 text-left text-sm outline-none transition-colors",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "dark:bg-input/30",
        )}
      >
        <span>{formatTime(value)}</span>
        <Clock className="size-3.5 text-muted-foreground" />
      </button>
      {open ? (
        <div
          id={`${id}-clock`}
          role="dialog"
          className={cn(
            "glass-card absolute z-50 mt-2 w-[18.5rem] rounded-3xl p-4",
            align === "end" && "right-0",
          )}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="font-heading text-3xl tabular-nums tracking-tight">
              <button
                type="button"
                onClick={() => setMode("hour")}
                className={cn(
                  "rounded-md px-0.5 transition-colors",
                  mode === "hour" ? "text-primary" : "text-muted-foreground",
                )}
              >
                {String(hour12).padStart(2, "0")}
              </button>
              <span className="text-muted-foreground">:</span>
              <button
                type="button"
                onClick={() => setMode("minute")}
                className={cn(
                  "rounded-md px-0.5 transition-colors",
                  mode === "minute" ? "text-primary" : "text-muted-foreground",
                )}
              >
                {String(minutes).padStart(2, "0")}
              </button>
            </p>
            <div className="grid gap-1">
              <Button
                type="button"
                size="xs"
                variant={isPm ? "outline" : "default"}
                onClick={() => setPeriod(false)}
              >
                AM
              </Button>
              <Button
                type="button"
                size="xs"
                variant={isPm ? "default" : "outline"}
                onClick={() => setPeriod(true)}
              >
                PM
              </Button>
            </div>
          </div>
          <div
            ref={faceRef}
            className="relative mx-auto size-56 cursor-pointer rounded-full bg-muted/50"
            onPointerDown={(event) => {
              if ((event.target as HTMLElement).closest("button")) return;
              pickFromFace(event.clientX, event.clientY);
            }}
          >
            <div
              className="absolute top-1/2 left-1/2 h-[38%] w-0.5 origin-bottom rounded-full bg-primary"
              style={{
                transform: `translate(-50%, -100%) rotate(${handAngle}deg)`,
              }}
            />
            <div className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
            {faceItems(mode).map((item, index) => {
              const point = pointForIndex(index);
              const selected =
                mode === "hour" ? item === hour12 : item === minutes;
              return (
                <button
                  key={`${mode}-${item}`}
                  type="button"
                  onClick={() =>
                    mode === "hour" ? selectHour(item) : selectMinute(item)
                  }
                  className={cn(
                    "absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-sm transition-colors",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-background/70",
                  )}
                  style={{
                    left: `calc(50% + ${point.x}px)`,
                    top: `calc(50% + ${point.y}px)`,
                  }}
                >
                  {mode === "hour" ? item : String(item).padStart(2, "0")}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              size="sm"
              className="rounded-full"
              onClick={() => {
                setOpen(false);
                setMode("hour");
              }}
            >
              Done
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
