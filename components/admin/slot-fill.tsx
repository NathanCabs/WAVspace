"use client";

import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";

export function SlotFill({ taken, max }: { taken: number; max: number }) {
  const value = max > 0 ? Math.round((taken / max) * 100) : 0;
  return (
    <Progress value={value} className="gap-1">
      <ProgressLabel className="text-xs text-muted-foreground">
        {taken}/{max} filled
      </ProgressLabel>
      <ProgressValue className="text-xs" />
    </Progress>
  );
}
