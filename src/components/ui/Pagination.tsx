import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "./Button";

interface PaginationProps {
  page: number;
  pageSize: number;
  count: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  pageSize,
  count,
  hasNextPage,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  return (
    <nav
      aria-label="Сторінки подій"
      className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-stone-300 pt-6"
    >
      <Button
        variant="secondary"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        <span>Назад</span>
      </Button>
      <span aria-live="polite" className="text-sm text-stone-600">
        Сторінка {page} з {totalPages}
      </span>
      <Button
        variant="secondary"
        disabled={!hasNextPage}
        onClick={() => onPageChange(page + 1)}
      >
        <span>Далі</span>
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
    </nav>
  );
}
