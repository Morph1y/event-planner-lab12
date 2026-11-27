import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import type { PersonalEvent } from "../../types/planner";
import { personalEventRepository } from "../../repositories/personalEventRepository";
import { usePlannerUi } from "../../stores/plannerUiStore";

export function DeletePersonalEventDialog({
  event,
  onClose,
}: {
  event: PersonalEvent;
  onClose: () => void;
}) {
  const notify = usePlannerUi((state) => state.notify);
  const navigate = useNavigate();
  const location = useLocation();
  const mutation = useMutation({
    mutationKey: ["personal-events", event.id],
    mutationFn: () => personalEventRepository.delete(event.id),
    onSuccess: () => {
      notify("Власну подію видалено.");
      onClose();
      if (
        location.pathname === `/my-events/${event.id}` ||
        location.pathname === `/my-events/${encodeURIComponent(event.id)}`
      ) {
        navigate("/my-events", { replace: true });
      }
    },
    onError: (error) => notify(error.message, "error"),
  });

  return (
    <Modal title="Видалити подію?" busy={mutation.isPending} onClose={onClose}>
      <p className="break-words text-sm leading-relaxed text-muted">
        Подію «{event.title}» буде видалено з твоїх планів.
      </p>
      {mutation.isError && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {mutation.error.message}
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button
          variant="secondary"
          disabled={mutation.isPending}
          onClick={onClose}
        >
          Скасувати
        </Button>
        <Button disabled={mutation.isPending} onClick={() => mutation.mutate()}>
          {mutation.isPending ? "Видалення…" : "Видалити подію"}
        </Button>
      </div>
    </Modal>
  );
}
