import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

export function NotFoundPage() {
  return (
    <section className="py-16">
      <p className="mb-4 text-sm font-semibold text-orange-800">404</p>
      <h1 className="text-4xl font-semibold tracking-tight">
        Сторінку не знайдено
      </h1>
      <Link
        to="/events"
        className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        До каталогу подій
      </Link>
    </section>
  );
}
