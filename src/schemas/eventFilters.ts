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
