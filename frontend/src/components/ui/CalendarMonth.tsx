import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
  addMonths,
  subMonths,
  isSameDay,
} from 'date-fns';

export interface CalendarEventDot {
  date: Date;
  type: 'due_soon' | 'overdue';
}

interface CalendarMonthProps {
  events?: CalendarEventDot[];
  onSelectDate?: (date: Date) => void;
  className?: string;
}

export const CalendarMonth: React.FC<CalendarMonthProps> = ({
  events = [],
  className = '',
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Offset: Sunday is 0 in date-fns
  const startDayOfWeek = getDay(monthStart);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <div className={`bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between ${className}`}>
      {/* Header: Title + Navigation Pill */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
          <CalendarIcon className="w-4 h-4 text-brand" />
          <span>Lịch theo tháng</span>
        </h3>

        {/* Month Selector Pill */}
        <div className="flex items-center border border-gray-200 rounded-lg px-2 py-1 bg-gray-50/80 text-xs text-gray-700 shadow-2xs space-x-1">
          <button
            onClick={prevMonth}
            className="p-0.5 hover:text-brand text-gray-500 hover:bg-white rounded transition-colors"
            title="Tháng trước"
            type="button"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="text-[11px] font-bold text-gray-800 select-none px-1">
            tháng {format(currentDate, 'MM/yyyy')}
          </span>

          <button
            onClick={nextMonth}
            className="p-0.5 hover:text-brand text-gray-500 hover:bg-white rounded transition-colors"
            title="Tháng sau"
            type="button"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Weekday headers & Calendar Grid wrapper (centered to balance vertical height) */}
      <div className="flex-1 flex flex-col justify-center py-2">
        {/* Weekday headers: Equal width 7 columns */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold mb-2">
          <span className="text-orange-600 py-1">CN</span>
          <span className="text-gray-500 py-1">T2</span>
          <span className="text-gray-500 py-1">T3</span>
          <span className="text-gray-500 py-1">T4</span>
          <span className="text-gray-500 py-1">T5</span>
          <span className="text-gray-500 py-1">T6</span>
          <span className="text-gray-500 py-1">T7</span>
        </div>

        {/* Calendar Grid: Perfectly even square cells */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Leading empty days */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square h-9 w-9 sm:h-9.5 sm:w-9.5 mx-auto" />
          ))}

          {/* Days in Month */}
          {daysInMonth.map((day) => {
            const isSun = getDay(day) === 0;
            const isCurrentDay = isToday(day);
            const dayEvents = events.filter((e) => isSameDay(e.date, day));

            return (
              <div
                key={day.toISOString()}
                className={`aspect-square h-9 w-9 sm:h-9.5 sm:w-9.5 mx-auto flex flex-col items-center justify-center text-xs relative select-none rounded-lg transition-all ${
                  isCurrentDay
                    ? 'border-2 border-brand font-bold text-brand bg-teal-50/60 shadow-2xs'
                    : 'text-gray-700 font-medium hover:bg-gray-50'
                }`}
              >
                <span className={isSun ? 'text-orange-600 font-bold' : ''}>
                  {format(day, 'd')}
                </span>

                {/* Event indicators */}
                {dayEvents.length > 0 && (
                  <div className="flex space-x-0.5 absolute bottom-1">
                    {dayEvents.map((evt, idx) => (
                      <span
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full ${
                          evt.type === 'overdue' ? 'bg-red-500' : 'bg-amber-500'
                        }`}
                        title={evt.type === 'overdue' ? 'Quá hạn trả' : 'Sắp đến hạn'}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend footer */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center sm:justify-end space-x-4 text-[11px] text-gray-500">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Sắp đến hạn</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span>Quá hạn</span>
        </div>
      </div>
    </div>
  );
};
