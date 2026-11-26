import type { Event } from "../types/events";

const dateFormat = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Helsinki",
});

const dateTimeFormat = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Helsinki",
});

export function eventTimeLabel(event: Event, now = Date.now()): string {
  const start = event.startsAt ? new Date(event.startsAt) : null;
  const end = event.endsAt ? new Date(event.endsAt) : null;
  if (start && end && start.getTime() <= now && end.getTime() >= now) {
    return `Триває до ${dateFormat.format(end)}`;
  }
  if (start) return dateTimeFormat.format(start);
  if (end) return `До ${dateFormat.format(end)}`;
  return "Дату уточнює організатор";
}

export function eventPriceLabel(event: Event): string {
  if (event.isFree === true) return "Безкоштовно";
  return (
    event.price ||
    (event.isFree === false ? "Платна подія" : "Ціну уточнює організатор")
  );
}

export const eventStatusLabels = {
  cancelled: "Подію скасовано",
  rescheduled: "Час події змінено",
  postponed: "Подію відкладено",
};
