import { create } from "zustand";

type PlannerDialog =
  { mode: "create" } | { mode: "edit" | "delete"; id: string };
interface Notice {
  id: string;
  text: string;
  kind: "success" | "error";
}

interface PlannerUiState {
  dialog: PlannerDialog | null;
  notice: Notice | null;
  openCreate: () => void;
  openEdit: (id: string) => void;
  openDelete: (id: string) => void;
  closeDialog: () => void;
  notify: (text: string, kind?: Notice["kind"]) => void;
  dismissNotice: (id: string) => void;
}

export const usePlannerUi = create<PlannerUiState>()((set) => ({
  dialog: null,
  notice: null,
  openCreate: () => set({ dialog: { mode: "create" } }),
  openEdit: (id) => set({ dialog: { mode: "edit", id } }),
  openDelete: (id) => set({ dialog: { mode: "delete", id } }),
  closeDialog: () => set({ dialog: null }),
  notify: (text, kind = "success") =>
    set({ notice: { id: crypto.randomUUID(), text, kind } }),
  dismissNotice: (id) =>
    set((state) => ({ notice: state.notice?.id === id ? null : state.notice })),
}));
