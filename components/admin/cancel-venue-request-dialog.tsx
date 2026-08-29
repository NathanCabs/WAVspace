"use client";

import { useState } from "react";

import { cancelVenueRequest } from "@/app/actions/admin";
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

export function CancelVenueRequestButton({
  id,
  organizerName,
}: {
  id: string;
  organizerName: string;
}) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [reason, setReason] = useState("");
  const matches = typed.trim() === organizerName;
  const reasonReady = reason.trim().length >= 8;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setTyped("");
          setReason("");
        }
      }}
    >
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="text-destructive"
        onClick={() => setOpen(true)}
      >
        Cancel
      </Button>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Cancel this booking?</DialogTitle>
          <DialogDescription>
            The organizer is emailed. If an event was already created from this
            inquiry, that night is unpublished and registered guests are emailed
            too. Type{" "}
            <span className="font-medium text-foreground">{organizerName}</span>{" "}
            to confirm.
          </DialogDescription>
        </DialogHeader>
        <form action={cancelVenueRequest} className="grid gap-4">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="confirm_name" value={typed} />
          <div className="grid gap-1.5">
            <Label htmlFor={`venue-reason-${id}`}>Reason</Label>
            <Textarea
              id={`venue-reason-${id}`}
              name="reason"
              required
              minLength={8}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Floor unavailable / organizer withdrew / date conflict"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`venue-name-${id}`}>Organizer name</Label>
            <Input
              id={`venue-name-${id}`}
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              placeholder={organizerName}
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Keep request
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!matches || !reasonReady}
            >
              Cancel and email
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
