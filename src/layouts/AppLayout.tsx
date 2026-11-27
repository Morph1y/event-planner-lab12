import { ArrowUpRight, MapPin } from "lucide-react";
import { Suspense, useLayoutEffect } from "react";
import { NavLink, Link, Outlet, useLocation } from "react-router";
import { usePlannerStore } from "../hooks/usePlannerStore";
import { usePlannerUi } from "../stores/plannerUiStore";
import { PlannerDialogs } from "../components/planner/PlannerDialogs";
import { PlannerNotice } from "../components/planner/PlannerNotice";
import { Button } from "../components/ui/Button";
import { ThemeSelect } from "../components/ui/ThemeSelect";
import { RouteBoundary } from "../components/ui/RouteBoundary";
import { AsyncState } from "../components/ui/AsyncState";

export function AppLayout() {
  const { pathname, search } = useLocation();
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
      <header className="border-b border-line bg-canvas/95">
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
                  ? "font-semibold text-accent"
                  : "text-muted hover:text-ink"
              }
            >
              Події
            </NavLink>
            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                isActive
                  ? "font-semibold text-accent"
                  : "text-muted hover:text-ink"
              }
            >
              Обране
              {favoriteCount > 0 && (
                <span
                  aria-hidden="true"
                  className="ml-1.5 rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] text-accent"
                >
                  {favoriteCount}
                </span>
              )}
            </NavLink>
            <NavLink
              to="/my-events"
              className={({ isActive }) =>
                isActive
                  ? "font-semibold text-accent"
                  : "text-muted hover:text-ink"
              }
            >
              Мої події
            </NavLink>
          </nav>
          <p className="ml-auto hidden items-center gap-2 text-xs text-muted lg:flex">
            <MapPin className="size-4" aria-hidden="true" />
            Гельсінкі та поруч
          </p>
          <div className="ml-auto lg:ml-0">
            <ThemeSelect />
          </div>
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
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-warning-line bg-warning-soft p-4 text-sm text-warning"
          >
            <p className="max-w-2xl leading-relaxed">{warning}</p>
            <Button variant="secondary" onClick={reload}>
              Повторити відновлення
            </Button>
          </div>
        )}
        <RouteBoundary key={pathname + search}>
          <Suspense
            fallback={
              <AsyncState kind="loading" message="Відкриваємо сторінку." />
            }
          >
            <Outlet />
          </Suspense>
        </RouteBoundary>
      </main>
      <footer className="mt-12 border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-7 text-xs text-subtle sm:px-8">
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
