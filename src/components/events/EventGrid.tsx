import type { Event } from "../../types/events";
import { EventCard } from "./EventCard";

export function EventGrid({ events }: { events: Event[] }) {
  return (
    <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {events.map((event) => (
        <li key={event.id} className="min-w-0">
          <EventCard event={event} />
        </li>
      ))}
    </ul>
  );
}

export function EventGridSkeleton() {
  return (
    <div>
      <p role="status" className="sr-only">
        Завантаження подій…
      </p>
      <div
        aria-hidden="true"
        className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="animate-pulse overflow-hidden rounded-2xl border border-stone-200 bg-white motion-reduce:animate-none"
          >
            <div className="aspect-[16/10] bg-stone-200" />
            <div className="space-y-4 p-5">
              <div className="h-4 w-1/3 rounded bg-stone-100" />
              <div className="h-6 w-4/5 rounded bg-stone-200" />
              <div className="h-4 w-3/5 rounded bg-stone-100" />
              <div className="h-4 w-4/5 rounded bg-stone-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
