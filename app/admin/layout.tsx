import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAdmin } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/constants";
import { siteConfig } from "@/lib/config/site-config";
import { requireAdmin } from "@/lib/data";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/registrations", label: "Payments" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/venue-requests", label: "Venue" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    redirect("/login?error=Connect%20Supabase%20to%20use%20the%20admin%20desk.");
  }

  const { user, profile } = await requireAdmin();
  if (!user || profile?.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/admin" className="font-heading font-bold">
            <span className="text-primary">{siteConfig.product.wordmark[0]}</span> desk
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
          <form action={logoutAdmin}>
            <Button variant="ghost" size="sm" className="rounded-full" type="submit">
              Sign out
            </Button>
          </form>
        </div>
        <nav className="flex gap-3 overflow-x-auto px-4 pb-3 text-sm text-muted-foreground sm:hidden">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
