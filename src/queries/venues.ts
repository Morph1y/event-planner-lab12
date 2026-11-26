import { queryOptions } from "@tanstack/react-query";
import { venueRepository } from "../repositories/venueRepository.ts";

export const venueQueries = {
  detail(id: string) {
    return queryOptions({
      queryKey: ["venues", "detail", id] as const,
      queryFn: ({ signal }) => venueRepository.getById(id, signal),
      enabled: Boolean(id.trim()),
    });
  },
};
