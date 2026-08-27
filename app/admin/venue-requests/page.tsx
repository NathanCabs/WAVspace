import { updateVenueRequestStatus } from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatEventDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function VenueRequestsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("venue_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-heading text-3xl font-semibold">Venue requests</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        External organizers applying to rent the cafe floor.
      </p>
      <div className="mt-6 grid gap-4">
        {(data ?? []).map((request) => (
          <article key={request.id} className="glass-card rounded-3xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl">{request.organizer_name}</h2>
                <p className="text-sm text-muted-foreground">
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
                  request.status === "APPROVED" && "bg-emerald-500/20 text-emerald-200",
                  request.status === "PENDING" && "bg-primary/20 text-primary",
                  request.status === "DECLINED" && "bg-destructive/20 text-destructive",
                )}
              >
                {request.status}
              </Badge>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {request.event_description}
            </p>
            {request.status === "PENDING" ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <form action={updateVenueRequestStatus}>
                  <input type="hidden" name="id" value={request.id} />
                  <input type="hidden" name="status" value="APPROVED" />
                  <Button size="sm" type="submit">
                    Approve
                  </Button>
                </form>
                <form action={updateVenueRequestStatus} className="flex gap-2">
                  <input type="hidden" name="id" value={request.id} />
                  <input type="hidden" name="status" value="DECLINED" />
                  <Textarea name="admin_notes" placeholder="Note" className="h-8 min-h-8 w-40" />
                  <Button size="sm" variant="destructive" type="submit">
                    Decline
                  </Button>
                </form>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
