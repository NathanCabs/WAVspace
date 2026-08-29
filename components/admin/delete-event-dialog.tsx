"use client";

import { useState } from "react";

import { deleteEvent } from "@/app/actions/admin";
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

export function DeleteEventDialog({
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
  const matches = typed.trim() === title;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setTyped("");
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Delete this event?</DialogTitle>
          <DialogDescription>
            This removes the event, its kits, registrations, and uploaded
            receipts without emailing anyone. If guests already registered,
            cancel the night first so they are notified. Type{" "}
            <span className="font-medium text-foreground">{title}</span> to
            confirm.
          </DialogDescription>
        </DialogHeader>
        <form action={deleteEvent} className="grid gap-4">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="confirm_title" value={typed} />
          <div className="grid gap-1.5">
            <Label htmlFor={`confirm-${id}`}>Event title</Label>
            <Input
              id={`confirm-${id}`}
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
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={!matches}>
              Delete event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteEventButton({
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
        variant="destructive"
        onClick={() => setOpen(true)}
      >
        Delete
      </Button>
      <DeleteEventDialog
        id={id}
        title={title}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
