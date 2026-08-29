"use client";

import { useState } from "react";

import { resetOperationalData } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetDataForm() {
  const [confirm, setConfirm] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const enabled = confirm.trim() === "RESET" && acknowledged;

  return (
    <section className="grid gap-3 rounded-3xl border border-destructive/25 bg-destructive/5 p-5">
      <div>
        <p className="text-[11px] tracking-[0.16em] text-destructive/80 uppercase">
          Danger zone
        </p>
        <h2 className="mt-1 font-heading text-lg text-destructive">Reset site data</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Wipe events, registrations, venue requests, and uploaded receipts so
        the public site is empty. Cafe payment details and this admin account
        stay. This cannot be undone.
      </p>
      <form action={resetOperationalData} className="grid gap-3">
        {acknowledged ? (
          <input type="hidden" name="acknowledged" value="on" />
        ) : null}
        <div className="grid gap-1.5">
          <Label htmlFor="confirm-reset">Type RESET to confirm</Label>
          <Input
            id="confirm-reset"
            name="confirm"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            placeholder="RESET"
            autoComplete="off"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={acknowledged}
            onCheckedChange={(value) => setAcknowledged(Boolean(value))}
          />
          I understand this cannot be undone
        </label>
        <Button
          type="submit"
          variant="destructive"
          className="w-fit rounded-full"
          disabled={!enabled}
        >
          Reset all site data
        </Button>
      </form>
    </section>
  );
}
