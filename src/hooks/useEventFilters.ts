import { useSearchParams } from "react-router";
import {
  eventFiltersFromSearch,
  eventFiltersToSearch,
} from "../schemas/eventFilters";
import type { EventFilters } from "../types/events";

export function useEventFilters() {
  const [params, setParams] = useSearchParams();
  const filters = eventFiltersFromSearch(params);

  function updateFilters(changes: Partial<EventFilters>) {
    setParams(
      eventFiltersToSearch({ ...filters, ...changes, page: changes.page ?? 1 }),
    );
  }

  return {
    filters,
    updateFilters,
    resetFilters: () => setParams(new URLSearchParams()),
  };
}
