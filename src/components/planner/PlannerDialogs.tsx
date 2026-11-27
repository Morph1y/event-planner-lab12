import { usePlannerUi } from "../../stores/plannerUiStore";
import { usePlannerStore } from "../../hooks/usePlannerStore";
import { PersonalEventDialog } from "./PersonalEventDialog";
import { DeletePersonalEventDialog } from "./DeletePersonalEventDialog";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

export function PlannerDialogs() {
  const dialog = usePlannerUi((state) => state.dialog);
  const close = usePlannerUi((state) => state.closeDialog);
  const events = usePlannerStore((state) => state.personalEvents);
  if (!dialog) return null;
  if (dialog.mode === "create")
    return <PersonalEventDialog key="create" onClose={close} />;
  const event = events.find((value) => value.id === dialog.id);
  if (!event)
    return (
      <Modal title="Подія недоступна" onClose={close}>
        <p className="mb-5 text-sm text-muted">Цю подію вже видалено.</p>
        <Button onClick={close}>Закрити</Button>
      </Modal>
    );
  return dialog.mode === "edit" ? (
    <PersonalEventDialog key={event.id} event={event} onClose={close} />
  ) : (
    <DeletePersonalEventDialog event={event} onClose={close} />
  );
}
