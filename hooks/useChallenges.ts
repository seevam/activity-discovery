import { useState, useCallback, useEffect } from 'react';
import { Challenge } from '@/types/collage';
import { CHALLENGES } from '@/lib/constants/challenges';

export function useChallenges(getElementsForChallenge: (id: number) => any[]) {
  const [challenges, setChallenges] = useState<Challenge[]>(
    CHALLENGES.map((c) => ({
      ...c,
      completed: false,
      elementsAdded: 0,
    }))
  );
  const [currentChallenge, setCurrentChallenge] = useState(1);
  const [completedChallenges, setCompletedChallenges] = useState<number[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);

  // Check challenge completion
  const checkChallengeCompletion = useCallback(
    (challengeId: number) => {
      const elements = getElementsForChallenge(challengeId);
      const challenge = challenges.find((c) => c.id === challengeId);

      console.log('[useChallenges] checkChallengeCompletion for challenge', challengeId);
      console.log('[useChallenges] Elements:', elements.length, '/', challenge?.requiredElements);
      console.log('[useChallenges] Already completed?', completedChallenges.includes(challengeId));

      if (!challenge) return false;

      const isComplete = elements.length >= challenge.requiredElements;

      // Update challenge state
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === challengeId
            ? { ...c, completed: isComplete, elementsAdded: elements.length }
            : c
        )
      );

      // If just completed, add to completed list
      if (isComplete && !completedChallenges.includes(challengeId)) {
        console.log('[useChallenges] Challenge newly completed! Adding to completedChallenges');
        setCompletedChallenges((prev) => [...prev, challengeId]);
        return true; // Newly completed
      }

      console.log('[useChallenges] Not newly completed (isComplete:', isComplete, ')');
      return false;
    },
    [challenges, completedChallenges, getElementsForChallenge]
  );

  // Update elements added for current challenge
  const updateChallengeProgress = useCallback(() => {
    challenges.forEach((challenge) => {
      const elements = getElementsForChallenge(challenge.id);
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === challenge.id ? { ...c, elementsAdded: elements.length } : c
        )
      );
    });
  }, [challenges, getElementsForChallenge]);

  // Mark challenge as complete (manual)
  const markChallengeComplete = useCallback(
    async (challengeId: number, collageId: string) => {
      const newlyCompleted = checkChallengeCompletion(challengeId);

      if (newlyCompleted) {
        // Call API to mark challenge complete and unlock badge
        try {
          const response = await fetch(
            `/api/collages/${collageId}/challenges/${challengeId}/complete`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                elements: getElementsForChallenge(challengeId),
              }),
            }
          );

          if (response.ok) {
            const result = await response.json();
            if (result.badgeUnlocked) {
              setUnlockedBadges((prev) => [...prev, result.badgeUnlocked.id]);
              return result.badgeUnlocked;
            }
          }
        } catch (error) {
          console.error('Failed to mark challenge complete:', error);
        }
      }

      return null;
    },
    [checkChallengeCompletion, getElementsForChallenge]
  );

  // Go to next challenge
  const nextChallenge = useCallback(() => {
    if (currentChallenge < 5) {
      setCurrentChallenge((prev) => prev + 1);
    }
    // Don't increment past challenge 5
    // The UI will show the "All Challenges Complete" message instead
  }, [currentChallenge]);

  // Go to previous challenge
  const previousChallenge = useCallback(() => {
    if (currentChallenge > 1) {
      setCurrentChallenge((prev) => prev - 1);
    }
  }, [currentChallenge]);

  return {
    challenges,
    currentChallenge,
    setCurrentChallenge,
    completedChallenges,
    unlockedBadges,
    checkChallengeCompletion,
    updateChallengeProgress,
    markChallengeComplete,
    nextChallenge,
    previousChallenge,
  };
}
