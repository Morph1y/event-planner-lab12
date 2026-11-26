import { createStore } from "zustand/vanilla";
import {
  personalEventDraftSchema,
  storedPlannerSchema,
} from "../schemas/personalEvent.ts";
import type {
  PersonalEvent,
  PersonalEventDraft,
  PlannerData,
} from "../types/planner.ts";

export const PLANNER_STORAGE_KEY = "vykhid.planner.v1";

export interface PlannerStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

export interface PlannerState extends PlannerData {
  storageWarning: string | null;
  reload: () => void;
  toggleFavorite: (id: string) => boolean;
  removeFavorite: (id: string) => void;
  createPersonalEvent: (draft: PersonalEventDraft) => PersonalEvent;
  updatePersonalEvent: (id: string, draft: PersonalEventDraft) => PersonalEvent;
  deletePersonalEvent: (id: string) => void;
}

function readPlanner(
  storage: PlannerStorage,
): PlannerData & { storageWarning: string | null } {
  try {
    const raw = storage.getItem(PLANNER_STORAGE_KEY);
    const data =
      raw === null
        ? { favoriteIds: [], personalEvents: [] }
        : storedPlannerSchema.parse(JSON.parse(raw)).data;
    return { ...data, storageWarning: null };
  } catch {
    return {
      favoriteIds: [],
      personalEvents: [],
      storageWarning:
        "Не вдалося відновити збережені плани. Спробуй повторити відновлення.",
    };
  }
}

function validatedDraft(draft: PersonalEventDraft): PersonalEventDraft {
  const result = personalEventDraftSchema.safeParse(draft);
  if (!result.success)
    throw new Error("Перевірте назву, місце, час і вартість події.");
  return result.data;
}

export function createPlannerStore(storage: PlannerStorage) {
  return createStore<PlannerState>()((set, get) => {
    function commit(data: PlannerData) {
      const snapshot = storedPlannerSchema.parse({ version: 1, data });
      try {
        storage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(snapshot));
      } catch (error) {
        throw new Error(
          "Не вдалося зберегти зміни. Перевірте доступ до сховища й повторіть спробу.",
          { cause: error },
        );
      }
      set({ ...snapshot.data, storageWarning: null });
    }

    return {
      ...readPlanner(storage),
      reload: () => {
        const loaded = readPlanner(storage);
        set(
          loaded.storageWarning
            ? { storageWarning: loaded.storageWarning }
            : loaded,
        );
      },
      toggleFavorite: (id) => {
        id = id.trim();
        if (!id || id.startsWith("local:")) throw new Error("Невідома подія.");
        const current = get();
        const favorite = !current.favoriteIds.includes(id);
        const favoriteIds = favorite
          ? [id, ...current.favoriteIds]
          : current.favoriteIds.filter((value) => value !== id);
        commit({ favoriteIds, personalEvents: current.personalEvents });
        return favorite;
      },
      removeFavorite: (id) => {
        id = id.trim();
        const current = get();
        if (!current.favoriteIds.includes(id)) return;
        commit({
          favoriteIds: current.favoriteIds.filter((value) => value !== id),
          personalEvents: current.personalEvents,
        });
      },
      createPersonalEvent: (input) => {
        const draft = validatedDraft(input);
        const now = new Date().toISOString();
        const event: PersonalEvent = {
          ...draft,
          id: `local:${crypto.randomUUID()}`,
          createdAt: now,
          updatedAt: now,
        };
        const current = get();
        commit({
          favoriteIds: current.favoriteIds,
          personalEvents: [event, ...current.personalEvents],
        });
        return event;
      },
      updatePersonalEvent: (id, input) => {
        const current = get();
        const previous = current.personalEvents.find(
          (event) => event.id === id,
        );
        if (!previous) throw new Error("Цю подію вже видалено.");
        const draft = validatedDraft(input);
        const event = {
          ...previous,
          ...draft,
          updatedAt: new Date().toISOString(),
        };
        commit({
          favoriteIds: current.favoriteIds,
          personalEvents: current.personalEvents.map((value) =>
            value.id === id ? event : value,
          ),
        });
        return event;
      },
      deletePersonalEvent: (id) => {
        const current = get();
        if (!current.personalEvents.some((event) => event.id === id)) return;
        commit({
          favoriteIds: current.favoriteIds,
          personalEvents: current.personalEvents.filter(
            (event) => event.id !== id,
          ),
        });
      },
    };
  });
}

export const plannerStore = createPlannerStore({
  getItem: (key) => globalThis.localStorage.getItem(key),
  setItem: (key, value) => globalThis.localStorage.setItem(key, value),
});
