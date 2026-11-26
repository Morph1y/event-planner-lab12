import { getApi } from "../api/httpClient.ts";
import {
  apiEventPageSchema,
  apiEventSchema,
  parseApiResponse,
} from "../api/linkedEventsSchemas.ts";
import { toEvent } from "../api/mappers.ts";
import { normalizeEventFilters } from "../schemas/eventFilters.ts";
import type { EventFilters, EventPage } from "../types/events.ts";

const PAGE_SIZE = 12;
const sortFields = {
  soonest: "start_time",
  latest: "-start_time",
  title: "name",
};

export const eventRepository = {
  async getAll(
    filters: Partial<EventFilters> = {},
    signal?: AbortSignal,
  ): Promise<EventPage> {
    const normalized = normalizeEventFilters(filters);
    const params = new URLSearchParams({
      page: String(normalized.page),
      page_size: String(PAGE_SIZE),
      start: "now",
      super_event_type: "none",
      include: "location,keywords",
      sort: sortFields[normalized.sort],
    });

    if (normalized.search) params.set("text", normalized.search);
    if (normalized.price !== "all")
      params.set("is_free", String(normalized.price === "free"));
    if (normalized.venueId) params.set("location", normalized.venueId);

    const response = parseApiResponse(
      apiEventPageSchema,
      await getApi("event/", params, signal),
    );
    return {
      items: response.data.map(toEvent),
      count: response.meta.count,
      page: normalized.page,
      pageSize: PAGE_SIZE,
      hasNextPage: response.meta.next !== null,
    };
  },

  async getById(id: string, signal?: AbortSignal) {
    if (!id.trim()) throw new Error("Не вказано подію.");
    const params = new URLSearchParams({ include: "location,keywords" });
    const response = await getApi(
      `event/${encodeURIComponent(id)}/`,
      params,
      signal,
    );
    return toEvent(parseApiResponse(apiEventSchema, response));
  },
};
