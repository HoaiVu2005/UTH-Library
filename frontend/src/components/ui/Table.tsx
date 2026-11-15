import React from 'react';
import { cn } from '@/lib/utils';

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
}

export const Table: React.FC<TableProps> = ({
  children,
  className = '',
  containerClassName = '',
  ...props
}) => {
  return (
    <div
      className={cn(
        'w-full overflow-x-auto rounded-xl border border-border bg-white shadow-xs',
        containerClassName
      )}
    >
      <table className={cn('w-full text-left text-sm border-collapse', className)} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <thead className={cn('bg-slate-50/95 border-b border-border text-slate-700', className)} {...props}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tbody className={cn('divide-y divide-border/70 bg-white text-textPrimary', className)} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement> & { isSelected?: boolean }> = ({
  children,
  isSelected = false,
  className = '',
  ...props
}) => {
  return (
    <tr
      className={cn(
        'transition-colors hover:bg-teal-50/25',
        isSelected && 'bg-teal-50/40',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <th
      className={cn(
        'px-4 py-3 text-[13px] font-semibold text-slate-700 select-none whitespace-nowrap',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
};

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <td className={cn('px-4 py-3 text-[13.5px] align-middle text-textPrimary leading-normal', className)} {...props}>
      {children}
    </td>
  );
};

export const TableEmpty: React.FC<{ colSpan: number; message?: string; icon?: React.ReactNode }> = ({
  colSpan,
  message = 'Không có dữ liệu hiển thị.',
  icon,
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-textSecondary">
        <div className="flex flex-col items-center justify-center space-y-2">
          {icon && <div className="text-textSecondary/60">{icon}</div>}
          <p className="text-xs font-medium">{message}</p>
        </div>
      </td>
    </tr>
  );
};

export const TableFooter: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tfoot className={cn('bg-slate-50 border-t border-border font-semibold text-textPrimary', className)} {...props}>
      {children}
    </tfoot>
  );
};

