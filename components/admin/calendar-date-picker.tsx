"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  addMonths,
  format,
  getDay,
  getDaysInMonth,
  isSameDay,
  isToday,
  startOfMonth,
} from "date-fns";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { localToday } from "@/lib/dates";
import { formatEventDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function todayValue() {
  return localToday();
}

function parseDateValue(value: string | undefined) {
  const raw = value?.trim() || todayValue();
  const [year, month, day] = raw.split("-").map(Number);
  return new Date(year || 1970, (month || 1) - 1, day || 1);
}

function toDateValue(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function monthCells(viewMonth: Date) {
  const start = startOfMonth(viewMonth);
  const days = getDaysInMonth(viewMonth);
  const offset = getDay(start);
  const cells: Array<Date | null> = Array.from({ length: offset }, () => null);
  for (let day = 1; day <= days; day += 1) {
    cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

export function CalendarDatePicker({
  id,
  name,
  defaultValue,
  required,
  minDate,
  allowValue,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  minDate?: string;
  allowValue?: string;
}) {
  const today = minDate?.slice(0, 10) || localToday();
  const allowedPast = allowValue?.trim().slice(0, 10) || undefined;
  const [value, setValue] = useState(
    defaultValue?.trim() ? defaultValue.slice(0, 10) : todayValue(),
  );
  const selected = parseDateValue(value);
  const [viewMonth, setViewMonth] = useState(startOfMonth(selected));
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const cells = useMemo(() => monthCells(viewMonth), [viewMonth]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", open && "z-50")}>
      <input type="hidden" name={name} value={value} required={required} />
      <button
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${id}-calendar`}
        onClick={() => {
          setOpen((current) => !current);
          setViewMonth(startOfMonth(parseDateValue(value)));
        }}
        className={cn(
          "flex h-8 w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 text-left text-sm outline-none transition-colors",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "dark:bg-input/30",
        )}
      >
        <span className="truncate">{formatEventDate(value)}</span>
        <Calendar className="size-3.5 shrink-0 text-muted-foreground" />
      </button>
      {open ? (
        <div
          id={`${id}-calendar`}
          role="dialog"
          className="glass-card absolute z-50 mt-2 w-[19.5rem] rounded-3xl p-4"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              aria-label="Previous month"
              onClick={() => setViewMonth((current) => addMonths(current, -1))}
            >
              <ChevronLeft />
            </Button>
            <p className="font-heading text-base tracking-tight">
              {format(viewMonth, "MMMM yyyy")}
            </p>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              aria-label="Next month"
              onClick={() => setViewMonth((current) => addMonths(current, 1))}
            >
              <ChevronRight />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wider text-muted-foreground">
            {WEEKDAYS.map((day) => (
              <span key={day} className="py-1">
                {day}
              </span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((day, index) => {
              if (!day) {
                return <span key={`empty-${index}`} className="size-9" />;
              }
              const dayValue = toDateValue(day);
              const selectedDay = isSameDay(day, selected);
              const allowed =
                dayValue >= today ||
                (allowedPast !== undefined && dayValue === allowedPast);
              return (
                <button
                  key={dayValue}
                  type="button"
                  disabled={!allowed}
                  onClick={() => {
                    if (!allowed) return;
                    setValue(dayValue);
                  }}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full text-sm transition-colors",
                    selectedDay
                      ? "bg-primary text-primary-foreground"
                      : allowed
                        ? "hover:bg-background/70"
                        : "cursor-not-allowed text-muted-foreground/40",
                    !selectedDay && isToday(day) && allowed && "font-semibold text-primary",
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              size="sm"
              className="rounded-full"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
