import type { ReactNode } from "react";

export function AdminPageHeader({
  title,
  description,
  error,
  success,
  children,
}: {
  title: string;
  description?: string;
  error?: string;
  success?: string;
  children?: ReactNode;
}) {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {children}
      </div>
      {error ? (
        <p className="rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-primary">
          {success}
        </p>
      ) : null}
    </div>
  );
}
