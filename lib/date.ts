/**
 * Date and time formatting utilities strictly locked to Asia/Dhaka (Bangladesh) timezone.
 */

export function formatBangladeshDateTime(
  dateInput: string | Date | number | null | undefined
): string {
  if (!dateInput) return "N/A";
  const date = typeof dateInput === "object" ? dateInput : new Date(dateInput);

  if (isNaN(date.getTime())) return "N/A";

  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  return new Intl.DateTimeFormat("en-US", options).format(date);
}

export function formatBangladeshDate(
  dateInput: string | Date | number | null | undefined
): string {
  if (!dateInput) return "N/A";
  const date = typeof dateInput === "object" ? dateInput : new Date(dateInput);

  if (isNaN(date.getTime())) return "N/A";

  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return new Intl.DateTimeFormat("en-US", options).format(date);
}
