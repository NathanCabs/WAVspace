import { siteConfig } from "@/lib/config/site-config";

function cafeTimeZone() {
  return siteConfig.timezone;
}

/** Calendar date in the cafe's timezone, as `YYYY-MM-DD`. */
export function localToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: cafeTimeZone(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function toDateValue(date: string) {
  return date.slice(0, 10);
}

export function isPastEventDate(date: string, today = localToday()) {
  return toDateValue(date) < today;
}

export function isDateOnOrAfterToday(date: string, today = localToday()) {
  return toDateValue(date) >= today;
}

/** Create requires today or later; edit may keep the existing past date unchanged. */
export function isAllowedEventDate(
  eventDate: string,
  existingDate?: string | null,
  today = localToday(),
) {
  const date = toDateValue(eventDate);
  if (date >= today) return true;
  return Boolean(existingDate && toDateValue(existingDate) === date);
}
