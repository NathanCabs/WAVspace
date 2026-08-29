import {
  changePassword,
  updateDisplayName,
} from "@/app/actions/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ResetDataForm } from "@/components/admin/reset-data-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireAdmin } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;
  const { user, profile } = await requireAdmin();

  const savedMessage =
    saved === "name"
      ? "Display name updated."
      : saved === "password"
        ? "Password updated."
        : saved === "reset"
          ? "Site data was cleared. Events, registrations, and venue requests are gone."
          : null;

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        title="Account"
        description="Your login details. Passwords are hashed by Supabase and never shown here."
        error={error}
        success={savedMessage ?? undefined}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="glass-card grid gap-4 rounded-3xl p-5">
          <div>
            <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
              Profile
            </p>
            <h2 className="mt-1 font-heading text-lg">Staff details</h2>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email ?? ""} readOnly />
          </div>
          <form action={updateDisplayName} className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="display_name">Display name</Label>
              <Input
                id="display_name"
                name="display_name"
                required
                defaultValue={profile?.display_name ?? ""}
              />
            </div>
            <Button type="submit" className="w-fit rounded-full">
              Save name
            </Button>
          </form>
        </section>

        <section className="glass-card grid gap-4 rounded-3xl p-5">
          <div>
            <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
              Security
            </p>
            <h2 className="mt-1 font-heading text-lg">Change password</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your current password, then choose a new one.
            </p>
          </div>
          <form action={changePassword} className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                minLength={6}
                autoComplete="current-password"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="confirm">Confirm new password</Label>
              <Input
                id="confirm"
                name="confirm"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-fit rounded-full">
              Update password
            </Button>
          </form>
        </section>
      </div>

      <ResetDataForm />
    </div>
  );
}
