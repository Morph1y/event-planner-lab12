import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, X } from "lucide-react";
import { searchSchema, type SearchData } from "../../schemas/eventSearch";
import { Button } from "../ui/Button";

export function EventSearch({
  search,
  onSearch,
}: {
  search: string;
  onSearch: (value: string) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SearchData>({
    resolver: zodResolver(searchSchema),
    defaultValues: { search },
  });

  useEffect(() => {
    reset({ search });
  }, [search, reset]);

  return (
    <form
      role="search"
      aria-label="Пошук подій"
      onSubmit={handleSubmit((data) => onSearch(data.search))}
      noValidate
      className="min-w-0 flex-1"
    >
      <label htmlFor="event-search" className="sr-only">
        Пошук подій
      </label>
      <div className="flex flex-wrap gap-2 sm:flex-nowrap">
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            className="absolute left-3.5 top-3.5 size-5 text-subtle"
          />
          <input
            id="event-search"
            type="search"
            {...register("search")}
            aria-invalid={Boolean(errors.search)}
            aria-describedby={errors.search ? "event-search-error" : undefined}
            placeholder="Назва, тема або місце…"
            className="min-h-12 w-full min-w-0 rounded-xl border border-line-strong bg-surface py-3 pl-11 pr-4 text-sm placeholder:text-subtle"
          />
        </div>
        <Button type="submit" className="min-h-12">
          Знайти
        </Button>
        {search && (
          <Button
            type="button"
            variant="secondary"
            aria-label="Очистити пошук"
            onClick={() => {
              reset({ search: "" });
              onSearch("");
            }}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
      {errors.search && (
        <p id="event-search-error" className="mt-2 text-sm text-danger">
          {errors.search.message}
        </p>
      )}
    </form>
  );
}
