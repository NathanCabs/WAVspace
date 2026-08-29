import { completePasswordReset } from "@/app/actions/admin";
import { AuthPageChrome } from "@/components/auth-page-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthPageChrome>
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        action={completePasswordReset}
        className="glass-card w-full max-w-sm rounded-3xl p-8"
      >
        <p className="text-xs uppercase tracking-[0.22em] text-primary">Staff</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">
          Choose a new password
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick a new password for this admin account. It will not be stored or
          displayed in the app.
        </p>
        <div className="mt-6 grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              required
              minLength={6}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="mt-2 rounded-full">
            Save password
          </Button>
        </div>
      </form>
    </div>
    </AuthPageChrome>
  );
}
