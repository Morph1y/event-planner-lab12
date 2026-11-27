import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createThemeStore,
  resolveTheme,
  THEME_STORAGE_KEY,
} from "../src/stores/themeStore.ts";

test("restores an explicit theme and keeps it independent from system changes", () => {
  const values = new Map([[THEME_STORAGE_KEY, "light"]]);
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
  const store = createThemeStore(storage, true);
  assert.equal(resolveTheme(store.getState().preference, true), "light");
  store.getState().setSystemDark(false);
  store.getState().setSystemDark(true);
  assert.equal(
    resolveTheme(store.getState().preference, store.getState().systemDark),
    "light",
  );
  assert.equal(store.getState().setPreference("dark"), true);
  assert.equal(createThemeStore(storage, false).getState().preference, "dark");
});

test("uses the system theme for unknown preferences and persists returning to system", () => {
  let value = "invalid";
  const storage = {
    getItem: () => value,
    setItem: (_key: string, next: string) => {
      value = next;
    },
  };
  const store = createThemeStore(storage, true);
  assert.equal(store.getState().preference, "system");
  assert.equal(resolveTheme(store.getState().preference, true), "dark");
  store.getState().setPreference("light");
  store.getState().setPreference("system");
  const restored = createThemeStore(storage, false);
  assert.equal(restored.getState().preference, "system");
  assert.equal(resolveTheme(restored.getState().preference, false), "light");
});

test("keeps the theme usable when storage access is blocked", () => {
  const store = createThemeStore(
    {
      getItem: () => {
        throw new Error("Blocked");
      },
      setItem: () => {
        throw new Error("Blocked");
      },
    },
    false,
  );
  assert.equal(store.getState().preference, "system");
  assert.equal(store.getState().setPreference("dark"), false);
  assert.equal(store.getState().preference, "dark");
});
