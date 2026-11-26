import { useStore } from "zustand";
import { plannerStore, type PlannerState } from "../stores/plannerStore";

export function usePlannerStore<T>(selector: (state: PlannerState) => T): T {
  return useStore(plannerStore, selector);
}
