import { CheckCircle2 } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <div className="glass-card gold-glow rounded-3xl p-10">
        <CheckCircle2 className="mx-auto size-12 text-primary" />
        <h1 className="mt-4 font-heading text-3xl font-semibold">You are in the queue</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We emailed your confirmation. Keep this code for lookup and door check-in.
        </p>
        <p className="mt-6 font-display text-5xl text-primary">{ref ?? "WAV-XXXX"}</p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink
            href={ref ? `/lookup?q=${encodeURIComponent(ref)}` : "/lookup"}
            className="rounded-full"
          >
            Check status
          </ButtonLink>
          <ButtonLink href="/events" variant="outline" className="rounded-full">
            More events
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
