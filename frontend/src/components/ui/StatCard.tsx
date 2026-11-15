import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  variant?: 'white' | 'teal';
  icon?: React.ReactNode;
  detailLink?: string;
  detailText?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  variant = 'white',
  icon,
  detailLink,
  detailText = 'Xem chi tiết',
  className = '',
}) => {
  if (variant === 'teal') {
    return (
      <div
        className={`bg-primary text-white p-5 rounded-xl shadow-xs card-hover flex flex-col justify-between h-[130px] relative overflow-hidden ${className}`}
      >
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-primary-light uppercase tracking-wider">{title}</span>
          {icon && <div className="text-white/90">{icon}</div>}
        </div>
        <div>
          <div className="text-2xl sm:text-[28px] font-bold leading-none tracking-tight">{value}</div>
          {subtext && <div className="text-xs text-primary-light mt-1.5 font-medium">{subtext}</div>}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white border border-border p-5 rounded-xl shadow-xs card-hover flex flex-col justify-between h-[130px] relative overflow-hidden ${className}`}
    >
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">{title}</span>
        {icon && <div className="text-textSecondary">{icon}</div>}
      </div>
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-2xl sm:text-[28px] font-bold text-textPrimary leading-none tracking-tight">{value}</div>
          {subtext && <div className="text-xs text-textSecondary font-medium mt-1.5">{subtext}</div>}
        </div>
        {detailLink && (
          <Link
            to={detailLink}
            className="text-xs font-semibold text-primary hover:text-primary-dark inline-flex items-center gap-0.5 group transition-colors"
          >
            {detailText}
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
};


