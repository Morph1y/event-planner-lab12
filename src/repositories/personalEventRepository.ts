import { plannerStore } from "../stores/plannerStore.ts";
import type { PersonalEventDraft } from "../types/planner.ts";

export const personalEventRepository = {
  async create(draft: PersonalEventDraft) {
    return plannerStore.getState().createPersonalEvent(draft);
  },

  async update(id: string, draft: PersonalEventDraft) {
    return plannerStore.getState().updatePersonalEvent(id, draft);
  },

  async delete(id: string) {
    plannerStore.getState().deletePersonalEvent(id);
  },
};
