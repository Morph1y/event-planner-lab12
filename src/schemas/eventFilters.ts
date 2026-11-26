import { z } from "zod";
import type { EventFilters } from "../types/events.ts";

const eventFiltersSchema = z.object({
  search: z.string().trim().max(200).default(""),
  page: z.number().int().positive().default(1),
  sort: z.enum(["soonest", "latest", "title"]).default("soonest"),
  price: z.enum(["all", "free", "paid"]).default("all"),
  venueId: z.string().trim().min(1).optional(),
});

export function normalizeEventFilters(
  filters: Partial<EventFilters> = {},
): EventFilters {
  return eventFiltersSchema.parse(filters);
}

const eventUrlSchema = z.object({
  q: eventFiltersSchema.shape.search.catch(""),
  page: z.coerce.number().int().positive().catch(1),
  sort: eventFiltersSchema.shape.sort.catch("soonest"),
  price: eventFiltersSchema.shape.price.catch("all"),
  venue: eventFiltersSchema.shape.venueId.catch(undefined),
});

export function eventFiltersFromSearch(params: URLSearchParams): EventFilters {
  const value = eventUrlSchema.parse(Object.fromEntries(params));
  return {
    search: value.q,
    page: value.page,
    sort: value.sort,
    price: value.price,
    venueId: value.venue,
  };
}

export function eventFiltersToSearch(
  filters: Partial<EventFilters>,
): URLSearchParams {
  const value = normalizeEventFilters(filters);
  const params = new URLSearchParams();
  if (value.search) params.set("q", value.search);
  if (value.page !== 1) params.set("page", String(value.page));
  if (value.sort !== "soonest") params.set("sort", value.sort);
  if (value.price !== "all") params.set("price", value.price);
  if (value.venueId) params.set("venue", value.venueId);
  return params;
}
