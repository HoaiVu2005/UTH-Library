import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-surface border border-line rounded-lg p-4 space-y-3">
      <Skeleton className="h-40 w-full rounded" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex justify-between pt-2">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
};

