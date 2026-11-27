import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { Link } from "react-router";
import { eventQueries } from "../queries/events";
import { useEventFilters } from "../hooks/useEventFilters";
import { EventGrid, EventGridSkeleton } from "../components/events/EventGrid";
import { EventSearch } from "../components/events/EventSearch";
import { AsyncState } from "../components/ui/AsyncState";
import { Pagination } from "../components/ui/Pagination";
import { Button } from "../components/ui/Button";
import { EventPhoto } from "../components/events/EventPhoto";
import type { EventFilters } from "../types/events";

const priceOptions: { value: EventFilters["price"]; label: string }[] = [
  { value: "all", label: "Усі події" },
  { value: "free", label: "Безкоштовні" },
  { value: "paid", label: "Платні" },
];

export function EventsPage() {
  const { filters, updateFilters, resetFilters } = useEventFilters();
  const query = useQuery(eventQueries.list(filters));
  const featured = query.data?.items.find((event) => event.image);
  const hasFilters = Boolean(
    filters.search || filters.price !== "all" || filters.venueId,
  );

  useEffect(() => {
    document.title = "Події — Вихід";
  }, []);

  function changePage(page: number) {
    updateFilters({ page });
    document
      .getElementById("event-results")
      ?.scrollIntoView({ block: "start" });
  }

  return (
    <section>
      <div className="mb-9 grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="py-4">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Події Гельсінкі та регіону
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-6xl">
            Знайди час
            <br />
            для нових вражень.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted">
            Виставки, музика та зустрічі.
            <br className="hidden sm:block" /> Обери подію, заради якої варто
            вийти з дому.
          </p>
        </div>
        {featured ? (
          <div className="hidden overflow-hidden rounded-3xl border border-line bg-surface lg:block">
            <EventPhoto
              image={featured.image}
              title={featured.title}
              href={`/events/${encodeURIComponent(featured.id)}`}
            />
            <Link
              to={`/events/${encodeURIComponent(featured.id)}`}
              className="flex items-center justify-between gap-4 p-4 text-sm font-semibold hover:text-accent"
            >
              <span className="line-clamp-1">{featured.title}</span>
              <ArrowUpRight className="size-5 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="hidden aspect-[16/10] rounded-3xl bg-placeholder lg:block"
          />
        )}
      </div>

      <div className="mb-7 rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <div className="flex flex-col items-start gap-4 lg:flex-row">
          <EventSearch
            search={filters.search}
            onSearch={(search) => updateFilters({ search })}
          />
          <label className="flex w-full shrink-0 items-center gap-3 text-sm lg:w-auto">
            <span className="text-muted">Сортувати</span>
            <select
              aria-label="Сортування подій"
              value={filters.sort}
              onChange={(event) =>
                updateFilters({
                  sort: event.target.value as EventFilters["sort"],
                })
              }
              className="min-h-12 min-w-0 flex-1 rounded-xl border border-line-strong bg-surface px-3 py-2 lg:w-48"
            >
              <option value="soonest">За початком ↑</option>
              <option value="latest">За початком ↓</option>
              <option value="title">За назвою</option>
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <div
            role="group"
            aria-label="Вартість подій"
            className="flex flex-wrap gap-2"
          >
            {priceOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={filters.price === option.value}
                onClick={() => updateFilters({ price: option.value })}
                className={`min-h-10 rounded-full px-4 py-2 text-xs font-semibold transition ${filters.price === option.value ? "bg-stone-900 text-white" : "bg-soft text-muted hover:bg-hover"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto min-h-10 px-2 text-xs text-muted underline underline-offset-4"
            >
              Скинути фільтри
            </button>
          )}
        </div>
      </div>

      <div id="event-results" className="scroll-mt-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            {filters.search
              ? `Результати для «${filters.search}»`
              : filters.venueId
                ? "Події обраної локації"
                : "Досліджуй події"}
          </h2>
          <div className="flex items-center gap-3 text-xs text-subtle">
            {query.isFetching && !query.isPending && (
              <span role="status" className="flex items-center gap-1.5">
                <LoaderCircle
                  className="size-3 animate-spin"
                  aria-hidden="true"
                />
                Оновлення…
              </span>
            )}
            {query.data && (
              <span>
                {query.data.count.toLocaleString("uk-UA")} подій · час Гельсінкі
              </span>
            )}
          </div>
        </div>
        {query.isPending ? (
          <EventGridSkeleton />
        ) : query.isError ? (
          <div className="space-y-4">
            <AsyncState
              kind="error"
              message={query.error.message}
              onRetry={() => void query.refetch()}
            />
            {filters.page > 1 && (
              <Button variant="secondary" onClick={() => changePage(1)}>
                На першу сторінку
              </Button>
            )}
          </div>
        ) : query.data.items.length === 0 ? (
          <AsyncState
            kind="empty"
            message="Спробуй іншу назву або зміни фільтри."
            onReset={resetFilters}
          />
        ) : (
          <>
            <EventGrid events={query.data.items} />
            <Pagination
              page={query.data.page}
              pageSize={query.data.pageSize}
              count={query.data.count}
              hasNextPage={query.data.hasNextPage}
              onPageChange={changePage}
            />
          </>
        )}
      </div>
    </section>
  );
}
