"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

import { HostEventModal } from "@/components/home/host-event-modal";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/lib/config/site-config";
import { cn } from "@/lib/utils";

const links = [
  { href: "/events", label: "Events" },
  { href: "/lookup", label: "Lookup" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileReady, setMobileReady] = useState(false);

  useEffect(() => {
    setMobileReady(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-heading text-lg font-extrabold tracking-tight text-primary">
            {siteConfig.product.wordmark[0]}
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">
            {siteConfig.product.wordmark[1]}
          </span>
          <span className="hidden text-xs uppercase tracking-[0.22em] text-muted-foreground sm:inline">
            {siteConfig.cafe.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
                pathname === link.href && "text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
          <HostEventModal>
            <Button variant="ghost" className="rounded-full">
              Host
            </Button>
          </HostEventModal>
          <ButtonLink
            href="/admin"
            variant="outline"
            className="ml-2 rounded-full border-primary/30"
          >
            Admin
          </ButtonLink>
        </nav>

        {mobileReady ? (
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden" />
            }
          >
            <Menu />
          </SheetTrigger>
          <SheetContent side="right" className="bg-background">
            <SheetHeader>
              <SheetTitle>{siteConfig.product.name}</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-3 px-4">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="text-lg">
                  {link.label}
                </Link>
              ))}
              <HostEventModal>
                <Button variant="secondary" className="justify-start">
                  Host your event
                </Button>
              </HostEventModal>
              <Link href="/admin" className="text-lg text-primary">
                Admin
              </Link>
            </div>
          </SheetContent>
        </Sheet>
        ) : (
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
            <Menu />
          </Button>
        )}
      </div>
    </header>
  );
}
