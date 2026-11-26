import { useMutation } from "@tanstack/react-query";
import { Heart, LoaderCircle } from "lucide-react";
import { usePlannerStore } from "../../hooks/usePlannerStore";
import { plannerStore } from "../../stores/plannerStore";
import { usePlannerUi } from "../../stores/plannerUiStore";

export function FavoriteButton({
  id,
  title,
  compact = false,
}: {
  id: string;
  title: string;
  compact?: boolean;
}) {
  const saved = usePlannerStore((state) => state.favoriteIds.includes(id));
  const notify = usePlannerUi((state) => state.notify);
  const mutation = useMutation({
    mutationKey: ["favorites", id],
    mutationFn: async () => plannerStore.getState().toggleFavorite(id),
    onSuccess: (favorite) =>
      notify(
        favorite ? "Подію додано в обране." : "Подію прибрано з обраного.",
      ),
    onError: (error) => notify(error.message, "error"),
  });

  return (
    <button
      type="button"
      disabled={mutation.isPending}
      aria-pressed={saved}
      aria-label={`${saved ? "Прибрати з обраного" : "Додати до обраного"}: ${title}`}
      onClick={() => mutation.mutate()}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-stone-200 bg-white/95 text-sm font-semibold shadow-sm transition hover:border-orange-700 disabled:opacity-50 ${compact ? "size-11" : "w-full px-4 py-2.5"} ${saved ? "text-orange-700" : "text-stone-700"}`}
    >
      {mutation.isPending ? (
        <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
      ) : (
        <Heart
          className="size-5"
          fill={saved ? "currentColor" : "none"}
          aria-hidden="true"
        />
      )}
      {!compact && (saved ? "В обраному" : "Зберегти в обране")}
    </button>
  );
}
