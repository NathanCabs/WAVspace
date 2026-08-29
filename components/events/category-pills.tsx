import Link from "next/link";

import {
  eventCategoryHref,
  type CategoryChip,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

export function CategoryPills({
  categories,
  activeCategory,
  activeCustom,
  showAll,
}: {
  categories: CategoryChip[];
  activeCategory?: string;
  activeCustom?: string;
  showAll?: boolean;
}) {
  if (!categories.length) return null;

  const hasActive = Boolean(activeCategory);

  return (
    <div className="flex flex-wrap gap-2">
      {showAll ? (
        <Link
          href="/events"
          className={cn(
            "rounded-full border px-3 py-2 text-center text-xs transition-colors",
            !hasActive
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-muted/50 text-muted-foreground hover:text-foreground",
          )}
        >
          All
        </Link>
      ) : null}
      {categories.map((chip) => {
        const active =
          activeCategory === chip.category &&
          (chip.custom ?? "") === (activeCustom ?? "");
        return (
          <Link
            key={`${chip.category}:${chip.custom ?? ""}`}
            href={eventCategoryHref(chip)}
            className={cn(
              "rounded-full border px-3 py-2 text-center text-xs transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-muted/50 text-muted-foreground hover:text-foreground",
            )}
          >
            {chip.label}
          </Link>
        );
      })}
    </div>
  );
}
