const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatPeso(amount: number | string | null | undefined) {
  const value = Math.round(Number(amount ?? 0));
  const digits = Math.abs(value).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${value < 0 ? "-" : ""}₱${grouped}`;
}

export function formatEventDate(date: string) {
  const parts = formatEventDayParts(date);
  return `${parts.weekday}, ${parts.month} ${parts.day}, ${parts.year}`;
}

export function formatEventDayParts(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const utc = new Date(Date.UTC(year, (month || 1) - 1, day || 1));
  return {
    weekday: WEEKDAYS[utc.getUTCDay()],
    month: MONTHS[utc.getUTCMonth()],
    day: utc.getUTCDate(),
    year: utc.getUTCFullYear(),
  };
}

export function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map((part) => Number(part) || 0);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function formatEventWindow(date: string, start: string, end: string) {
  return `${formatEventDate(date)} · ${formatTime(start)}–${formatTime(end)}`;
}

export function kitItems(items: unknown): string[] {
  if (Array.isArray(items)) {
    return items.filter((item): item is string => typeof item === "string");
  }
  return [];
}
