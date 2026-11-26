import { queryOptions } from "@tanstack/react-query";
import { eventRepository } from "../repositories/eventRepository.ts";
import { normalizeEventFilters } from "../schemas/eventFilters.ts";
import type { EventFilters } from "../types/events.ts";

export const eventQueries = {
  list(filters: Partial<EventFilters> = {}) {
    const normalized = normalizeEventFilters(filters);
    return queryOptions({
      queryKey: ["events", "list", normalized] as const,
      queryFn: ({ signal }) => eventRepository.getAll(normalized, signal),
    });
  },

  detail(id: string) {
    return queryOptions({
      queryKey: ["events", "detail", id] as const,
      queryFn: ({ signal }) => eventRepository.getById(id, signal),
      enabled: Boolean(id.trim()),
    });
  },
};
