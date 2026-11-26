import { useEffect } from "react";
import { useQueries, useMutation } from "@tanstack/react-query";
import { Link, Navigate, useSearchParams } from "react-router";
import { Heart } from "lucide-react";
import { usePlannerStore } from "../hooks/usePlannerStore";
import { plannerStore } from "../stores/plannerStore";
import { usePlannerUi } from "../stores/plannerUiStore";
import { eventQueries } from "../queries/events";
import { EventCard } from "../components/events/EventCard";
import { AsyncState } from "../components/ui/AsyncState";
import { Pagination } from "../components/ui/Pagination";
import { Button } from "../components/ui/Button";

const PAGE_SIZE = 12;

export function FavoritesPage() {
  const ids = usePlannerStore((state) => state.favoriteIds);
  const notify = usePlannerUi((state) => state.notify);
  const [params, setParams] = useSearchParams();
  const requestedPage = Number(params.get("page") ?? 1);
  const pageCount = Math.max(1, Math.ceil(ids.length / PAGE_SIZE));
  const requested =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const page = Math.min(requested, pageCount);
  const visibleIds = ids.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const queries = useQueries({
    queries: visibleIds.map((id) => eventQueries.detail(id)),
  });
  const remove = useMutation({
    mutationKey: ["favorites", "remove"],
    mutationFn: async (id: string) =>
      plannerStore.getState().removeFavorite(id),
    onSuccess: () => notify("Подію прибрано з обраного."),
    onError: (error) => notify(error.message, "error"),
  });

  useEffect(() => {
    document.title = "Обране — Вихід";
  }, []);
  if (requested !== page)
    return (
      <Navigate
        to={page === 1 ? "/favorites" : `/favorites?page=${page}`}
        replace
      />
    );

  return (
    <section>
      <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-orange-800">
            Твоя добірка
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Обрані події
          </h1>
        </div>
        <p className="text-sm text-stone-500">{ids.length} збережених подій</p>
      </div>
      {ids.length === 0 ? (
        <div className="rounded-3xl border border-stone-200 bg-white px-6 py-14 text-center">
          <Heart
            className="mx-auto mb-5 size-10 text-orange-700"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <h2 className="text-xl font-semibold">Збережи те, що зацікавило</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-600">
            Натисни сердечко біля події в каталозі — вона з’явиться тут.
          </p>
          <Link
            to="/events"
            className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-orange-700 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-800"
          >
            До каталогу подій
          </Link>
        </div>
      ) : (
        <>
          <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {queries.map((query, index) => (
              <li key={visibleIds[index]} className="min-w-0">
                {query.isPending ? (
                  <AsyncState
                    kind="loading"
                    message="Завантажуємо збережену подію."
                  />
                ) : query.isError ? (
                  <div className="space-y-3">
                    <AsyncState
                      kind="error"
                      title="Подія недоступна"
                      message={query.error.message}
                      onRetry={() => void query.refetch()}
                    />
                    <Button
                      variant="secondary"
                      className="w-full"
                      disabled={remove.isPending}
                      onClick={() => remove.mutate(visibleIds[index])}
                    >
                      Прибрати з обраного
                    </Button>
                  </div>
                ) : (
                  <EventCard event={query.data} />
                )}
              </li>
            ))}
          </ul>
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            count={ids.length}
            hasNextPage={page < pageCount}
            onPageChange={(value) =>
              setParams(
                value === 1
                  ? new URLSearchParams()
                  : new URLSearchParams({ page: String(value) }),
              )
            }
          />
        </>
      )}
    </section>
  );
}
