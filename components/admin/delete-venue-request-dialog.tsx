"use client";

import { useState } from "react";

import { deleteDeclinedVenueRequest } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function DeleteDeclinedVenueButton({
  id,
  organizerName,
}: {
  id: string;
  organizerName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        size="sm"
        variant="destructive"
        onClick={() => setOpen(true)}
      >
        Delete
      </Button>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Delete this inquiry?</DialogTitle>
          <DialogDescription>
            This permanently removes the declined request from{" "}
            <span className="font-medium text-foreground">{organizerName}</span>.
          </DialogDescription>
        </DialogHeader>
        <form action={deleteDeclinedVenueRequest}>
          <input type="hidden" name="id" value={id} />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive">
              Delete inquiry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
