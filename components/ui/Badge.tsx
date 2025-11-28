'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Badge as BadgeType } from '@/types/collage';

export interface BadgeProps {
  badge: BadgeType;
  onClick?: () => void;
  animate?: boolean;
}

export function Badge({ badge, onClick, animate = false }: BadgeProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (animate && badge.unlocked) {
      setShouldAnimate(true);
    }
  }, [animate, badge.unlocked]);

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 cursor-pointer group',
        onClick && 'hover:scale-110 transition-transform'
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          'badge',
          badge.unlocked ? (badge.special ? 'badge-master' : 'badge-unlocked') : 'badge-locked',
          shouldAnimate && 'animate-badge-unlock'
        )}
      >
        <span className={cn(!badge.unlocked && 'opacity-30')}>{badge.emoji}</span>
      </div>
      <div className="text-center">
        <div className={cn('font-bold text-sm', !badge.unlocked && 'text-gray-400')}>
          {badge.name}
        </div>
        {badge.unlocked && badge.unlockedAt && (
          <div className="text-xs text-gray-500">
            {new Date(badge.unlockedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}

export interface BadgeGridProps {
  badges: BadgeType[];
  onBadgeClick?: (badge: BadgeType) => void;
}

export function BadgeGrid({ badges, onBadgeClick }: BadgeGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {badges.map((badge) => (
        <Badge
          key={badge.id}
          badge={badge}
          onClick={() => onBadgeClick?.(badge)}
        />
      ))}
    </div>
  );
}
