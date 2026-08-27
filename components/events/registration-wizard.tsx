"use client";

import { useActionState, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Upload } from "lucide-react";

import { submitRegistration, type RegisterState } from "@/app/actions/register";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatPeso, kitItems } from "@/lib/format";
import type { CafeSettings, EventDetail } from "@/lib/types";
import { cn } from "@/lib/utils";

const steps = ["Details", "Drink", "Kit", "Pay"];

const initial: RegisterState = { ok: false, message: "" };

export function RegistrationWizard({
  event,
  settings,
}: {
  event: EventDetail;
  settings: CafeSettings;
}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consumableId, setConsumableId] = useState(
    event.consumable_options[0]?.id ?? "",
  );
  const defaultKit =
    event.freebie_kits.find((kit) => kit.is_default) ?? event.freebie_kits[0];
  const [kitId, setKitId] = useState(defaultKit?.id ?? "");
  const [fileName, setFileName] = useState("");
  const [state, action, pending] = useActionState(submitRegistration, initial);

  const consumable = event.consumable_options.find((item) => item.id === consumableId);
  const kit = event.freebie_kits.find((item) => item.id === kitId);
  const total = Number(kit?.price ?? 0) + Number(consumable?.extra_price ?? 0);
  const soldOut = (event.remaining_slots ?? 0) <= 0;

  const canContinue = useMemo(() => {
    if (step === 0) return name.trim().length >= 2 && email.includes("@");
    if (step === 1) return event.consumable_options.length === 0 || Boolean(consumableId);
    if (step === 2) return Boolean(kitId);
    return Boolean(fileName);
  }, [step, name, email, consumableId, kitId, fileName, event.consumable_options.length]);

  if (soldOut) {
    return (
      <div className="glass-card rounded-3xl p-6 text-sm text-muted-foreground">
        This event is fully booked. Check Lookup if you already registered, or
        browse other nights.
      </div>
    );
  }

  return (
    <form action={action} className="glass-card rounded-3xl p-5 sm:p-7">
      <input type="hidden" name="event_id" value={event.id} />
      <input type="hidden" name="attendee_name" value={name} />
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="phone" value={phone} />
      <input type="hidden" name="consumable_id" value={consumableId} />
      <input type="hidden" name="kit_id" value={kitId} />

      <div className="mb-6 grid grid-cols-4 gap-2">
        {steps.map((label, index) => (
          <div key={label} className="text-center">
            <div
              className={cn(
                "mx-auto mb-1 flex size-7 items-center justify-center rounded-full text-xs",
                index <= step ? "bg-primary text-primary-foreground" : "bg-white/10",
              )}
            >
              {index < step ? <Check className="size-3.5" /> : index + 1}
            </div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
          </div>
        ))}
      </div>

      {step === 0 ? (
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="attendee_name_ui">Attendee name</Label>
            <Input
              id="attendee_name_ui"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Name on the cup"
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email_ui">Email</Label>
            <Input
              id="email_ui"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="We'll send your WAV-XXXX code here"
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="phone_ui">Phone (optional)</Label>
            <Input
              id="phone_ui"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="GCash / contact number"
            />
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <RadioGroup
          value={consumableId}
          onValueChange={(value) => {
            if (value) setConsumableId(value);
          }}
        >
          {event.consumable_options.map((option) => (
            <label
              key={option.id}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3",
                consumableId === option.id && "border-primary/50 bg-primary/10",
              )}
            >
              <span className="flex items-center gap-3">
                <RadioGroupItem value={option.id} />
                <span>
                  <span className="block font-medium">{option.name}</span>
                  <span className="text-xs uppercase text-muted-foreground">
                    {option.category}
                  </span>
                </span>
              </span>
              <span className="text-sm text-primary">
                {Number(option.extra_price) === 0
                  ? "Included"
                  : `+ ${formatPeso(option.extra_price)}`}
              </span>
            </label>
          ))}
        </RadioGroup>
      ) : null}

      {step === 2 ? (
        <RadioGroup
          value={kitId}
          onValueChange={(value) => {
            if (value) setKitId(value);
          }}
        >
          {event.freebie_kits.map((option) => (
            <label
              key={option.id}
              className={cn(
                "flex cursor-pointer flex-col gap-1 rounded-2xl border border-white/10 bg-white/5 p-3",
                kitId === option.id && "border-primary/50 bg-primary/10",
              )}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-3">
                  <RadioGroupItem value={option.id} />
                  <span className="font-medium">{option.name}</span>
                </span>
                <span className="text-sm text-primary">{formatPeso(option.price)}</span>
              </span>
              <span className="pl-7 text-xs text-muted-foreground">
                {option.description}
              </span>
              <span className="pl-7 text-xs text-cream/80">
                {kitItems(option.items).join(" · ")}
              </span>
            </label>
          ))}
        </RadioGroup>
      ) : null}

      {step === 3 ? (
        <div className="grid gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
            <p className="font-medium">{name}</p>
            <p className="text-muted-foreground">{email}</p>
            <p className="mt-3">
              {consumable?.name} · {kit?.name}
            </p>
            <p className="mt-1 font-heading text-2xl text-primary">
              {formatPeso(total)}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <PaymentCard
              label={settings.ewallet_name ?? "GCash"}
              number={settings.ewallet_number}
              qr={settings.gcash_qr_url}
            />
            <PaymentCard
              label="Maya"
              number={settings.ewallet_number}
              qr={settings.maya_qr_url}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {settings.bank_name} · {settings.bank_account_name} ·{" "}
            {settings.bank_account_number}
          </p>
          <div className="grid gap-1.5">
            <Label htmlFor="payment_proof">Receipt screenshot</Label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-8 text-sm">
              <Upload className="mb-2 size-5 text-primary" />
              {fileName || "JPG, PNG, or WebP · max 5MB"}
              <input
                id="payment_proof"
                name="payment_proof"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                className="sr-only"
                required
                onChange={(event) =>
                  setFileName(event.target.files?.[0]?.name ?? "")
                }
              />
            </label>
          </div>
        </div>
      ) : null}

      {state.message ? (
        <p className="mt-4 text-sm text-destructive">{state.message}</p>
      ) : null}

      <div className="mt-6 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          disabled={step === 0 || pending}
          onClick={() => setStep((value) => Math.max(0, value - 1))}
        >
          <ChevronLeft />
          Back
        </Button>
        {step < 3 ? (
          <Button
            type="button"
            className="rounded-full"
            disabled={!canContinue}
            onClick={() => setStep((value) => value + 1)}
          >
            Continue
            <ChevronRight data-icon="inline-end" />
          </Button>
        ) : (
          <Button type="submit" className="rounded-full" disabled={pending || !canContinue}>
            {pending ? "Submitting..." : "Submit registration"}
          </Button>
        )}
      </div>
    </form>
  );
}

function PaymentCard({
  label,
  number,
  qr,
}: {
  label: string;
  number: string | null;
  qr: string | null;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      {qr ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qr} alt={`${label} QR`} className="mx-auto my-3 h-32 w-32 rounded-xl bg-white p-2" />
      ) : null}
      <p className="text-center text-sm">{number}</p>
    </div>
  );
}
