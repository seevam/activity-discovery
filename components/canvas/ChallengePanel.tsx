'use client';

import { Challenge } from '@/types/collage';
import { Card } from '@/components/ui/Card';

interface ChallengePanelProps {
  challenges: Challenge[];
  currentChallenge: number;
  completedChallenges: number[];
  onSelectChallenge: (id: number) => void;
}

export function ChallengePanel({
  challenges,
  currentChallenge,
  completedChallenges,
  onSelectChallenge,
}: ChallengePanelProps) {
  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-bold text-gray-900">🎯 Challenges</h3>

      <div className="space-y-2">
        {challenges.map((challenge) => {
          const isCompleted = completedChallenges.includes(challenge.id);
          const isCurrent = challenge.id === currentChallenge;
          const isLocked = challenge.id > 1 && !completedChallenges.includes(challenge.id - 1);

          return (
            <button
              key={challenge.id}
              onClick={() => !isLocked && onSelectChallenge(challenge.id)}
              disabled={isLocked}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                isCurrent
                  ? 'border-blue-primary bg-blue-50 shadow-md'
                  : isCompleted
                  ? 'border-green-success bg-green-50'
                  : isLocked
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  : 'border-gray-300 hover:border-blue-primary hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">
                  {isLocked ? '🔒' : isCompleted ? '✅' : challenge.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-gray-900">
                      Challenge {challenge.id}
                    </span>
                    {isCurrent && (
                      <span className="text-xs bg-blue-primary text-white px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                    {challenge.title}
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {challenge.description}
                  </p>

                  {/* Progress */}
                  {!isLocked && !isCompleted && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>
                          {challenge.elementsAdded}/{challenge.requiredElements}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-primary h-1.5 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              (challenge.elementsAdded / challenge.requiredElements) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {isCompleted && (
                    <div className="mt-2 text-xs text-green-600 font-semibold">
                      ✓ Completed!
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Overall Progress */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-ultra-light border-2 border-blue-primary">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-primary mb-1">
            {completedChallenges.length}/5
          </div>
          <div className="text-sm text-gray-700">Challenges Complete</div>
        </div>
      </Card>
    </div>
  );
}
