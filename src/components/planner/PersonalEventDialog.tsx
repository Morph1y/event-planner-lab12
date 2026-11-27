import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import {
  personalCategories,
  personalCategoryLabels,
  type PersonalEvent,
} from "../../types/planner";
import {
  personalEventFormSchema,
  type PersonalEventFormValues,
  type PersonalEventFormData,
} from "../../schemas/personalEvent";
import { toLocalDateTime } from "../../utils/localDateTime";
import { personalEventRepository } from "../../repositories/personalEventRepository";
import { usePlannerUi } from "../../stores/plannerUiStore";

const inputClass =
  "mt-2 min-h-11 w-full min-w-0 rounded-xl border border-line-strong bg-surface px-3 py-2.5 text-sm disabled:bg-soft";

export function PersonalEventDialog({
  event,
  onClose,
}: {
  event?: PersonalEvent;
  onClose: () => void;
}) {
  const notify = usePlannerUi((state) => state.notify);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PersonalEventFormValues, unknown, PersonalEventFormData>({
    resolver: zodResolver(personalEventFormSchema),
    defaultValues: {
      title: event?.title ?? "",
      description: event?.description ?? "",
      category: event?.category ?? "meeting",
      location: event?.location ?? "",
      startsAt: event ? toLocalDateTime(event.startsAt) : "",
      endsAt: event ? toLocalDateTime(event.endsAt) : "",
      isFree: event ? event.price === 0 : true,
      price: event && event.price > 0 ? String(event.price) : "",
    },
  });
  const isFree = useWatch({ control, name: "isFree" });
  const mutation = useMutation({
    mutationKey: ["personal-events", event?.id ?? "create"],
    mutationFn: (values: PersonalEventFormData) => {
      const draft = {
        title: values.title,
        description: values.description,
        category: values.category,
        location: values.location,
        startsAt: new Date(values.startsAt).toISOString(),
        endsAt: new Date(values.endsAt).toISOString(),
        price: values.isFree ? 0 : Number(values.price),
      };
      return event
        ? personalEventRepository.update(event.id, draft)
        : personalEventRepository.create(draft);
    },
    onSuccess: () => {
      notify(event ? "Зміни події збережено." : "Власну подію створено.");
      onClose();
    },
    onError: (error) => notify(error.message, "error"),
  });
  const busy = isSubmitting || mutation.isPending;

  return (
    <Modal
      title={event ? "Редагувати подію" : "Нова подія"}
      busy={busy}
      onClose={onClose}
    >
      <form
        noValidate
        onSubmit={handleSubmit((values) => {
          mutation.mutate(values);
        })}
      >
        <fieldset
          disabled={busy}
          className="min-w-0 space-y-4 border-0 p-0 disabled:opacity-65"
        >
          <div>
            <label htmlFor="personal-title" className="text-sm font-semibold">
              Назва події
            </label>
            <input
              id="personal-title"
              {...register("title")}
              aria-invalid={!!errors.title}
              aria-describedby={
                errors.title ? "personal-title-error" : undefined
              }
              placeholder="Наприклад, вечір живої музики"
              className={inputClass}
            />
            {errors.title && (
              <p
                id="personal-title-error"
                className="mt-1 text-sm text-danger"
              >
                {errors.title.message}
              </p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="personal-start" className="text-sm font-semibold">
                Початок
              </label>
              <input
                id="personal-start"
                type="datetime-local"
                {...register("startsAt")}
                aria-invalid={!!errors.startsAt}
                aria-describedby={
                  errors.startsAt ? "personal-start-error" : "personal-timezone"
                }
                className={inputClass}
              />
              {errors.startsAt && (
                <p
                  id="personal-start-error"
                  className="mt-1 text-sm text-danger"
                >
                  {errors.startsAt.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="personal-end" className="text-sm font-semibold">
                Завершення
              </label>
              <input
                id="personal-end"
                type="datetime-local"
                {...register("endsAt")}
                aria-invalid={!!errors.endsAt}
                aria-describedby={
                  errors.endsAt ? "personal-end-error" : "personal-timezone"
                }
                className={inputClass}
              />
              {errors.endsAt && (
                <p
                  id="personal-end-error"
                  className="mt-1 text-sm text-danger"
                >
                  {errors.endsAt.message}
                </p>
              )}
            </div>
          </div>
          <p id="personal-timezone" className="text-xs text-subtle">
            Час твого пристрою ·{" "}
            {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </p>
          <div>
            <label
              htmlFor="personal-location"
              className="text-sm font-semibold"
            >
              Місце
            </label>
            <input
              id="personal-location"
              {...register("location")}
              aria-invalid={!!errors.location}
              aria-describedby={
                errors.location ? "personal-location-error" : undefined
              }
              placeholder="Назва локації або адреса"
              className={inputClass}
            />
            {errors.location && (
              <p
                id="personal-location-error"
                className="mt-1 text-sm text-danger"
              >
                {errors.location.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="personal-category"
              className="text-sm font-semibold"
            >
              Категорія
            </label>
            <select
              id="personal-category"
              {...register("category")}
              className={inputClass}
            >
              {personalCategories.map((category) => (
                <option key={category} value={category}>
                  {personalCategoryLabels[category]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input
                type="checkbox"
                {...register("isFree")}
                className="size-4 accent-orange-700"
              />
              Безкоштовна подія
            </label>
            {!isFree && (
              <div>
                <label
                  htmlFor="personal-price"
                  className="text-sm font-semibold"
                >
                  Вартість, €
                </label>
                <input
                  id="personal-price"
                  type="text"
                  inputMode="decimal"
                  {...register("price")}
                  aria-invalid={!!errors.price}
                  aria-describedby={
                    errors.price ? "personal-price-error" : undefined
                  }
                  placeholder="Наприклад, 12,50"
                  className={inputClass}
                />
                {errors.price && (
                  <p
                    id="personal-price-error"
                    className="mt-1 text-sm text-danger"
                  >
                    {errors.price.message}
                  </p>
                )}
              </div>
            )}
          </div>
          <div>
            <label
              htmlFor="personal-description"
              className="text-sm font-semibold"
            >
              Опис
            </label>
            <textarea
              id="personal-description"
              rows={3}
              {...register("description")}
              aria-invalid={!!errors.description}
              aria-describedby={
                errors.description ? "personal-description-error" : undefined
              }
              placeholder="Що плануєш і що варто взяти із собою?"
              className={inputClass}
            />
            {errors.description && (
              <p
                id="personal-description-error"
                className="mt-1 text-sm text-danger"
              >
                {errors.description.message}
              </p>
            )}
          </div>
          {mutation.isError && (
            <p
              role="alert"
              className="rounded-xl bg-danger-soft p-3 text-sm leading-relaxed text-danger"
            >
              {mutation.error.message}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-5">
            <Button type="button" variant="secondary" onClick={onClose}>
              Скасувати
            </Button>
            <Button type="submit">
              {busy && (
                <LoaderCircle
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              {busy
                ? "Збереження…"
                : event
                  ? "Зберегти зміни"
                  : "Створити подію"}
            </Button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
