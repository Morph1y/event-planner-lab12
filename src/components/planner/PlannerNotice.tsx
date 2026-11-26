import { useEffect } from "react";
import { CheckCircle2, TriangleAlert, X } from "lucide-react";
import { usePlannerUi } from "../../stores/plannerUiStore";

export function PlannerNotice() {
  const notice = usePlannerUi((state) => state.notice);
  const dismiss = usePlannerUi((state) => state.dismissNotice);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => dismiss(notice.id), 4500);
    return () => window.clearTimeout(timer);
  }, [notice, dismiss]);
  if (!notice) return null;
  const Icon = notice.kind === "error" ? TriangleAlert : CheckCircle2;
  return (
    <div
      role={notice.kind === "error" ? "alert" : "status"}
      className="fixed inset-x-4 bottom-4 z-50 ml-auto flex max-w-md items-start gap-3 rounded-2xl bg-stone-900 p-4 text-sm text-white shadow-xl"
    >
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <p className="flex-1 leading-relaxed">{notice.text}</p>
      <button
        type="button"
        onClick={() => dismiss(notice.id)}
        aria-label="Закрити повідомлення"
        className="rounded p-1 hover:bg-white/10"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
