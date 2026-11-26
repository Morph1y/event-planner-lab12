import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createPlannerStore,
  PLANNER_STORAGE_KEY,
  type PlannerStorage,
} from "../src/stores/plannerStore.ts";
import {
  personalEventFormSchema,
  storedPlannerSchema,
} from "../src/schemas/personalEvent.ts";
import {
  isLocalDateTime,
  toLocalDateTime,
} from "../src/utils/localDateTime.ts";
import type { PersonalEventDraft } from "../src/types/planner.ts";

class MemoryStorage implements PlannerStorage {
  value: string | null = null;
  writes = 0;
  failRead = false;
  failWrite = false;

  getItem() {
    if (this.failRead) throw new Error("Storage unavailable");
    return this.value;
  }

  setItem(key: string, value: string) {
    assert.equal(key, PLANNER_STORAGE_KEY);
    if (this.failWrite) throw new Error("Storage quota exceeded");
    this.value = value;
    this.writes += 1;
  }
}

function draft(): PersonalEventDraft {
  return {
    title: "  Jazz evening  ",
    description: "Bring friends",
    category: "music",
    location: "City Hall",
    startsAt: "2026-12-01T16:00:00.000Z",
    endsAt: "2026-12-01T18:00:00.000Z",
    price: 12.5,
  };
}

test("persists client-owned events and only identifiers for server favorites", () => {
  const storage = new MemoryStorage();
  const store = createPlannerStore(storage);
  const event = store.getState().createPersonalEvent(draft());
  store.getState().toggleFavorite("helsinki:one");
  const snapshot = storedPlannerSchema.parse(JSON.parse(storage.value!));
  assert.deepEqual(snapshot.data.favoriteIds, ["helsinki:one"]);
  assert.equal(snapshot.data.personalEvents[0].title, "Jazz evening");
  assert.deepEqual(Object.keys(snapshot.data).sort(), [
    "favoriteIds",
    "personalEvents",
  ]);
  const restored = createPlannerStore(storage);
  assert.equal(restored.getState().personalEvents[0].id, event.id);
  assert.deepEqual(restored.getState().favoriteIds, ["helsinki:one"]);
  assert.equal(restored.getState().storageWarning, null);
});

test("keeps favorites unique and makes repeated removal safe", () => {
  const storage = new MemoryStorage();
  const store = createPlannerStore(storage);
  assert.equal(store.getState().toggleFavorite(" helsinki:one "), true);
  assert.deepEqual(store.getState().favoriteIds, ["helsinki:one"]);
  assert.equal(store.getState().toggleFavorite("helsinki:one"), false);
  store.getState().removeFavorite("helsinki:one");
  assert.deepEqual(store.getState().favoriteIds, []);
  assert.throws(
    () => store.getState().toggleFavorite("local:example"),
    /Невідома подія/,
  );
});

test("updates events immutably and preserves identity and creation metadata", () => {
  const store = createPlannerStore(new MemoryStorage());
  const created = store.getState().createPersonalEvent(draft());
  const previous = store.getState().personalEvents;
  const updated = store
    .getState()
    .updatePersonalEvent(created.id, {
      ...draft(),
      title: "Updated plan",
      price: 0,
    });
  assert.equal(updated.id, created.id);
  assert.equal(updated.createdAt, created.createdAt);
  assert.equal(previous[0].title, "Jazz evening");
  assert.equal(store.getState().personalEvents[0].title, "Updated plan");
  assert.equal(store.getState().personalEvents[0].price, 0);
});

test("rejects invalid intervals and amounts without changing saved state", () => {
  const storage = new MemoryStorage();
  const store = createPlannerStore(storage);
  const created = store.getState().createPersonalEvent(draft());
  const snapshot = storage.value;
  assert.throws(() =>
    store
      .getState()
      .updatePersonalEvent(created.id, {
        ...draft(),
        endsAt: draft().startsAt,
      }),
  );
  assert.throws(() =>
    store.getState().createPersonalEvent({ ...draft(), price: -1 }),
  );
  assert.throws(() =>
    store.getState().createPersonalEvent({ ...draft(), price: 0.001 }),
  );
  assert.throws(
    () => store.getState().updatePersonalEvent("local:missing", draft()),
    /вже видалено/,
  );
  assert.equal(storage.value, snapshot);
  assert.equal(store.getState().personalEvents.length, 1);
});

