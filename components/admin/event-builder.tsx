"use client";

import { useState } from "react";

import { saveEvent } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EVENT_CATEGORIES } from "@/lib/constants";
import type { ConsumableOption, Event, FreebieKit } from "@/lib/types";
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
  event?: Event;
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
  const [cafeHosted, setCafeHosted] = useState(event?.is_cafe_hosted ?? true);
  const [published, setPublished] = useState(event?.is_published ?? true);

  return (
    <form action={saveEvent} className="grid gap-6">
      {event?.id ? <input type="hidden" name="id" value={event.id} /> : null}
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

      <section className="glass-card grid gap-3 rounded-3xl p-5">
        <h2 className="font-heading text-lg">Event details</h2>
        <div className="grid gap-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required defaultValue={event?.title} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            required
            defaultValue={event?.description ?? ""}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label htmlFor="event_date">Date</Label>
            <Input
              id="event_date"
              name="event_date"
              type="date"
              required
              defaultValue={event?.event_date}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="start_time">Start</Label>
            <Input
              id="start_time"
              name="start_time"
              type="time"
              required
              defaultValue={event?.start_time?.slice(0, 5)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="end_time">End</Label>
            <Input
              id="end_time"
              name="end_time"
              type="time"
              required
              defaultValue={event?.end_time?.slice(0, 5)}
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label htmlFor="max_slots">Max slots</Label>
            <Input
              id="max_slots"
              name="max_slots"
              type="number"
              min={1}
              required
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
              defaultValue={event?.ticket_price ?? 0}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              defaultValue={event?.category ?? "cse"}
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              {EVENT_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="banner_url">Banner URL</Label>
          <Input
            id="banner_url"
            name="banner_url"
            defaultValue={event?.banner_url ?? ""}
            placeholder="https://..."
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={cafeHosted}
            onCheckedChange={(value) => setCafeHosted(Boolean(value))}
          />
          Cafe hosted
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={published}
            onCheckedChange={(value) => setPublished(Boolean(value))}
          />
          Published
        </label>
      </section>

      <section className="glass-card grid gap-3 rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg">Consumables</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
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
        {consumableDrafts.map((item, index) => (
          <div key={index} className="grid gap-2 sm:grid-cols-[1fr_120px_100px_auto]">
            <Input
              placeholder="Iced Latte"
              value={item.name}
              onChange={(event) =>
                setConsumableDrafts((current) =>
                  current.map((row, rowIndex) =>
                    rowIndex === index ? { ...row, name: event.target.value } : row,
                  ),
                )
              }
            />
            <select
              value={item.category}
              onChange={(event) =>
                setConsumableDrafts((current) =>
                  current.map((row, rowIndex) =>
                    rowIndex === index
                      ? { ...row, category: event.target.value as "drink" | "food" }
                      : row,
                  ),
                )
              }
              className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
            >
              <option value="drink">Drink</option>
              <option value="food">Food</option>
            </select>
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
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setConsumableDrafts((current) => current.filter((_, rowIndex) => rowIndex !== index))
              }
            >
              Remove
            </Button>
          </div>
        ))}
      </section>

      <section className="glass-card grid gap-4 rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg">Freebie kits</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setKitDrafts((current) => [
                ...current,
                {
                  name: "",
                  description: "",
                  price: "0",
                  items: "",
                  is_default: false,
                },
              ])
            }
          >
            Add kit
          </Button>
        </div>
        {kitDrafts.map((kit, index) => (
          <div key={index} className="grid gap-2 rounded-2xl border border-white/10 p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                placeholder="Standard Kit"
                value={kit.name}
                onChange={(event) =>
                  setKitDrafts((current) =>
                    current.map((row, rowIndex) =>
                      rowIndex === index ? { ...row, name: event.target.value } : row,
                    ),
                  )
                }
              />
              <Input
                type="number"
                min={0}
                value={kit.price}
                onChange={(event) =>
                  setKitDrafts((current) =>
                    current.map((row, rowIndex) =>
                      rowIndex === index ? { ...row, price: event.target.value } : row,
                    ),
                  )
                }
              />
            </div>
            <Input
              placeholder="Short description"
              value={kit.description}
              onChange={(event) =>
                setKitDrafts((current) =>
                  current.map((row, rowIndex) =>
                    rowIndex === index ? { ...row, description: event.target.value } : row,
                  ),
                )
              }
            />
            <Textarea
              placeholder={"One item per line\nCupholder\nPhotocard Set"}
              value={kit.items}
              onChange={(event) =>
                setKitDrafts((current) =>
                  current.map((row, rowIndex) =>
                    rowIndex === index ? { ...row, items: event.target.value } : row,
                  ),
                )
              }
            />
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
                setKitDrafts((current) => current.filter((_, rowIndex) => rowIndex !== index))
              }
            >
              Remove kit
            </Button>
          </div>
        ))}
      </section>

      <Button type="submit" className="w-fit rounded-full">
        Save event
      </Button>
    </form>
  );
}
