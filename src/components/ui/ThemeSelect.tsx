import { SunMoon } from "lucide-react";
import { useStore } from "zustand";
import { themeStore } from "../../app/theme";
import type { ThemePreference } from "../../stores/themeStore";
import { usePlannerUi } from "../../stores/plannerUiStore";

export function ThemeSelect() {
  const preference = useStore(themeStore, (state) => state.preference);
  const setPreference = useStore(themeStore, (state) => state.setPreference);
  const notify = usePlannerUi((state) => state.notify);
  return (
    <label className="flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs text-muted">
      <SunMoon className="size-4 shrink-0" aria-hidden="true" />
      <span className="sr-only">Тема оформлення</span>
      <select
        aria-label="Тема оформлення"
        className="min-h-11 min-w-0 bg-transparent"
        value={preference}
        onChange={(event) => {
          if (!setPreference(event.target.value as ThemePreference)) {
            notify(
              "Тему змінено, але не вдалося запам’ятати вибір у цьому браузері.",
              "error",
            );
          }
        }}
      >
        <option value="system">Системна</option>
        <option value="light">Світла</option>
        <option value="dark">Темна</option>
      </select>
    </label>
  );
}
