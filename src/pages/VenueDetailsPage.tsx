import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { Link, useParams } from "react-router";
import { venueQueries } from "../queries/venues";
import { eventQueries } from "../queries/events";
import { eventFiltersToSearch } from "../schemas/eventFilters";
import { AsyncState } from "../components/ui/AsyncState";
import { EventGrid, EventGridSkeleton } from "../components/events/EventGrid";

export function VenueDetailsPage() {
  const { venueId = "" } = useParams();
  const venueQuery = useQuery(venueQueries.detail(venueId));
  const eventsQuery = useQuery({
    ...eventQueries.list({ venueId }),
    enabled: venueQuery.isSuccess,
  });

  useEffect(() => {
    document.title = venueQuery.data
      ? `${venueQuery.data.name} — Вихід`
      : "Локація — Вихід";
  }, [venueQuery.data]);

  if (venueQuery.isPending)
    return <AsyncState kind="loading" message="Завантажуємо локацію." />;
  if (venueQuery.isError)
    return (
      <div className="space-y-5">
        <Link to="/events" className="text-sm underline">
          До каталогу
        </Link>
        <AsyncState
          kind="error"
          message={venueQuery.error.message}
          onRetry={() => void venueQuery.refetch()}
        />
      </div>
    );
  const venue = venueQuery.data;
  const mapUrl = venue.coordinates
    ? `https://www.openstreetmap.org/?mlat=${venue.coordinates.latitude}&mlon=${venue.coordinates.longitude}#map=16/${venue.coordinates.latitude}/${venue.coordinates.longitude}`
    : null;

  return (
    <article>
      <Link
        to="/events"
        className="mb-7 inline-flex min-h-10 items-center gap-2 text-sm text-muted hover:text-accent"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        До каталогу подій
      </Link>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
        Локація
      </p>
      <h1 className="max-w-4xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
        {venue.name}
      </h1>
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <p className="max-w-3xl whitespace-pre-line break-words text-base leading-relaxed text-muted">
          {venue.description || "Опис локації поки відсутній."}
        </p>
        <aside
          aria-label="Контакти локації"
          className="space-y-5 rounded-3xl border border-line bg-surface p-6 text-sm"
        >
          <h2 className="text-lg font-semibold">Як знайти</h2>
          <p className="flex gap-3 leading-relaxed">
            <MapPin
              className="mt-0.5 size-5 shrink-0 text-accent"
              aria-hidden="true"
            />
            <span>
              {[venue.address, venue.city].filter(Boolean).join(", ") ||
                "Адресу не вказано"}
            </span>
          </p>
          {venue.phone && (
            <p className="flex gap-3 break-words">
              <Phone
                className="size-5 shrink-0 text-accent"
                aria-hidden="true"
              />
              <span>{venue.phone}</span>
            </p>
          )}
          {venue.email && (
            <p className="flex min-w-0 gap-3">
              <Mail
                className="size-5 shrink-0 text-accent"
                aria-hidden="true"
              />
              <a
                href={`mailto:${venue.email}`}
                className="break-all underline underline-offset-4"
              >
                {venue.email}
              </a>
            </p>
          )}
          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line-strong px-3 py-2 font-semibold hover:bg-soft"
            >
              Відкрити на мапі
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          )}
          {venue.website && (
            <a
              href={venue.website}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-11 items-center gap-2 text-muted underline underline-offset-4"
            >
              Сайт локації
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          )}
        </aside>
      </div>
      <section className="mt-14">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Події в цій локації
          </h2>
          {eventsQuery.data && eventsQuery.data.count > 6 && (
            <Link
              to={`/events?${eventFiltersToSearch({ venueId }).toString()}`}
              className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-accent"
            >
              Усі події локації
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          )}
        </div>
        {eventsQuery.isPending ? (
          <EventGridSkeleton />
        ) : eventsQuery.isError ? (
          <AsyncState
            kind="error"
            message={eventsQuery.error.message}
            onRetry={() => void eventsQuery.refetch()}
          />
        ) : eventsQuery.data.items.length === 0 ? (
          <AsyncState
            kind="empty"
            message="У цій локації зараз немає майбутніх подій."
          />
        ) : (
          <EventGrid events={eventsQuery.data.items.slice(0, 6)} />
        )}
      </section>
    </article>
  );
}
