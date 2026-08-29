import { LookupForm } from "@/components/lookup/lookup-form";
import { PublicPageHeader } from "@/components/layout/public-page-header";

export const dynamic = "force-dynamic";

export default async function LookupPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <PublicPageHeader
        eyebrow="Status"
        title="Find your registration"
        description="Enter the email you used at checkout or your WAV-XXXX code to see if the cafe has approved your receipt."
      />
      <LookupForm defaultQuery={q} />
    </div>
  );
}
