import assert from "node:assert/strict";
import { test } from "node:test";
import { HttpError, getApi } from "../src/api/httpClient.ts";
import {
  apiEventSchema,
  apiVenueSchema,
  parseApiResponse,
} from "../src/api/linkedEventsSchemas.ts";
import { toEvent, toVenue } from "../src/api/mappers.ts";
import { eventRepository } from "../src/repositories/eventRepository.ts";
import { venueRepository } from "../src/repositories/venueRepository.ts";
import { eventQueries } from "../src/queries/events.ts";
import { venueQueries } from "../src/queries/venues.ts";
import { queryClient } from "../src/app/queryClient.ts";
import { normalizeEventFilters } from "../src/schemas/eventFilters.ts";

function eventFixture() {
  return {
    id: "helsinki:example",
    name: { en: "An evening at the museum", fi: "Museoilta" },
    description: { en: "<p>Music &amp; art.</p><p>Everyone is welcome.</p>" },
    start_time: "2026-12-01T17:00:00+02:00",
    end_time: "2026-12-01T19:00:00+02:00",
    location: {
      "@id":
        "https://api.hel.fi/linkedevents/v1/place/tprek%3A123/?format=json",
      name: { en: "City Museum" },
    },
    keywords: [{ name: { en: "Music" } }, { name: { en: "Music" } }],
    offers: [{ is_free: true, price: null }],
    images: [
      {
        url: "https://example.org/event.jpg",
        alt_text: "An evening in the museum",
        photographer_name: "Museum photographer",
        license: "cc_by",
        license_url: "https://creativecommons.org/licenses/by/4.0/",
      },
    ],
    event_status: "EventScheduled",
    info_url: { en: "https://example.org/event" },
  };
}

test("maps multilingual content, HTML, dates and related venue identifiers", () => {
  const result = toEvent(apiEventSchema.parse(eventFixture()));
  assert.equal(result.title, "An evening at the museum");
  assert.equal(result.description, "Music & art.\nEveryone is welcome.");
  assert.equal(result.startsAt, "2026-12-01T15:00:00.000Z");
  assert.equal(result.venueId, "tprek:123");
  assert.equal(result.venueName, "City Museum");
  assert.equal(result.isFree, true);
  assert.deepEqual(result.keywords, ["Music"]);
  assert.equal(result.image?.photographer, "Museum photographer");
  assert.equal(result.image?.license, "cc_by");
  assert.equal(
    result.image?.licenseUrl,
    "https://creativecommons.org/licenses/by/4.0/",
  );
});

test("handles missing translations, unknown prices and invalid dates without inventing values", () => {
  const result = toEvent(
    apiEventSchema.parse({
      id: "event:incomplete",
      name: { en: " ", fi: "Suomenkielinen nimi" },
      start_time: "0026-09-23T11:20:11Z",
      end_time: "invalid",
      images: null,
      offers: [],
    }),
  );
  assert.equal(result.title, "Suomenkielinen nimi");
  assert.equal(result.startsAt, null);
  assert.equal(result.endsAt, null);
  assert.equal(result.isFree, null);
  assert.equal(result.price, null);
  assert.equal(result.venueId, null);
  assert.equal(result.image, null);
});

test("preserves cancelled status and removes unsafe external links", () => {
  const result = toEvent(
    apiEventSchema.parse({
      ...eventFixture(),
      event_status: "EventCancelled",
      description: { en: "<script>unwanted()</script><p>Safe text</p>" },
      info_url: { en: "javascript:unwanted()" },
      images: [{ url: "javascript:unwanted()" }],
      offers: [{ is_free: false, price: { en: "12 €" } }],
    }),
  );
  assert.equal(result.status, "cancelled");
  assert.equal(result.description, "Safe text");
  assert.equal(result.website, null);
  assert.equal(result.image, null);
  assert.equal(result.isFree, false);
  assert.equal(result.price, "12 €");
});

test("maps venue coordinates in longitude-latitude order and rejects out-of-range coordinates", () => {
  const input = {
    id: "tprek:123",
    name: { en: "City Museum" },
    street_address: { en: "Main Street 1" },
    address_locality: { en: "Helsinki" },
    position: { coordinates: [24.95, 60.17] },
  };
  const venue = toVenue(apiVenueSchema.parse(input));
  assert.deepEqual(venue.coordinates, { longitude: 24.95, latitude: 60.17 });
  assert.equal(venue.address, "Main Street 1");
  assert.equal(venue.city, "Helsinki");
  assert.equal(
    toVenue(
      apiVenueSchema.parse({
        ...input,
        position: { coordinates: [24.95, 100] },
      }),
    ).coordinates,
    null,
  );
});

