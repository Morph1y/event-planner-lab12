import { useEffect } from "react";
import { ArrowLeft, CalendarDays, MapPin, Pencil, Trash2 } from "lucide-react";
import { Link, useParams } from "react-router";
import { usePlannerStore } from "../hooks/usePlannerStore";
import { usePlannerUi } from "../stores/plannerUiStore";
import { personalCategoryLabels } from "../types/planner";
import {
  eventTimeLabel,
  formatEventDateTime,
} from "../utils/eventPresentation";
import { personalPriceLabel } from "../utils/personalEvent";
import { Button } from "../components/ui/Button";

export function PersonalEventDetailsPage() {
  const { personalId = "" } = useParams();
  const event = usePlannerStore((state) =>
    state.personalEvents.find((value) => value.id === personalId),
  );
  const openEdit = usePlannerUi((state) => state.openEdit);
  const openDelete = usePlannerUi((state) => state.openDelete);
  useEffect(() => {
    document.title = event
      ? `${event.title} — Мої події — Вихід`
      : "Власна подія — Вихід";
  }, [event]);

  if (!event)
    return (
      <section className="space-y-5">
        <h1 className="text-3xl font-semibold">Подію не знайдено</h1>
        <p className="text-sm text-stone-600">
          Цю подію видалено або її немає у збережених планах цього браузера.
        </p>
        <Link
          to="/my-events"
          className="inline-flex min-h-11 items-center gap-2 text-sm underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          До моїх подій
        </Link>
      </section>
    );

  return (
    <article>
      <Link
        to="/my-events"
        className="mb-7 inline-flex min-h-10 items-center gap-2 text-sm text-stone-600 hover:text-orange-800"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        До моїх подій
      </Link>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-4xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-orange-800">
            Власна подія · {personalCategoryLabels[event.category]}
          </p>
          <h1 className="break-words text-3xl font-semibold tracking-tight sm:text-5xl">
            {event.title}
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => openEdit(event.id)}>
            <Pencil className="size-4" aria-hidden="true" />
            Редагувати
          </Button>
          <Button variant="secondary" onClick={() => openDelete(event.id)}>
            <Trash2 className="size-4" aria-hidden="true" />
            Видалити
          </Button>
        </div>
      </div>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
          <h2 className="mb-4 text-xl font-semibold">План події</h2>
          <p className="whitespace-pre-line break-words leading-relaxed text-stone-700">
            {event.description || "Опис ще не додано."}
          </p>
        </section>
        <aside
          aria-label="Деталі власної події"
          className="space-y-5 rounded-3xl border border-stone-200 bg-white p-6 text-sm"
        >
          <h2 className="text-lg font-semibold">Деталі</h2>
          <p className="flex items-start gap-3 leading-relaxed">
            <CalendarDays
              className="mt-0.5 size-5 shrink-0 text-orange-700"
              aria-hidden="true"
            />
            <span>
              {eventTimeLabel(event)}
              <span className="block text-xs text-stone-500">
                Час Гельсінкі
              </span>
            </span>
          </p>
          <p className="flex items-start gap-3 leading-relaxed">
            <MapPin
              className="mt-0.5 size-5 shrink-0 text-orange-700"
              aria-hidden="true"
            />
            <span className="break-words">{event.location}</span>
          </p>
          <p className="text-xs leading-relaxed text-stone-500">
            Завершення — {formatEventDateTime(event.endsAt)}
          </p>
          <p className="border-t border-stone-200 pt-4 font-semibold">
            {personalPriceLabel(event.price)}
          </p>
        </aside>
      </div>
    </article>
  );
}
