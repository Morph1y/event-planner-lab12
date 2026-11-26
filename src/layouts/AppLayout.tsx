import { ArrowUpRight, MapPin } from "lucide-react";
import { useLayoutEffect } from "react";
import { NavLink, Link, Outlet, useLocation } from "react-router";
import { usePlannerStore } from "../hooks/usePlannerStore";
import { usePlannerUi } from "../stores/plannerUiStore";
import { PlannerDialogs } from "../components/planner/PlannerDialogs";
import { PlannerNotice } from "../components/planner/PlannerNotice";
import { Button } from "../components/ui/Button";

export function AppLayout() {
  const { pathname } = useLocation();
  const favoriteCount = usePlannerStore((state) => state.favoriteIds.length);
  const warning = usePlannerStore((state) => state.storageWarning);
  const reload = usePlannerStore((state) => state.reload);
  const closeDialog = usePlannerUi((state) => state.closeDialog);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    closeDialog();
  }, [pathname, closeDialog]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          const main = document.getElementById("main-content");
          main?.focus();
          main?.scrollIntoView();
        }}
        className="sr-only z-50 rounded-lg bg-stone-900 px-4 py-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Перейти до вмісту
      </a>
      <header className="border-b border-stone-200 bg-[#f5f3ee]/95">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-10 gap-y-4 px-5 py-5 sm:px-8">
          <Link
            to="/events"
            aria-label="Вихід — каталог подій"
            className="flex items-center gap-2.5"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-orange-700 text-white">
              <ArrowUpRight className="size-6" aria-hidden="true" />
            </span>
            <span className="text-2xl font-bold tracking-tight">вихід</span>
          </Link>
          <nav
            aria-label="Головна навігація"
            className="order-last flex w-full items-center gap-6 text-sm sm:order-none sm:w-auto"
          >
            <NavLink
              to="/events"
              className={({ isActive }) =>
                isActive
                  ? "font-semibold text-orange-800"
                  : "text-stone-600 hover:text-stone-900"
              }
            >
              Події
            </NavLink>
            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                isActive
                  ? "font-semibold text-orange-800"
                  : "text-stone-600 hover:text-stone-900"
              }
            >
              Обране
              {favoriteCount > 0 && (
                <span
                  aria-hidden="true"
                  className="ml-1.5 rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] text-orange-800"
                >
                  {favoriteCount}
                </span>
              )}
            </NavLink>
            <NavLink
              to="/my-events"
              className={({ isActive }) =>
                isActive
                  ? "font-semibold text-orange-800"
                  : "text-stone-600 hover:text-stone-900"
              }
            >
              Мої події
            </NavLink>
          </nav>
          <p className="ml-auto flex items-center gap-2 text-xs text-stone-600 sm:text-sm">
            <MapPin className="size-4" aria-hidden="true" />
            Гельсінкі та поруч
          </p>
        </div>
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 outline-none sm:px-8 sm:py-12"
      >
        {warning && (
          <div
            role="status"
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
          >
            <p className="max-w-2xl leading-relaxed">{warning}</p>
            <Button variant="secondary" onClick={reload}>
              Повторити відновлення
            </Button>
          </div>
        )}
        <Outlet />
      </main>
      <footer className="mt-12 border-t border-stone-200">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-7 text-xs text-stone-500 sm:px-8">
          <span>Вихід · Event Planner</span>
          <a
            href="https://api.hel.fi/linkedevents/v1/"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4"
          >
            Дані — Helsinki Linked Events
          </a>
        </div>
      </footer>
      <PlannerDialogs />
      <PlannerNotice />
    </div>
  );
}
