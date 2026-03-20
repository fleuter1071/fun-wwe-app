export function formatDate(dateStr) {
  if (!dateStr) return "--";
  const date = new Date(`${dateStr}T00:00:00`);

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function formatTime(timeStr) {
  if (!timeStr || !timeStr.includes(":")) return timeStr || "--";

  const [hourRaw, minute] = timeStr.split(":");
  const hourNumber = Number(hourRaw);
  if (Number.isNaN(hourNumber)) return timeStr;

  const suffix = hourNumber >= 12 ? "PM" : "AM";
  const hour12 = hourNumber % 12 || 12;
  return `${hour12}:${minute} ${suffix}`;
}
