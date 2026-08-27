"use client";

import { useState, useTransition } from "react";

import { getSignedReceiptUrl, updateRegistrationStatus } from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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
      <div className="overflow-x-auto rounded-3xl border border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-white/5 text-muted-foreground">
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
              <tr key={row.id} className="border-t border-white/10">
                <td className="px-4 py-3 font-medium">{row.reference_code}</td>
                <td className="px-4 py-3">
                  <div>{row.attendee_name}</div>
                  <div className="text-xs text-muted-foreground">{row.email}</div>
                </td>
                <td className="px-4 py-3">
                  {row.events?.title}
                  <div className="text-xs text-muted-foreground">
                    {row.freebie_kits?.name}
                  </div>
                </td>
                <td className="px-4 py-3">{formatPeso(row.total_amount)}</td>
                <td className="px-4 py-3">
                  <Badge
                    className={cn(
                      row.status === "APPROVED" && "bg-emerald-500/20 text-emerald-200",
                      row.status === "PENDING" && "bg-primary/20 text-primary",
                      row.status === "REJECTED" && "bg-destructive/20 text-destructive",
                    )}
                  >
                    {row.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {row.payment_proof_url ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
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
                          <Button size="sm" type="submit">
                            Approve
                          </Button>
                        </form>
                        <form action={updateRegistrationStatus} className="flex gap-2">
                          <input type="hidden" name="id" value={row.id} />
                          <input type="hidden" name="status" value="REJECTED" />
                          <Textarea
                            name="admin_notes"
                            placeholder="Reason"
                            className="h-8 min-h-8 w-28"
                          />
                          <Button size="sm" variant="destructive" type="submit">
                            Reject
                          </Button>
                        </form>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
