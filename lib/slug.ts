export function slugify(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);

  return slug || "event";
}

export function uniqueSlug(base: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  if (!used.has(base)) {
    return base;
  }

  let n = 2;
  while (used.has(`${base}-${n}`)) {
    n += 1;
  }

  return `${base}-${n}`;
}

export function eventPath(event: { slug?: string | null; id: string }): string {
  return `/events/${event.slug || event.id}`;
}
