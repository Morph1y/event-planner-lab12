import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { Link } from "react-router";
import type { Event } from "../../types/events";
import {
  eventPriceLabel,
  eventStatusLabels,
  eventTimeLabel,
} from "../../utils/eventPresentation";
import { EventPhoto } from "./EventPhoto";
import { FavoriteButton } from "../planner/FavoriteButton";

export function EventCard({ event }: { event: Event }) {
  const href = `/events/${encodeURIComponent(event.id)}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition-shadow hover:shadow-lg hover:shadow-stone-900/5">
      <div className="relative">
        <EventPhoto image={event.image} title={event.title} href={href} />
        <div className="absolute right-3 top-3">
          <FavoriteButton id={event.id} title={event.title} compact />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={`text-xs font-semibold ${event.isFree ? "text-emerald-700" : "text-stone-600"}`}
          >
            {eventPriceLabel(event)}
          </span>
          {event.status !== "scheduled" && (
            <span className="text-xs font-semibold text-orange-800">
              {eventStatusLabels[event.status]}
            </span>
          )}
        </div>
        <h3 className="text-xl font-semibold leading-snug tracking-tight">
          <Link
            to={href}
            className="decoration-orange-600 underline-offset-4 hover:underline"
          >
            {event.title}
          </Link>
        </h3>
        <div className="mt-4 space-y-2 text-sm leading-relaxed text-stone-600">
          <p className="flex items-start gap-2">
            <CalendarDays
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span>{eventTimeLabel(event)}</span>
          </p>
          {event.venueName && (
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{event.venueName}</span>
            </p>
          )}
        </div>
        {event.summary && (
          <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-stone-500">
            {event.summary}
          </p>
        )}
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div className="flex flex-wrap gap-1.5">
            {event.keywords.slice(0, 2).map((keyword) => (
              <span
                key={keyword}
                className="max-w-40 truncate rounded-md bg-stone-100 px-2 py-1 text-[11px] text-stone-600"
              >
                {keyword}
              </span>
            ))}
          </div>
          <Link
            to={href}
            aria-label={`Деталі події «${event.title}»`}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-stone-200 text-stone-700 transition group-hover:border-orange-600 group-hover:text-orange-700"
          >
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
