import { Badge } from '@/types/collage';

export const BADGES: Record<string, Omit<Badge, 'unlocked' | 'unlockedAt'>> = {
  'strength-scout': {
    id: 'strength-scout',
    name: 'Strength Scout',
    emoji: '🏆',
    description: 'Added 3 elements showing your strengths',
    challenge: 1,
    requirement: 'Add 3 strength elements',
    stickersUnlocked: [
      '💡', '🧠', '⚡', '🔦', '💫', '🌟',
      '✨', '🎯', '🏅', '💪', '🦸', '⭐',
      '🔥', '💖', '👊', '🎨', '🔧', '🛠️',
      '📚', '🎓'
    ]
  },
  'values-champion': {
    id: 'values-champion',
    name: 'Values Champion',
    emoji: '💎',
    description: 'Showed what matters most to you',
    challenge: 2,
    requirement: 'Add 2-3 value representations',
    stickersUnlocked: [
      '❤️', '💙', '💚', '💛', '💜', '🧡',
      '🤝', '🫶', '🙏', '💫', '⭐', '✨',
      '🌟', '💖', '🌈', '☀️', '🌙', '🔮',
      '🕊️', '🦋'
    ]
  },
  'word-wizard': {
    id: 'word-wizard',
    name: 'Word Wizard',
    emoji: '💬',
    description: 'Added an inspiring quote or motto',
    challenge: 3,
    requirement: 'Add a quote',
    stickersUnlocked: [
      '💭', '💬', '🗨️', '📝', '✍️', '📖',
      '📚', '🔖', '🖊️', '🖋️', '✒️', '📜',
      '📄', '📃', '🗒️', '📋', '🎭', '🎪',
      '🎨', '🖼️'
    ]
  },
  'color-creator': {
    id: 'color-creator',
    name: 'Color Creator',
    emoji: '🎨',
    description: 'Painted your personality with colors',
    challenge: 4,
    requirement: 'Add colors & 2-3 symbols',
    stickersUnlocked: [
      '🎨', '🖌️', '🖍️', '🎭', '🌈', '💐',
      '🌸', '🌺', '🌻', '🌷', '🌹', '🏵️',
      '🎀', '🎁', '🎉', '🎊', '🎈', '🎆',
      '✨', '💫'
    ]
  },
  'visionary': {
    id: 'visionary',
    name: 'Visionary',
    emoji: '🚀',
    description: 'Showed where you\'re headed',
    challenge: 5,
    requirement: 'Add 1-2 future vision elements',
    stickersUnlocked: [
      '🚀', '🌟', '💫', '⭐', '🌠', '🔭',
      '🗺️', '🧭', '⛰️', '🏔️', '🎯', '🏆',
      '👑', '💎', '🔑', '🚪', '🌈', '☀️',
      '🌅', '🌄'
    ]
  },
  'storyteller-master': {
    id: 'storyteller-master',
    name: 'Master Storyteller',
    emoji: '⭐',
    description: 'Completed all challenges & told your story!',
    challenge: 'final',
    requirement: 'Complete all 5 challenges + About Me',
    special: true,
    stickersUnlocked: []
  }
};

export const BASIC_STICKERS = ['😀', '😊', '🎉', '❤️', '⭐', '✨', '💫', '🌟'];

export function getUnlockedStickers(badgeIds: string[]): string[] {
  const allStickers = new Set(BASIC_STICKERS);

  badgeIds.forEach(badgeId => {
    const badge = BADGES[badgeId];
    if (badge && badge.stickersUnlocked) {
      badge.stickersUnlocked.forEach(s => allStickers.add(s));
    }
  });

  return Array.from(allStickers);
}