test("does not change memory when persistence fails and supports retry", () => {
  const storage = new MemoryStorage();
  const store = createPlannerStore(storage);
  const event = store.getState().createPersonalEvent(draft());
  const before = store.getState();
  const saved = storage.value;
  storage.failWrite = true;
  assert.throws(
    () => store.getState().toggleFavorite("helsinki:one"),
    /Не вдалося зберегти/,
  );
  assert.throws(
    () =>
      store
        .getState()
        .updatePersonalEvent(event.id, {
          ...draft(),
          title: "Should not be applied",
        }),
    /Не вдалося зберегти/,
  );
  assert.throws(
    () => store.getState().deletePersonalEvent(event.id),
    /Не вдалося зберегти/,
  );
  assert.throws(
    () => store.getState().createPersonalEvent(draft()),
    /Не вдалося зберегти/,
  );
  assert.equal(store.getState(), before);
  assert.equal(storage.value, saved);
  storage.failWrite = false;
  store
    .getState()
    .updatePersonalEvent(event.id, { ...draft(), title: "Retry succeeded" });
  assert.equal(store.getState().personalEvents[0].title, "Retry succeeded");
});

test("handles damaged storage without automatically overwriting it", () => {
  const storage = new MemoryStorage();
  storage.value = "{broken";
  const store = createPlannerStore(storage);
  assert.deepEqual(store.getState().personalEvents, []);
  assert.ok(store.getState().storageWarning);
  assert.equal(storage.value, "{broken");
  assert.equal(storage.writes, 0);
  storage.value = JSON.stringify({
    version: 1,
    data: { favoriteIds: ["helsinki:recovered"], personalEvents: [] },
  });
  store.getState().reload();
  assert.equal(store.getState().storageWarning, null);
  assert.deepEqual(store.getState().favoriteIds, ["helsinki:recovered"]);
});

test("retains the current snapshot if a later storage read fails", () => {
  const storage = new MemoryStorage();
  const store = createPlannerStore(storage);
  store.getState().createPersonalEvent(draft());
  const before = store.getState().personalEvents;
  storage.failRead = true;
  store.getState().reload();
  assert.equal(store.getState().personalEvents, before);
  assert.ok(store.getState().storageWarning);
});

test("rejects duplicate or incompatible stored records", () => {
  const storage = new MemoryStorage();
  storage.value = JSON.stringify({
    version: 1,
    data: { favoriteIds: ["same", "same"], personalEvents: [] },
  });
  assert.ok(createPlannerStore(storage).getState().storageWarning);
  storage.value = JSON.stringify({
    version: 5,
    data: { favoriteIds: [], personalEvents: [] },
  });
  assert.ok(createPlannerStore(storage).getState().storageWarning);
});

test("keeps rapid sequential actions and repeated deletes consistent", () => {
  const storage = new MemoryStorage();
  const store = createPlannerStore(storage);
  const first = store.getState().createPersonalEvent(draft());
  store.getState().toggleFavorite("helsinki:one");
  const second = store
    .getState()
    .createPersonalEvent({ ...draft(), title: "Another plan" });
  store.getState().toggleFavorite("helsinki:two");
  store.getState().deletePersonalEvent(first.id);
  const writes = storage.writes;
  store.getState().deletePersonalEvent(first.id);
  assert.equal(storage.writes, writes);
  assert.deepEqual(
    store.getState().personalEvents.map((event) => event.id),
    [second.id],
  );
  assert.deepEqual(store.getState().favoriteIds, [
    "helsinki:two",
    "helsinki:one",
  ]);
});

test("validates local times, end-after-start and paid event prices", () => {
  const valid = {
    title: "Jazz evening",
    description: "",
    location: "City Hall",
    category: "music",
    startsAt: "2026-12-01T18:00",
    endsAt: "2026-12-01T20:00",
    isFree: false,
    price: "12,50",
  };
  const result = personalEventFormSchema.parse(valid);
  assert.equal(result.price, "12.50");
  assert.equal(
    personalEventFormSchema.safeParse({ ...valid, endsAt: valid.startsAt })
      .success,
    false,
  );
  assert.equal(
    personalEventFormSchema.safeParse({
      ...valid,
      startsAt: "2026-02-30T12:00",
    }).success,
    false,
  );
  assert.equal(
    personalEventFormSchema.safeParse({ ...valid, price: "0" }).success,
    false,
  );
  assert.equal(
    personalEventFormSchema.safeParse({ ...valid, price: "1.001" }).success,
    false,
  );
  assert.equal(
    personalEventFormSchema.safeParse({ ...valid, isFree: true, price: "" })
      .success,
    true,
  );
});

test("round-trips stored timestamps through the local datetime form", () => {
  const iso = "2026-12-01T16:00:00.000Z";
  const local = toLocalDateTime(iso);
  assert.equal(isLocalDateTime(local), true);
  assert.equal(new Date(local).toISOString(), iso);
  assert.equal(isLocalDateTime("not a date"), false);
});
