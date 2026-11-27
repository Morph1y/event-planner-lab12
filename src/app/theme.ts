import { createThemeStore, resolveTheme } from "../stores/themeStore";

const media = window.matchMedia("(prefers-color-scheme: dark)");

export const themeStore = createThemeStore(
  {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
  },
  media.matches,
);

function applyTheme() {
  const { preference, systemDark } = themeStore.getState();
  const theme = resolveTheme(preference, systemDark);
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#171b19" : "#f5f3ee");
}

applyTheme();
const unsubscribe = themeStore.subscribe(applyTheme);
const onSystemChange = (event: MediaQueryListEvent) =>
  themeStore.getState().setSystemDark(event.matches);
media.addEventListener("change", onSystemChange);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    unsubscribe();
    media.removeEventListener("change", onSystemChange);
  });
}
