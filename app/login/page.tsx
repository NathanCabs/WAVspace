import { loginAdmin } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/lib/config/site-config";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form action={loginAdmin} className="glass-card w-full max-w-sm rounded-3xl p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-primary">Staff</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">{siteConfig.cafe.name} login</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Admin only. Attendees register as guests — no account needed.
        </p>
        <div className="mt-6 grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="mt-2 rounded-full">
            Sign in
          </Button>
        </div>
      </form>
    </div>
  );
}
