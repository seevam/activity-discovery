'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({ value, max = 100, showLabel = true, label, className }: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      <div className="progress-container">
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
        {showLabel && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-gray-800 z-10">
            {label || `${Math.round(percentage)}%`}
          </div>
        )}
      </div>
    </div>
  );
}
