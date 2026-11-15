import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between border-t border-border px-4 py-3 sm:px-6 bg-white rounded-b-xl ${className}`}>
      <div className="text-xs text-textSecondary">
        {totalRecords !== undefined ? (
          <span>
            Tổng cộng: <strong className="font-semibold text-textPrimary">{totalRecords}</strong> bản ghi
          </span>
        ) : (
          <span>Trang {currentPage} / {totalPages}</span>
        )}
      </div>

      <div className="flex items-center space-x-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-border bg-white hover:bg-slate-50 text-textPrimary disabled:opacity-40 disabled:cursor-not-allowed transition-all btn-interaction shadow-2xs"
          title="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-xs font-bold px-3 py-1 bg-primary-light text-primary-dark rounded-lg">
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-border bg-white hover:bg-slate-50 text-textPrimary disabled:opacity-40 disabled:cursor-not-allowed transition-all btn-interaction shadow-2xs"
          title="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};


