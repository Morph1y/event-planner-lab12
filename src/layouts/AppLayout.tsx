import { ArrowUpRight, MapPin } from "lucide-react";
import { useLayoutEffect } from "react";
import { NavLink, Link, Outlet, useLocation } from "react-router";

export function AppLayout() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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
            className="flex items-center gap-6 text-sm"
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
    </div>
  );
}
