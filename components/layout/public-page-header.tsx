import type { ReactNode } from "react";

export function PublicPageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8">
      {eyebrow ? (
        <p className="text-xs uppercase tracking-[0.22em] text-primary">
          {eyebrow}
        </p>
      ) : null}
      <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}
