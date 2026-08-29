"use client";

import { useState } from "react";

import { cancelEvent } from "@/app/actions/admin";
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

export function CancelEventDialog({
  id,
  title,
  open,
  onOpenChange,
}: {
  id: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [typed, setTyped] = useState("");
  const [reason, setReason] = useState("");
  const matches = typed.trim() === title;
  const reasonReady = reason.trim().length >= 8;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setTyped("");
          setReason("");
        }
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Cancel this event?</DialogTitle>
          <DialogDescription>
            The night comes off the public calendar. Pending and approved guests
            are emailed, and a linked organizer is emailed too. Registrations
            stay on the attendee list. Type{" "}
            <span className="font-medium text-foreground">{title}</span> to
            confirm.
          </DialogDescription>
        </DialogHeader>
        <form action={cancelEvent} className="grid gap-4">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="confirm_title" value={typed} />
          <div className="grid gap-1.5">
            <Label htmlFor={`cancel-reason-${id}`}>Reason for guests</Label>
            <Textarea
              id={`cancel-reason-${id}`}
              name="reason"
              required
              minLength={8}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Cafe closed for a private booking / host withdrew / weather"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`cancel-title-${id}`}>Event title</Label>
            <Input
              id={`cancel-title-${id}`}
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              placeholder={title}
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Keep event
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!matches || !reasonReady}
            >
              Cancel event and email
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CancelEventButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="text-destructive"
        onClick={() => setOpen(true)}
      >
        Cancel
      </Button>
      <CancelEventDialog
        id={id}
        title={title}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
