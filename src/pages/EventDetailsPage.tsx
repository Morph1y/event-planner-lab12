import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Ticket,
} from "lucide-react";
import { Link, useParams } from "react-router";
import { eventQueries } from "../queries/events";
import {
  eventPriceLabel,
  eventStatusLabels,
  eventTimeLabel,
} from "../utils/eventPresentation";
import { EventPhoto } from "../components/events/EventPhoto";
import { AsyncState } from "../components/ui/AsyncState";
import { FavoriteButton } from "../components/planner/FavoriteButton";

export function EventDetailsPage() {
  const { eventId = "" } = useParams();
  const query = useQuery(eventQueries.detail(eventId));

  useEffect(() => {
    document.title = query.data
      ? `${query.data.title} — Вихід`
      : "Деталі події — Вихід";
  }, [query.data]);

  if (query.isPending)
    return <AsyncState kind="loading" message="Завантажуємо деталі події." />;
  if (query.isError)
    return (
      <div className="space-y-5">
        <Link to="/events" className="text-sm underline">
          До каталогу
        </Link>
        <AsyncState
          kind="error"
          message={query.error.message}
          onRetry={() => void query.refetch()}
        />
      </div>
    );
  const event = query.data;

  return (
    <article>
      <Link
        to="/events"
        className="mb-7 inline-flex min-h-10 items-center gap-2 text-sm text-muted hover:text-accent"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        До каталогу подій
      </Link>
      <div className="mb-8 max-w-4xl">
        {event.status !== "scheduled" && (
          <p className="mb-3 text-sm font-semibold text-accent">
            {eventStatusLabels[event.status]}
          </p>
        )}
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {event.title}
        </h1>
        <div className="mt-5 flex flex-wrap gap-2">
          {event.keywords.map((keyword) => (
            <span
              key={keyword}
              className="rounded-full border border-line-strong px-3 py-1.5 text-xs text-muted"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-9">
          {event.image && (
            <EventPhoto image={event.image} title={event.title} large />
          )}
          <section className="max-w-3xl">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight">
              Про подію
            </h2>
            <p className="whitespace-pre-line break-words text-base leading-relaxed text-muted">
              {event.description ||
                event.summary ||
                "Організатор ще не додав опис."}
            </p>
          </section>
        </div>
        <aside
          aria-label="Інформація для відвідування"
          className="rounded-3xl border border-line bg-surface p-6"
        >
          <h2 className="mb-6 text-lg font-semibold">Деталі відвідування</h2>
          <div className="mb-6">
            <FavoriteButton id={event.id} title={event.title} />
          </div>
          <dl className="space-y-6 text-sm">
            <div className="flex gap-3">
              <CalendarDays
                className="mt-1 size-5 shrink-0 text-accent"
                aria-hidden="true"
              />
              <div>
                <dt className="mb-1 text-xs text-subtle">
                  Коли · час Гельсінкі
                </dt>
                <dd className="font-medium leading-relaxed">
                  {eventTimeLabel(event)}
                </dd>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin
                className="mt-1 size-5 shrink-0 text-accent"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <dt className="mb-1 text-xs text-subtle">Де</dt>
                <dd className="font-medium leading-relaxed">
                  {event.venueId ? (
                    <Link
                      to={`/venues/${encodeURIComponent(event.venueId)}`}
                      className="underline decoration-stone-300 underline-offset-4 hover:text-accent"
                    >
                      {event.venueName || "Переглянути локацію"}
                    </Link>
                  ) : (
                    event.venueName || "Локацію уточнює організатор"
                  )}
                </dd>
              </div>
            </div>
            <div className="flex gap-3">
              <Ticket
                className="mt-1 size-5 shrink-0 text-accent"
                aria-hidden="true"
              />
              <div>
                <dt className="mb-1 text-xs text-subtle">Вартість</dt>
                <dd className="break-words font-medium leading-relaxed">
                  {eventPriceLabel(event)}
                </dd>
              </div>
            </div>
          </dl>
          {event.website ? (
            <a
              href={event.website}
              target="_blank"
              rel="noreferrer"
              className="mt-7 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange-700 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-800"
            >
              На сайт події
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          ) : (
            <p className="mt-7 border-t border-line pt-5 text-xs leading-relaxed text-subtle">
              Посилання на сайт події відсутнє. Деталі відвідування можна
              уточнити в локації.
            </p>
          )}
        </aside>
      </div>
    </article>
  );
}
