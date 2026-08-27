import { LookupForm } from "@/components/lookup/lookup-form";

export const dynamic = "force-dynamic";

export default async function LookupPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs uppercase tracking-[0.22em] text-primary">Status</p>
      <h1 className="font-heading text-4xl font-semibold">Find your registration</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Enter the email you used at checkout or your WAV-XXXX code to see if the
        cafe has approved your receipt.
      </p>
      <div className="mt-8">
        <LookupForm defaultQuery={q} />
      </div>
    </div>
  );
}
