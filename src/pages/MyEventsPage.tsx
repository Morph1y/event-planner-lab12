import { useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { usePlannerStore } from "../hooks/usePlannerStore";
import { usePlannerUi } from "../stores/plannerUiStore";
import { personalCategoryLabels } from "../types/planner";
import { eventTimeLabel } from "../utils/eventPresentation";
import { personalPriceLabel } from "../utils/personalEvent";
import { Button } from "../components/ui/Button";

export function MyEventsPage() {
  const events = usePlannerStore((state) => state.personalEvents);
  const openCreate = usePlannerUi((state) => state.openCreate);
  const openEdit = usePlannerUi((state) => state.openEdit);
  const openDelete = usePlannerUi((state) => state.openDelete);
  const [params, setParams] = useSearchParams();
  const sort = params.get("sort") === "newest" ? "newest" : "soonest";
  const visible = [...events].sort((a, b) =>
    sort === "newest"
      ? b.createdAt.localeCompare(a.createdAt)
      : a.startsAt.localeCompare(b.startsAt),
  );
  useEffect(() => {
    document.title = "Мої події — Вихід";
  }, []);

  return (
    <section>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-orange-800">
            Твої власні плани
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Мої події
          </h1>
          <p className="mt-4 text-sm text-stone-600">
            Зустрічі й події, які ти плануєш самостійно. Зберігаються в цьому
            браузері.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          Створити подію
        </Button>
      </div>
      {events.length === 0 ? (
        <div className="rounded-3xl border border-stone-200 bg-white px-6 py-14 text-center">
          <CalendarDays
            className="mx-auto mb-5 size-10 text-orange-700"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <h2 className="text-xl font-semibold">Додай перший власний план</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-600">
            Обери час і місце — зустріч із друзями чи невеликий концерт уже
            матимуть своє місце у твоїх планах.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-stone-500">
              {events.length} власних подій · час Гельсінкі
            </p>
            <label className="flex items-center gap-3 text-sm text-stone-600">
              Порядок
              <select
                aria-label="Порядок власних подій"
                value={sort}
                onChange={(event) =>
                  setParams(
                    event.target.value === "newest"
                      ? { sort: "newest" }
                      : new URLSearchParams(),
                  )
                }
                className="min-h-11 rounded-xl border border-stone-300 bg-white px-3 py-2"
              >
                <option value="soonest">За початком</option>
                <option value="newest">Спочатку нові</option>
              </select>
            </label>
          </div>
          <ul className="space-y-4">
            {visible.map((event) => (
              <li key={event.id}>
                <article className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
                        <span className="rounded-full bg-stone-100 px-3 py-1.5 text-stone-600">
                          {personalCategoryLabels[event.category]}
                        </span>
                        <span className="font-semibold text-emerald-700">
                          {personalPriceLabel(event.price)}
                        </span>
                      </div>
                      <h2 className="break-words text-xl font-semibold tracking-tight">
                        <Link
                          to={`/my-events/${encodeURIComponent(event.id)}`}
                          className="hover:text-orange-800"
                        >
                          {event.title}
                        </Link>
                      </h2>
                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-600">
                        <p className="flex items-start gap-2">
                          <CalendarDays
                            className="mt-0.5 size-4 shrink-0"
                            aria-hidden="true"
                          />
                          {eventTimeLabel(event)}
                        </p>
                        <p className="flex min-w-0 items-start gap-2">
                          <MapPin
                            className="mt-0.5 size-4 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="break-words">{event.location}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(event.id)}
                        aria-label={`Редагувати подію «${event.title}»`}
                        className="inline-flex size-11 items-center justify-center rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100"
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openDelete(event.id)}
                        aria-label={`Видалити подію «${event.title}»`}
                        className="inline-flex size-11 items-center justify-center rounded-xl border border-stone-200 text-stone-600 hover:border-red-300 hover:text-red-700"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                      <Link
                        to={`/my-events/${encodeURIComponent(event.id)}`}
                        aria-label={`Деталі події «${event.title}»`}
                        className="inline-flex size-11 items-center justify-center rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100"
                      >
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
