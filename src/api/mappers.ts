import { decode } from "html-entities";
import type { ApiEvent, ApiVenue } from "./linkedEventsSchemas.ts";
import type { Event, EventImage, Venue } from "../types/events.ts";

type Translations = Record<string, string | null> | null | undefined;

function localized(value: Translations): string {
  if (!value) return "";
  const options = [value.en, value.fi, value.sv, ...Object.values(value)];
  return options.find((text) => text?.trim())?.trim() ?? "";
}

function plainText(value: string): string {
  return decode(
    value
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
      .replace(/<\/(p|div|li|h[1-6])\s*>|<br\s*\/?>/gi, "\n")
      .replace(/<[^>]*>/g, ""),
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}

function externalUrl(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function dateTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || date.getUTCFullYear() < 1900)
    return null;
  return date.toISOString();
}

function referenceId(value: ApiEvent["location"]): string | null {
  if (value?.id) return value.id;
  const url = externalUrl(value?.["@id"]);
  if (!url) return null;
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    const index = parts.indexOf("place");
    return index >= 0 && parts[index + 1]
      ? decodeURIComponent(parts[index + 1])
      : null;
  } catch {
    return null;
  }
}

function eventImage(value: ApiEvent): EventImage | null {
  const image = value.images?.find((item) => externalUrl(item.url));
  if (!image) return null;
  return {
    url: externalUrl(image.url)!,
    alt: image.alt_text?.trim() || localized(value.name),
    photographer: image.photographer_name?.trim() || null,
    license: image.license ?? null,
    licenseUrl: externalUrl(image.license_url),
  };
}

export function toEvent(value: ApiEvent): Event {
  const offers = value.offers ?? [];
  const knownPrices = offers
    .map((offer) => offer.is_free)
    .filter((flag) => typeof flag === "boolean");
  const isFree = knownPrices.length ? knownPrices.includes(true) : null;
  const statuses: Record<ApiEvent["event_status"], Event["status"]> = {
    EventScheduled: "scheduled",
    EventCancelled: "cancelled",
    EventRescheduled: "rescheduled",
    EventPostponed: "postponed",
  };

  return {
    id: value.id,
    title: localized(value.name) || "Подія без назви",
    description: plainText(localized(value.description)),
    summary: plainText(localized(value.short_description)),
    startsAt: dateTime(value.start_time),
    endsAt: dateTime(value.end_time),
    venueId: referenceId(value.location),
    venueName: localized(value.location?.name) || null,
    image: eventImage(value),
    keywords: [
      ...new Set(
        (value.keywords ?? [])
          .map((keyword) => localized(keyword.name))
          .filter(Boolean),
      ),
    ],
    isFree,
    price: offers.map((offer) => localized(offer.price)).find(Boolean) ?? null,
    website:
      externalUrl(localized(value.info_url)) ??
      offers
        .map((offer) => externalUrl(localized(offer.info_url)))
        .find(Boolean) ??
      null,
    status: statuses[value.event_status],
  };
}

export function toVenue(value: ApiVenue): Venue {
  const [longitude, latitude] = value.position?.coordinates ?? [];
  const validCoordinates =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180;

  return {
    id: value.id,
    name: localized(value.name) || "Локація без назви",
    description: plainText(localized(value.description)),
    address: localized(value.street_address),
    city: localized(value.address_locality),
    website: externalUrl(localized(value.info_url)),
    phone: localized(value.telephone) || null,
    email: value.email?.trim() || null,
    coordinates: validCoordinates ? { latitude, longitude } : null,
  };
}
