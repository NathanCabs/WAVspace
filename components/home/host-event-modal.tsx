"use client";

import { useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";

import { submitVenueRequest } from "@/app/actions/venue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/lib/config/site-config";
import { localToday } from "@/lib/dates";

export function HostEventModal({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  function submit(formData: FormData) {
    start(async () => {
      const result = await submitVenueRequest(undefined, formData);
      if (result.ok) {
        toast.success(result.message);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <>
      <div className="contents" onClick={() => setOpen(true)}>
        {children}
      </div>
      {open ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="right"
            className="gap-0 bg-background p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl"
          >
            <SheetHeader className="border-b border-border">
              <SheetTitle className="font-heading text-xl">
                Host your event here
              </SheetTitle>
              <SheetDescription>
                Fan clubs, collectives, and workshop leads can request a date on
                the {siteConfig.cafe.name} floor. We review inquiries manually.
              </SheetDescription>
            </SheetHeader>
            <form action={submit} className="flex min-h-0 flex-1 flex-col">
              <div className="grid flex-1 content-start gap-3 overflow-y-auto px-4 py-4">
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
                      min={localToday()}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="expected_attendance">
                      Expected attendance
                    </Label>
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
                    className="min-h-40"
                  />
                </div>
              </div>
              <SheetFooter className="border-t border-border">
                <Button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-full sm:w-auto"
                >
                  {pending ? "Sending..." : "Submit inquiry"}
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      ) : null}
    </>
  );
}
