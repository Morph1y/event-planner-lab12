import { getApi } from "../api/httpClient.ts";
import {
  apiVenueSchema,
  parseApiResponse,
} from "../api/linkedEventsSchemas.ts";
import { toVenue } from "../api/mappers.ts";

export const venueRepository = {
  async getById(id: string, signal?: AbortSignal) {
    if (!id.trim()) throw new Error("Не вказано локацію.");
    const response = await getApi(
      `place/${encodeURIComponent(id)}/`,
      undefined,
      signal,
    );
    return toVenue(parseApiResponse(apiVenueSchema, response));
  },
};