test("rejects incompatible API responses with a readable message", () => {
  assert.throws(
    () => parseApiResponse(apiEventSchema, { name: { en: "Missing ID" } }),
    /Формат даних API змінився/,
  );
});

test("normalizes query keys and keeps pages, prices and venues isolated", () => {
  assert.deepEqual(
    eventQueries.list({ search: " music " }).queryKey,
    eventQueries.list({ search: "music" }).queryKey,
  );
  assert.notDeepEqual(
    eventQueries.list({ page: 1 }).queryKey,
    eventQueries.list({ page: 2 }).queryKey,
  );
  assert.notDeepEqual(
    eventQueries.list({ price: "free" }).queryKey,
    eventQueries.list({ price: "paid" }).queryKey,
  );
  assert.notDeepEqual(
    eventQueries.list({ venueId: "one" }).queryKey,
    eventQueries.list({ venueId: "two" }).queryKey,
  );
  assert.equal(venueQueries.detail("").enabled, false);
  assert.throws(() => normalizeEventFilters({ page: 0 }));
});

test("requests server-side pagination, search, sorting and price filters", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input));
      assert.equal(url.pathname, "/linkedevents/v1/event/");
      assert.equal(url.searchParams.get("text"), "music & art");
      assert.equal(url.searchParams.get("page"), "2");
      assert.equal(url.searchParams.get("page_size"), "12");
      assert.equal(url.searchParams.get("sort"), "-start_time");
      assert.equal(url.searchParams.get("is_free"), "true");
      assert.equal(url.searchParams.get("location"), "tprek:123");
      assert.equal(url.searchParams.get("format"), "json");
      assert.equal(
        new Headers(init?.headers).get("Accept"),
        "application/json",
      );
      return Response.json({
        meta: { count: 13, next: null },
        data: [eventFixture()],
      });
    },
  );

  const page = await eventRepository.getAll({
    search: " music & art ",
    page: 2,
    sort: "latest",
    price: "free",
    venueId: "tprek:123",
  });
  assert.equal(page.items[0].id, "helsinki:example");
  assert.equal(page.count, 13);
  assert.equal(page.hasNextPage, false);
  assert.equal(page.page, 2);
});

test("requests event and venue details through their own resources", async (t) => {
  const paths: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    paths.push(url.pathname);
    return Response.json(
      url.pathname.includes("/place/")
        ? { id: "tprek:123", name: { en: "City Museum" } }
        : eventFixture(),
    );
  });

  const event = await eventRepository.getById("helsinki:example");
  const venue = await venueRepository.getById(event.venueId!);
  assert.deepEqual(paths, [
    "/linkedevents/v1/event/helsinki%3Aexample/",
    "/linkedevents/v1/place/tprek%3A123/",
  ]);
  assert.equal(venue.name, "City Museum");
});

test("distinguishes missing records, connection failures and invalid JSON", async (t) => {
  const fetchMock = t.mock.method(
    globalThis,
    "fetch",
    async () => new Response("", { status: 404 }),
  );
  await assert.rejects(
    () => getApi("event/missing/"),
    (error) => error instanceof HttpError && error.status === 404,
  );

  fetchMock.mock.mockImplementation(async () => {
    throw new TypeError("Failed to fetch");
  });
  await assert.rejects(() => getApi("event/"), /Не вдалося з’єднатися/);

  fetchMock.mock.mockImplementation(async () => new Response("not json"));
  await assert.rejects(
    () => getApi("event/"),
    /відповідь, яку не вдалося прочитати/,
  );
});

test("passes cancellation to fetch and preserves its original reason", async (t) => {
  const controller = new AbortController();
  controller.abort();
  t.mock.method(
    globalThis,
    "fetch",
    async (_input: RequestInfo | URL, init?: RequestInit) => {
      assert.equal(init?.signal, controller.signal);
      throw controller.signal.reason;
    },
  );
  await assert.rejects(
    () => eventRepository.getAll({}, controller.signal),
    (error) => error === controller.signal.reason,
  );
});

test("shares cached query data for equivalent filters", async (t) => {
  let requests = 0;
  t.after(() => queryClient.clear());
  t.mock.method(globalThis, "fetch", async () => {
    requests += 1;
    return Response.json({
      meta: { count: 1, next: null },
      data: [eventFixture()],
    });
  });
  const first = await queryClient.fetchQuery(
    eventQueries.list({ search: " music " }),
  );
  const second = await queryClient.fetchQuery(
    eventQueries.list({ search: "music" }),
  );
  assert.equal(requests, 1);
  assert.equal(first, second);
});
