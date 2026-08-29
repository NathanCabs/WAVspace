"use client";

import { useState, useTransition } from "react";

import {
  deleteRejectedRegistration,
  getSignedReceiptUrl,
  updateRegistrationStatus,
} from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
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
import { formatPeso } from "@/lib/format";
import { cn } from "@/lib/utils";

export type AdminRegistration = {
  id: string;
  attendee_name: string;
  email: string;
  reference_code: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  total_amount: number;
  payment_proof_url: string | null;
  created_at: string;
  events: { title: string } | null;
  freebie_kits: { name: string } | null;
};

export function RegistrationTable({
  registrations,
}: {
  registrations: AdminRegistration[];
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function openReceipt(path: string) {
    start(async () => {
      const url = await getSignedReceiptUrl(path);
      setPreview(url);
    });
  }

  return (
    <>
      <div className="glass-card overflow-hidden rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Attendee</th>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-border/70 transition-colors hover:bg-muted/35"
                >
                  <td className="px-4 py-3.5 font-medium tabular-nums">
                    {row.reference_code}
                  </td>
                  <td className="px-4 py-3.5">
                    <div>{row.attendee_name}</div>
                    <div className="text-xs text-muted-foreground">{row.email}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    {row.events?.title}
                    <div className="text-xs text-muted-foreground">
                      {row.freebie_kits?.name}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 tabular-nums">
                    {formatPeso(row.total_amount)}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge
                      className={cn(
                        row.status === "APPROVED" &&
                          "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200",
                        row.status === "PENDING" && "bg-primary/15 text-primary",
                        row.status === "REJECTED" &&
                          "bg-destructive/15 text-destructive",
                      )}
                    >
                      {row.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {row.payment_proof_url ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          disabled={pending}
                          onClick={() => openReceipt(row.payment_proof_url!)}
                        >
                          Receipt
                        </Button>
                      ) : null}
                      {row.status === "PENDING" ? (
                        <>
                          <form action={updateRegistrationStatus}>
                            <input type="hidden" name="id" value={row.id} />
                            <input type="hidden" name="status" value="APPROVED" />
                            <Button size="sm" type="submit" className="rounded-full">
                              Approve
                            </Button>
                          </form>
                          <RejectButton id={row.id} code={row.reference_code} />
                        </>
                      ) : null}
                      {row.status === "REJECTED" ? (
                        <DeleteRejectedButton
                          id={row.id}
                          code={row.reference_code}
                        />
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Dialog open={Boolean(preview)} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment receipt</DialogTitle>
          </DialogHeader>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Payment receipt" className="rounded-xl" />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function RejectButton({ id, code }: { id: string; code: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="rounded-full text-destructive"
        onClick={() => setOpen(true)}
      >
        Reject
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Reject {code}?</DialogTitle>
            <DialogDescription>
              This releases the slot. Add a short reason — it is emailed to the
              guest.
            </DialogDescription>
          </DialogHeader>
          <form action={updateRegistrationStatus} className="grid gap-4">
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value="REJECTED" />
            <div className="grid gap-1.5">
              <Label htmlFor={`reject-reason-${id}`}>Reason</Label>
              <Input
                id={`reject-reason-${id}`}
                name="admin_notes"
                required
                placeholder="Unreadable screenshot, wrong amount…"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Keep pending
              </Button>
              <Button type="submit" variant="destructive">
                Reject registration
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DeleteRejectedButton({ id, code }: { id: string; code: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="destructive"
        className="rounded-full"
        onClick={() => setOpen(true)}
      >
        Delete
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Delete this registration?</DialogTitle>
            <DialogDescription>
              This removes {code} for good, including the receipt file. The code
              will no longer work in lookup.
            </DialogDescription>
          </DialogHeader>
          <form action={deleteRejectedRegistration}>
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
                Delete registration
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
