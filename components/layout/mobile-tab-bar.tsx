"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, Plus, Search } from "lucide-react";

import { HostEventModal } from "@/components/home/host-event-modal";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Home", icon: Home, match: (path: string) => path === "/" },
  {
    href: "/events",
    label: "Events",
    icon: CalendarDays,
    match: (path: string) => path.startsWith("/events"),
  },
  {
    href: "/lookup",
    label: "Lookup",
    icon: Search,
    match: (path: string) => path.startsWith("/lookup"),
  },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      aria-label="Primary"
    >
      <div className="grid h-16 grid-cols-4 items-end px-2">
        {tabs.slice(0, 2).map((tab) => (
          <TabLink
            key={tab.href}
            {...tab}
            active={tab.match(pathname)}
          />
        ))}
        <HostEventModal>
          <button
            type="button"
            className="flex flex-col items-center justify-end gap-1 pb-2 text-[11px] text-muted-foreground"
            aria-label="Host your event"
          >
            <span className="flex size-12 -translate-y-3 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <Plus className="size-5" />
            </span>
            <span className="-mt-2">Host</span>
          </button>
        </HostEventModal>
        <TabLink
          {...tabs[2]}
          active={tabs[2].match(pathname)}
        />
      </div>
    </nav>
  );
}

function TabLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex flex-col items-center justify-center gap-1 pb-2 text-[11px] transition-colors",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className={cn("size-5", active && "text-primary")} />
      {label}
    </Link>
  );
}
