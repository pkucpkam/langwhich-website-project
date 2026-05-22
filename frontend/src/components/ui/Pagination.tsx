"use client";

import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(1, currentPage - 1);
      const end = Math.min(totalPages - 2, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 4) pages.push("...");
      pages.push(totalPages - 1);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        type="button"
        id="pagination-prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="px-3 py-2 text-sm rounded-lg border border-[#1F2937] text-[#9CA3AF] hover:border-[#2563EB] hover:text-[#F9FAFB] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
      >
        ←
      </button>

      {getPages().map((page, idx) =>
        page === "..." ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-[#9CA3AF]">
            …
          </span>
        ) : (
          <button
            type="button"
            key={page}
            id={`pagination-page-${page}`}
            onClick={() => onPageChange(page as number)}
            className={cn(
              "w-9 h-9 text-sm rounded-lg border transition-all duration-200",
              currentPage === page
                ? "bg-[#2563EB] border-[#2563EB] text-white font-semibold"
                : "border-[#1F2937] text-[#9CA3AF] hover:border-[#2563EB] hover:text-[#F9FAFB]"
            )}
          >
            {(page as number) + 1}
          </button>
        )
      )}

      <button
        type="button"
        id="pagination-next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="px-3 py-2 text-sm rounded-lg border border-[#1F2937] text-[#9CA3AF] hover:border-[#2563EB] hover:text-[#F9FAFB] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
      >
        →
      </button>
    </div>
  );
}
