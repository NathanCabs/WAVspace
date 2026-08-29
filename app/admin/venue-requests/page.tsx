import { updateVenueRequestStatus } from "@/app/actions/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CancelVenueRequestButton } from "@/components/admin/cancel-venue-request-dialog";
import { DeleteDeclinedVenueButton } from "@/components/admin/delete-venue-request-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/lib/config/site-config";
import { formatEventDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { VenueRequest } from "@/lib/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function organizerMailto(request: VenueRequest) {
  const subject = `${siteConfig.cafe.name} venue inquiry — ${request.organizer_name}`;
  const date = formatEventDate(request.proposed_date);
  const body =
    request.status === "APPROVED"
      ? `Hi ${request.organizer_name},\n\nWe approved your request to host on ${date} at ${siteConfig.cafe.name}. Let's lock the remaining details (timing, floor layout, guest count, and listing copy).\n\n`
      : `Hi ${request.organizer_name},\n\nI'm following up on your request to host on ${date} at ${siteConfig.cafe.name}.\n\n`;
  return `mailto:${request.contact_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default async function VenueRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("venue_requests")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = data ?? [];

  return (
    <div>
      <AdminPageHeader
        title="Venue"
        description="External organizers applying to rent the cafe floor. Approve or decline emails them. After approval, lock details, then create the event."
        error={error}
      />
      <div className="mt-8 grid gap-3">
        {rows.length === 0 ? (
          <p className="glass-card rounded-3xl px-5 py-10 text-center text-sm text-muted-foreground">
            No venue inquiries yet.
          </p>
        ) : null}
        {rows.map((request) => (
          <article key={request.id} className="glass-card rounded-3xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl">{request.organizer_name}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {request.contact_email}
                  {request.contact_phone ? ` · ${request.contact_phone}` : ""}
                </p>
                <p className="mt-2 text-sm">
                  {formatEventDate(request.proposed_date)}
                  {request.expected_attendance
                    ? ` · ~${request.expected_attendance} guests`
                    : ""}
                </p>
              </div>
              <Badge
                className={cn(
                  request.status === "APPROVED" &&
                    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200",
                  request.status === "PENDING" && "bg-primary/15 text-primary",
                  request.status === "DECLINED" &&
                    "bg-destructive/15 text-destructive",
                  request.status === "CANCELLED" &&
                    "bg-destructive/15 text-destructive",
                )}
              >
                {request.status}
              </Badge>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {request.event_description}
            </p>
            {request.admin_notes ? (
              <p className="mt-3 text-sm">
                <span className="text-muted-foreground">Note to organizer: </span>
                {request.admin_notes}
              </p>
            ) : null}
            {request.status === "PENDING" ? (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
                <form
                  action={updateVenueRequestStatus}
                  className="flex flex-wrap items-center gap-2"
                >
                  <input type="hidden" name="id" value={request.id} />
                  <input type="hidden" name="status" value="APPROVED" />
                  <Input
                    name="admin_notes"
                    placeholder="Note to organizer"
                    className="h-8 w-48 rounded-full"
                  />
                  <Button size="sm" type="submit" className="rounded-full">
                    Approve
                  </Button>
                </form>
                <form
                  action={updateVenueRequestStatus}
                  className="flex items-center gap-2"
                >
                  <input type="hidden" name="id" value={request.id} />
                  <input type="hidden" name="status" value="DECLINED" />
                  <Input
                    name="admin_notes"
                    placeholder="Reason"
                    className="h-8 w-40 rounded-full"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    type="submit"
                    className="rounded-full"
                  >
                    Decline
                  </Button>
                </form>
                <a
                  href={organizerMailto(request)}
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                    className: "rounded-full",
                  })}
                >
                  Email
                </a>
              </div>
            ) : null}
            {request.status === "APPROVED" ? (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
                <a
                  href={organizerMailto(request)}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "rounded-full",
                  })}
                >
                  Email organizer
                </a>
                <ButtonLink
                  href={`/admin/events/new?from=${request.id}`}
                  size="sm"
                  className="rounded-full"
                >
                  Create event
                </ButtonLink>
                <CancelVenueRequestButton
                  id={request.id}
                  organizerName={request.organizer_name}
                />
              </div>
            ) : null}
            {request.status === "DECLINED" ? (
              <div className="mt-4 border-t border-border/60 pt-4">
                <DeleteDeclinedVenueButton
                  id={request.id}
                  organizerName={request.organizer_name}
                />
              </div>
            ) : null}
            {request.status === "CANCELLED" ? (
              <p className="mt-4 text-sm text-muted-foreground">
                This inquiry was cancelled. The organizer was emailed, and
                registered guests were emailed if an event already existed.
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
