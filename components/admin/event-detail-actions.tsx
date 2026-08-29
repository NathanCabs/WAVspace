"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { CancelEventDialog } from "@/components/admin/cancel-event-dialog";
import { DeleteEventDialog } from "@/components/admin/delete-event-dialog";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";

export function EventDetailActions({
  id,
  title,
  cancelled,
}: {
  id: string;
  title: string;
  cancelled: boolean;
}) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <ButtonLink
          href={`/admin/events/${id}/edit`}
          className="rounded-full px-4"
        >
          <Pencil className="size-3.5" />
          Edit
        </ButtonLink>
        {cancelled ? null : (
          <Button
            type="button"
            variant="outline"
            className="rounded-full text-destructive"
            onClick={() => setCancelOpen(true)}
          >
            Cancel night
          </Button>
        )}
        <Button
          type="button"
          variant="destructive"
          className="rounded-full"
          onClick={() => setDeleteOpen(true)}
        >
          Delete
        </Button>
      </div>
      <CancelEventDialog
        id={id}
        title={title}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
      />
      <DeleteEventDialog
        id={id}
        title={title}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
