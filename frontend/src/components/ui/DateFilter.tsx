import React from 'react';
import { Calendar, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DatePreset = 'all' | 'today' | 'week' | 'month' | 'custom';

export interface DateFilterProps {
  value: {
    preset: DatePreset;
    customDate?: string; // YYYY-MM-DD
  };
  onChange: (value: { preset: DatePreset; customDate?: string }) => void;
  className?: string;
  showAllOption?: boolean;
}

export const DateFilter: React.FC<DateFilterProps> = ({
  value,
  onChange,
  className,
  showAllOption = true,
}) => {
  const { preset, customDate } = value;

  const handlePreset = (p: DatePreset) => {
    onChange({ preset: p, customDate: p === 'custom' ? customDate : undefined });
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      onChange({ preset: 'custom', customDate: val });
    } else {
      onChange({ preset: 'all', customDate: undefined });
    }
  };

  const handleClear = () => {
    onChange({ preset: 'all', customDate: undefined });
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5 text-xs', className)}>
      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1 mr-1">
        <Calendar className="w-3.5 h-3.5 text-gray-400" />
        <span>Thời gian:</span>
      </span>

      {showAllOption && (
        <button
          type="button"
          onClick={() => handlePreset('all')}
          className={cn(
            'px-2.5 py-1 rounded-lg border font-medium transition-all shadow-2xs',
            preset === 'all' && !customDate
              ? 'bg-teal-50 border-brand text-brand font-bold'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
          )}
        >
          Tất cả
        </button>
      )}

      <button
        type="button"
        onClick={() => handlePreset('today')}
        className={cn(
          'px-2.5 py-1 rounded-lg border font-medium transition-all flex items-center gap-1 shadow-2xs',
          preset === 'today'
            ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
        )}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full', preset === 'today' ? 'bg-rose-500 animate-pulse' : 'bg-gray-400')} />
        <span>Hôm nay</span>
      </button>

      <button
        type="button"
        onClick={() => handlePreset('week')}
        className={cn(
          'px-2.5 py-1 rounded-lg border font-medium transition-all shadow-2xs',
          preset === 'week'
            ? 'bg-teal-50 border-brand text-brand font-bold'
            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
        )}
      >
        7 ngày qua
      </button>

      <button
        type="button"
        onClick={() => handlePreset('month')}
        className={cn(
          'px-2.5 py-1 rounded-lg border font-medium transition-all shadow-2xs',
          preset === 'month'
            ? 'bg-teal-50 border-brand text-brand font-bold'
            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
        )}
      >
        Tháng này
      </button>

      {/* Specific Date Picker */}
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-0.5 focus-within:border-brand shadow-2xs">
        <input
          type="date"
          value={customDate || ''}
          onChange={handleCustomDateChange}
          className="text-xs bg-transparent text-gray-700 outline-none cursor-pointer h-6"
          title="Chọn ngày cụ thể"
        />
        {customDate && (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 p-0.5"
            title="Xóa chọn ngày"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

