"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  Hourglass,
  LayoutGrid,
  LogOut,
  Menu,
  Tent,
  UserRound,
} from "lucide-react";

import { logoutAdmin } from "@/app/actions/admin";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { siteConfig } from "@/lib/config/site-config";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/registrations", label: "Payments", icon: Hourglass },
  { href: "/admin/all-registrations", label: "Bookings", icon: ClipboardList },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/venue-requests", label: "Venue", icon: Tent },
  { href: "/admin/profile", label: "Account", icon: UserRound },
];

function isActive(href: string, pathname: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/65 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2.5 sm:px-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <Menu />
        </Button>

        <Link href="/admin" className="flex shrink-0 items-baseline gap-1.5">
          <span className="font-heading text-lg font-extrabold tracking-tight text-primary">
            {siteConfig.product.wordmark[0]}
          </span>
          <span className="font-heading text-sm font-medium tracking-wide text-muted-foreground">
            desk
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
          <div className="flex items-center gap-0.5 rounded-full bg-muted/50 p-1 ring-1 ring-foreground/6">
            {links.map((link) => (
              <NavLink
                key={link.href}
                {...link}
                active={isActive(link.href, pathname)}
              />
            ))}
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <ButtonLink
            href="/"
            variant="ghost"
            size="sm"
            className="hidden rounded-full sm:inline-flex"
          >
            Site
          </ButtonLink>
          <form action={logoutAdmin}>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              type="submit"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </form>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="gap-0 bg-background p-0 data-[side=left]:w-[min(18rem,85vw)] data-[side=left]:sm:max-w-[18rem]"
        >
          <SheetHeader className="border-b border-border">
            <SheetTitle className="font-heading">
              <span className="text-primary">
                {siteConfig.product.wordmark[0]}
              </span>{" "}
              desk
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
            {links.map((link) => (
              <SideLink
                key={link.href}
                {...link}
                active={isActive(link.href, pathname)}
                onNavigate={() => setOpen(false)}
              />
            ))}
          </nav>
          <div className="border-t border-border p-3">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center rounded-2xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Back to site
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof LayoutGrid;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors",
        active
          ? "bg-background text-foreground shadow-sm ring-1 ring-foreground/8"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className={cn("size-3.5", active && "text-primary")} />
      {label}
    </Link>
  );
}

function SideLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof LayoutGrid;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      <Icon className={cn("size-4", active && "text-primary")} />
      {label}
    </Link>
  );
}
