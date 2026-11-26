import assert from "node:assert/strict";
import { test } from "node:test";
import {
  eventFiltersFromSearch,
  eventFiltersToSearch,
} from "../src/schemas/eventFilters.ts";
import {
  eventPriceLabel,
  eventTimeLabel,
} from "../src/utils/eventPresentation.ts";
import { apiEventSchema } from "../src/api/linkedEventsSchemas.ts";
import { toEvent } from "../src/api/mappers.ts";
import { searchSchema } from "../src/schemas/eventSearch.ts";

test("restores valid filters from URL and round-trips encoded searches", () => {
  const filters = {
    search: "music & art",
    page: 3,
    sort: "title" as const,
    price: "free" as const,
    venueId: "tprek:123",
  };
  assert.deepEqual(
    eventFiltersFromSearch(eventFiltersToSearch(filters)),
    filters,
  );
  assert.equal(eventFiltersToSearch({}).toString(), "");
});

test("falls back for invalid URL fields while preserving valid filters", () => {
  const filters = eventFiltersFromSearch(
    new URLSearchParams("page=-3&sort=unknown&price=free&q=museum&venue="),
  );
  assert.equal(filters.page, 1);
  assert.equal(filters.sort, "soonest");
  assert.equal(filters.price, "free");
  assert.equal(filters.search, "museum");
  assert.equal(filters.venueId, undefined);
  assert.equal(eventFiltersFromSearch(new URLSearchParams("page=1.5")).page, 1);
  assert.equal(
    eventFiltersFromSearch(new URLSearchParams("page=9007199254740992")).page,
    1,
  );
});

test("validates the search draft before it becomes a URL filter", () => {
  assert.deepEqual(searchSchema.parse({ search: " music " }), {
    search: "music",
  });
  assert.equal(
    searchSchema.safeParse({ search: "a".repeat(201) }).success,
    false,
  );
});

test("labels long-running events as ongoing and keeps unknown pricing distinct", () => {
  const event = toEvent(
    apiEventSchema.parse({
      id: "museum:permanent",
      start_time: "2001-01-01T09:00:00Z",
      end_time: "2050-12-31T17:00:00Z",
    }),
  );
  const label = eventTimeLabel(event, Date.parse("2026-11-26T12:00:00Z"));
  assert.match(label, /^Триває до /);
  assert.match(label, /2050/);
  assert.equal(eventPriceLabel(event), "Ціну уточнює організатор");
  assert.equal(
    eventPriceLabel({ ...event, isFree: true, price: "12 €" }),
    "Безкоштовно",
  );
  assert.equal(eventPriceLabel({ ...event, isFree: false }), "Платна подія");
});

test("shows event times in Helsinki regardless of the visitor timezone", () => {
  const event = toEvent(
    apiEventSchema.parse({
      id: "event:timed",
      start_time: "2026-12-01T15:00:00Z",
    }),
  );
  assert.match(
    eventTimeLabel(event, Date.parse("2026-11-26T12:00:00Z")),
    /17:00/,
  );
  assert.equal(
    eventTimeLabel({ ...event, startsAt: null }),
    "Дату уточнює організатор",
  );
});
