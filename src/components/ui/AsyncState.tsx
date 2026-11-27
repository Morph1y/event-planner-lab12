import {
  CalendarSearch,
  LoaderCircle,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import { Button } from "./Button";

interface AsyncStateProps {
  kind: "loading" | "error" | "empty";
  title?: string;
  message?: string;
  onRetry?: () => void;
  onReset?: () => void;
}

export function AsyncState({
  kind,
  title,
  message,
  onRetry,
  onReset,
}: AsyncStateProps) {
  const Icon =
    kind === "loading"
      ? LoaderCircle
      : kind === "error"
        ? TriangleAlert
        : CalendarSearch;
  const defaultTitle =
    kind === "loading"
      ? "Завантаження…"
      : kind === "error"
        ? "Не вдалося завантажити дані"
        : "Подій не знайдено";

  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-line bg-surface px-6 py-10 text-center"
    >
      <Icon
        aria-hidden="true"
        className={`mb-5 size-9 text-subtle ${kind === "loading" ? "animate-spin motion-reduce:animate-none" : ""}`}
      />
      <h2 className="text-xl font-semibold">{title ?? defaultTitle}</h2>
      {message && (
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
          {message}
        </p>
      )}
      {onRetry && (
        <Button className="mt-5" variant="secondary" onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Спробувати ще
        </Button>
      )}
      {onReset && (
        <Button className="mt-5" variant="secondary" onClick={onReset}>
          Скинути фільтри
        </Button>
      )}
    </div>
  );
}
