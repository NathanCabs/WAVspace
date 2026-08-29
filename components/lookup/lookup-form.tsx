"use client";

import { useActionState } from "react";

import { searchRegistration, type LookupState } from "@/app/actions/lookup";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatEventDate, formatPeso } from "@/lib/format";
import { cn } from "@/lib/utils";

const initial: LookupState = { ok: false, message: "", results: [] };

export function LookupForm({ defaultQuery }: { defaultQuery?: string }) {
  const [state, action, pending] = useActionState(searchRegistration, initial);

  return (
    <div>
      <form action={action} className="glass-card flex flex-col gap-3 rounded-3xl p-4 sm:flex-row sm:items-end sm:p-5">
        <div className="grid flex-1 gap-1.5">
          <label htmlFor="query" className="text-sm">
            Email or reference code
          </label>
          <Input
            id="query"
            name="query"
            defaultValue={defaultQuery}
            placeholder="you@email.com or WAV-8842"
          />
        </div>
        <Button type="submit" className="rounded-full" disabled={pending}>
          {pending ? "Searching..." : "Look up"}
        </Button>
      </form>

      {state.message ? (
        <p className="mt-4 text-sm text-muted-foreground">{state.message}</p>
      ) : null}

      <div className="mt-6 grid gap-3">
        {state.results.map((result) => (
          <div key={result.id} className="glass-card rounded-3xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-heading text-2xl">{result.reference_code}</p>
                <p className="text-sm text-muted-foreground">
                  {result.event_title} · {formatEventDate(result.event_date)}
                </p>
                <p className="mt-1 text-sm">
                  {result.attendee_name} · {result.kit_name ?? "No kit"} ·{" "}
                  {formatPeso(result.total_amount)}
                </p>
              </div>
              <Badge
                className={cn(
                  result.status === "APPROVED" && "bg-emerald-500/20 text-emerald-200",
                  result.status === "PENDING" && "bg-primary/20 text-primary",
                  result.status === "REJECTED" && "bg-destructive/20 text-destructive",
                )}
              >
                {result.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
