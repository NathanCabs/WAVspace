"use client";

import { useEffect, useState } from "react";
import { Upload } from "lucide-react";

import { saveEvent } from "@/app/actions/admin";
import { CalendarDatePicker } from "@/components/admin/calendar-date-picker";
import { TimeClockPicker } from "@/components/admin/time-clock-picker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EVENT_CATEGORIES } from "@/lib/constants";
import type { ConsumableOption, Event, EventCategory, FreebieKit } from "@/lib/types";
import { kitItems } from "@/lib/format";

type KitDraft = {
  name: string;
  description: string;
  price: string;
  items: string;
  is_default: boolean;
};

type ConsumableDraft = {
  name: string;
  category: "drink" | "food";
  extra_price: string;
};

export function EventBuilder({
  event,
  consumables,
  kits,
  error,
}: {
  event?: Partial<Event>;
  consumables?: ConsumableOption[];
  kits?: FreebieKit[];
  error?: string;
}) {
  const [consumableDrafts, setConsumableDrafts] = useState<ConsumableDraft[]>(
    consumables?.length
      ? consumables.map((item) => ({
          name: item.name,
          category: item.category,
          extra_price: String(item.extra_price),
        }))
      : event?.id
        ? []
        : [{ name: "Iced Latte", category: "drink", extra_price: "0" }],
  );
  const [kitDrafts, setKitDrafts] = useState<KitDraft[]>(
    kits?.length
      ? kits.map((item) => ({
          name: item.name,
          description: item.description ?? "",
          price: String(item.price),
          items: kitItems(item.items).join("\n"),
          is_default: item.is_default,
        }))
      : event?.id
        ? []
        : [
            {
              name: "Standard Kit",
              description: "Entry + drink + core merch",
              price: String(event?.ticket_price ?? 350),
              items: "Cupholder\nSticker Pack",
              is_default: true,
            },
          ],
  );
  const cancelled = Boolean(event?.cancelled_at);
  const [cafeHosted, setCafeHosted] = useState(event?.is_cafe_hosted ?? true);
  const [published, setPublished] = useState(
    cancelled ? false : (event?.is_published ?? true),
  );
  const [category, setCategory] = useState<EventCategory>(
    event?.category ?? "cse",
  );
  const [customCategory, setCustomCategory] = useState(
    event?.custom_category ?? "",
  );
  const [bannerPreview, setBannerPreview] = useState(event?.banner_url ?? "");
  const [bannerFileName, setBannerFileName] = useState("");

  useEffect(() => {
    if (!bannerPreview.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(bannerPreview);
  }, [bannerPreview]);

  return (
    <form action={saveEvent} className="grid gap-8">
      {event?.id ? <input type="hidden" name="id" value={event.id} /> : null}
      {event?.venue_request_id ? (
        <input
          type="hidden"
          name="venue_request_id"
          value={event.venue_request_id}
        />
      ) : null}
      <input type="hidden" name="category" value={category} />
      <input
        type="hidden"
        name="custom_category"
        value={category === "other" ? customCategory : ""}
      />
      <input type="hidden" name="kits" value={JSON.stringify(kitDrafts.map((kit) => ({
        ...kit,
        price: Number(kit.price || 0),
        items: kit.items.split("\n").map((line) => line.trim()).filter(Boolean),
      })))} />
      <input type="hidden" name="consumables" value={JSON.stringify(consumableDrafts.map((item) => ({
        ...item,
        extra_price: Number(item.extra_price || 0),
      })))} />
      {cafeHosted ? <input type="hidden" name="is_cafe_hosted" value="on" /> : null}
      {published ? <input type="hidden" name="is_published" value="on" /> : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <section className="glass-card grid gap-5 rounded-3xl p-4 sm:p-6">
        <div>
          <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            Listing
          </p>
          <h2 className="mt-1 font-heading text-lg">Event details</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Title, schedule, and how this night shows up on the public calendar.
          </p>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            required
            placeholder="Kkampakz Birthday CSE"
            defaultValue={event?.title}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="slug">URL slug</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={event?.slug ?? ""}
            placeholder="kkampakz-birthday-cse"
          />
          <p className="text-xs text-muted-foreground">
            Public link: /events/this-slug. Leave blank to generate from the
            title. Editing an existing event keeps the current slug unless you
            change it.
          </p>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={event?.description ?? ""}
            placeholder="Optional — polaroid walls, trade tables, what is included…"
            className="min-h-32 rounded-2xl px-3 py-2.5"
          />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="grid gap-1.5">
            <Label htmlFor="event_date">Date</Label>
            <CalendarDatePicker
              id="event_date"
              name="event_date"
              required
              defaultValue={event?.event_date}
              allowValue={event?.event_date}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="start_time">Start</Label>
            <TimeClockPicker
              id="start_time"
              name="start_time"
              required
              defaultValue={event?.start_time?.slice(0, 5) ?? "13:00"}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="end_time">End</Label>
            <TimeClockPicker
              id="end_time"
              name="end_time"
              required
              align="end"
              defaultValue={event?.end_time?.slice(0, 5) ?? "18:00"}
            />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="grid gap-1.5">
            <Label htmlFor="max_slots">Max slots</Label>
            <Input
              id="max_slots"
              name="max_slots"
              type="number"
              min={1}
              required
              placeholder="30"
              defaultValue={event?.max_slots ?? 30}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ticket_price">From price</Label>
            <Input
              id="ticket_price"
              name="ticket_price"
              type="number"
              min={0}
              required
              placeholder="0"
              defaultValue={event?.ticket_price ?? 0}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="category">Category</Label>
            <Select
              value={category}
              items={EVENT_CATEGORIES.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              onValueChange={(value) => {
                if (value) setCategory(value as EventCategory);
              }}
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start" alignItemWithTrigger={false}>
                {EVENT_CATEGORIES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {category === "other" ? (
          <div className="grid gap-1.5">
            <Label htmlFor="custom_category_ui">What kind of event?</Label>
            <Input
              id="custom_category_ui"
              value={customCategory}
              onChange={(change) => setCustomCategory(change.target.value)}
              placeholder="Birthday cafe, fansign, listening party…"
            />
          </div>
        ) : null}
        <div className="grid gap-1.5">
          <Label htmlFor="banner_file">Banner image</Label>
          {bannerPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bannerPreview}
              alt=""
              className="h-36 w-full rounded-2xl object-cover"
            />
          ) : null}
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-7 text-sm transition hover:bg-primary/10">
            <Upload className="mb-2 size-5 text-primary" />
            {bannerFileName || "Upload JPG, PNG, or WebP · max 5MB"}
            <input
              id="banner_file"
              name="banner_file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(change) => {
                const file = change.target.files?.[0];
                if (!file) {
                  setBannerFileName("");
                  setBannerPreview(event?.banner_url ?? "");
                  return;
                }
                setBannerFileName(file.name);
                setBannerPreview(URL.createObjectURL(file));
              }}
            />
          </label>
          <Label htmlFor="banner_url" className="mt-1 text-muted-foreground">
            Or paste a URL
          </Label>
          <Input
            id="banner_url"
            name="banner_url"
            defaultValue={event?.banner_url ?? ""}
            placeholder="https://..."
            onChange={(change) => {
              if (bannerFileName) return;
              setBannerPreview(change.target.value);
            }}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={cafeHosted}
              onCheckedChange={(value) => setCafeHosted(Boolean(value))}
            />
            Cafe hosted
          </label>
          {cancelled ? (
            <p className="text-sm text-destructive">
              This night is cancelled and stays off the public calendar. It cannot
              be republished.
            </p>
          ) : (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={published}
                onCheckedChange={(value) => setPublished(Boolean(value))}
              />
              Published
            </label>
          )}
        </div>
      </section>

      <section className="glass-card grid gap-4 rounded-3xl p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
              Optional
            </p>
            <h2 className="mt-1 font-heading text-lg">Consumables</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Optional drinks or food. Leave empty and attendees skip this step.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 rounded-full"
            onClick={() =>
              setConsumableDrafts((current) => [
                ...current,
                { name: "", category: "drink", extra_price: "0" },
              ])
            }
          >
            Add option
          </Button>
        </div>
        {consumableDrafts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
            No drink or food options. Attendees will skip this step at
            registration.
          </p>
        ) : (
          consumableDrafts.map((item, index) => (
            <div
              key={index}
              className="grid gap-2 rounded-2xl bg-background/45 p-3 ring-1 ring-foreground/8 sm:grid-cols-[1fr_120px_100px_auto] sm:items-end"
            >
              <div className="grid gap-1.5">
                <Label>Name</Label>
                <Input
                  placeholder="Iced Latte"
                  value={item.name}
                  onChange={(event) =>
                    setConsumableDrafts((current) =>
                      current.map((row, rowIndex) =>
                        rowIndex === index
                          ? { ...row, name: event.target.value }
                          : row,
                      ),
                    )
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Type</Label>
                <Select
                  value={item.category}
                  items={[
                    { value: "drink", label: "Drink" },
                    { value: "food", label: "Food" },
                  ]}
                  onValueChange={(value) => {
                    if (value !== "drink" && value !== "food") return;
                    setConsumableDrafts((current) =>
                      current.map((row, rowIndex) =>
                        rowIndex === index ? { ...row, category: value } : row,
                      ),
                    );
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start" alignItemWithTrigger={false}>
                    <SelectItem value="drink">Drink</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Extra ₱</Label>
                <Input
                  type="number"
                  min={0}
                  value={item.extra_price}
                  onChange={(event) =>
                    setConsumableDrafts((current) =>
                      current.map((row, rowIndex) =>
                        rowIndex === index
                          ? { ...row, extra_price: event.target.value }
                          : row,
                      ),
                    )
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setConsumableDrafts((current) =>
                    current.filter((_, rowIndex) => rowIndex !== index),
                  )
                }
              >
                Remove
              </Button>
            </div>
          ))
        )}
      </section>

      <section className="glass-card grid gap-4 rounded-3xl p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
              Optional
            </p>
            <h2 className="mt-1 font-heading text-lg">Freebie kits</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Optional merch bundles. Leave empty and attendees skip kit
              selection.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 rounded-full"
            onClick={() =>
              setKitDrafts((current) => [
                ...current,
                {
                  name: "",
                  description: "",
                  price: "0",
                  items: "",
                  is_default: current.length === 0,
                },
              ])
            }
          >
            Add kit
          </Button>
        </div>
        {kitDrafts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
            No kits. Attendees will skip this step and pay the from-price.
          </p>
        ) : (
          kitDrafts.map((kit, index) => (
            <div key={index} className="grid gap-3 rounded-2xl bg-background/45 p-4 ring-1 ring-foreground/8">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label>Kit name</Label>
                  <Input
                    placeholder="Standard Kit"
                    value={kit.name}
                    onChange={(event) =>
                      setKitDrafts((current) =>
                        current.map((row, rowIndex) =>
                          rowIndex === index
                            ? { ...row, name: event.target.value }
                            : row,
                        ),
                      )
                    }
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="350"
                    value={kit.price}
                    onChange={(event) =>
                      setKitDrafts((current) =>
                        current.map((row, rowIndex) =>
                          rowIndex === index
                            ? { ...row, price: event.target.value }
                            : row,
                        ),
                      )
                    }
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>Short description</Label>
                <Input
                  placeholder="Entry + drink + core merch"
                  value={kit.description}
                  onChange={(event) =>
                    setKitDrafts((current) =>
                      current.map((row, rowIndex) =>
                        rowIndex === index
                          ? { ...row, description: event.target.value }
                          : row,
                      ),
                    )
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Items</Label>
                <Textarea
                  placeholder={"One item per line\nCupholder\nPhotocard Set"}
                  value={kit.items}
                  onChange={(event) =>
                    setKitDrafts((current) =>
                      current.map((row, rowIndex) =>
                        rowIndex === index
                          ? { ...row, items: event.target.value }
                          : row,
                      ),
                    )
                  }
                  className="min-h-24 rounded-2xl"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={kit.is_default}
                    onCheckedChange={(value) =>
                      setKitDrafts((current) =>
                        current.map((row, rowIndex) => ({
                          ...row,
                          is_default: rowIndex === index ? Boolean(value) : false,
                        })),
                      )
                    }
                  />
                  Default kit
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-fit"
                  onClick={() =>
                    setKitDrafts((current) =>
                      current.filter((_, rowIndex) => rowIndex !== index),
                    )
                  }
                >
                  Remove kit
                </Button>
              </div>
            </div>
          ))
        )}
      </section>

      <div className="sticky bottom-4 z-20 flex justify-end">
        <Button type="submit" className="rounded-full px-6 shadow-lg shadow-primary/20">
          Save event
        </Button>
      </div>
    </form>
  );
}


