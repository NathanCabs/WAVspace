import { requestPasswordReset } from "@/app/actions/admin";
import { AuthPageChrome } from "@/components/auth-page-chrome";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/lib/config/site-config";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;

  return (
    <AuthPageChrome>
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        action={requestPasswordReset}
        className="glass-card w-full max-w-sm rounded-3xl p-8"
      >
        <p className="text-xs uppercase tracking-[0.22em] text-primary">Staff</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">
          Reset password
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We will email a reset link to the {siteConfig.cafe.name} admin
          account. The current password is never shown.
        </p>
        <div className="mt-6 grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {sent ? (
            <p className="text-sm text-primary">
              If that email has an account, a reset link is on the way.
            </p>
          ) : null}
          <Button type="submit" className="mt-2 rounded-full">
            Send reset link
          </Button>
          <ButtonLink href="/login" variant="ghost" className="rounded-full">
            Back to login
          </ButtonLink>
          <ButtonLink href="/" variant="ghost" className="rounded-full">
            Back to site
          </ButtonLink>
        </div>
      </form>
    </div>
    </AuthPageChrome>
  );
}
