"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { submitVenueRequest, type ActionState } from "@/app/actions/venue";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/lib/config/site-config";

const initial: ActionState = { ok: false, message: "" };

export function HostEventModal({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(submitVenueRequest, initial);

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) {
      toast.success(state.message);
      setOpen(false);
    } else {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <>
      <div className="contents" onClick={() => setOpen(true)}>
        {children}
      </div>
      {open ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="glass-card sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">
                Host your event here
              </DialogTitle>
              <DialogDescription>
                Fan clubs, collectives, and workshop leads can request a date on
                the {siteConfig.cafe.name} floor. We review inquiries manually.
              </DialogDescription>
            </DialogHeader>
            <form action={action} className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="organizer_name">Organizer name</Label>
                <Input
                  id="organizer_name"
                  name="organizer_name"
                  required
                  placeholder="Your collective"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="contact_email">Email</Label>
                  <Input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    required
                    placeholder="you@email.com"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="contact_phone">Phone</Label>
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    placeholder="09xx xxx xxxx"
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="proposed_date">Proposed date</Label>
                  <Input
                    id="proposed_date"
                    name="proposed_date"
                    type="date"
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="expected_attendance">Expected attendance</Label>
                  <Input
                    id="expected_attendance"
                    name="expected_attendance"
                    type="number"
                    min={1}
                    placeholder="40"
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="event_description">Event description</Label>
                <Textarea
                  id="event_description"
                  name="event_description"
                  required
                  placeholder="Cupsleeve for a comeback, expected layout, merch table needs..."
                />
              </div>
              <DialogFooter className="border-0 bg-transparent p-0">
                <Button type="submit" disabled={pending} className="rounded-full">
                  {pending ? "Sending..." : "Submit inquiry"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}
