'use client';

import { Badge as BadgeType } from '@/types/collage';
import { Badge } from '@/components/ui/Badge';
import { BADGES } from '@/lib/constants/badges';

interface BadgeSidebarProps {
  unlockedBadges: string[];
  onBadgeClick?: (badge: BadgeType) => void;
}

export function BadgeSidebar({ unlockedBadges, onBadgeClick }: BadgeSidebarProps) {
  const badges: BadgeType[] = Object.values(BADGES).map((badge) => ({
    ...badge,
    unlocked: unlockedBadges.includes(badge.id),
    unlockedAt: unlockedBadges.includes(badge.id) ? new Date() : undefined,
  }));

  return (
    <div className="p-4 space-y-4 border-t">
      <h3 className="text-lg font-bold text-gray-900">🏆 Your Badges</h3>

      <div className="space-y-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`p-3 rounded-xl border-2 transition-all ${
              badge.unlocked
                ? 'border-badge-gold bg-yellow-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`text-3xl ${
                  !badge.unlocked && 'opacity-30 grayscale'
                }`}
              >
                {badge.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h4
                  className={`font-bold text-sm mb-0.5 ${
                    badge.unlocked ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {badge.name}
                </h4>
                <p
                  className={`text-xs ${
                    badge.unlocked ? 'text-gray-600' : 'text-gray-400'
                  }`}
                >
                  {badge.description}
                </p>

                {!badge.unlocked && (
                  <div className="mt-1">
                    <span className="text-xs font-semibold text-gray-500">
                      🔒 {badge.requirement}
                    </span>
                  </div>
                )}

                {badge.unlocked && badge.stickersUnlocked.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {badge.stickersUnlocked.slice(0, 6).map((sticker, idx) => (
                      <span key={idx} className="text-sm">
                        {sticker}
                      </span>
                    ))}
                    {badge.stickersUnlocked.length > 6 && (
                      <span className="text-xs text-gray-500">
                        +{badge.stickersUnlocked.length - 6} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-4">
        <div className="text-center">
          <div className="text-xl font-bold text-purple-600 mb-1">
            {unlockedBadges.length}/6
          </div>
          <div className="text-sm text-gray-700">Badges Earned</div>

          {unlockedBadges.length === 6 && (
            <div className="mt-2 text-xs font-bold text-purple-600 animate-pulse">
              🎉 All Badges Unlocked!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
