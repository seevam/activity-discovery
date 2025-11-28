import { Challenge } from '@/types/collage';

export const CHALLENGES: Omit<Challenge, 'completed' | 'elementsAdded'>[] = [
  {
    id: 1,
    title: 'Show Your Superpowers!',
    emoji: '🏆',
    description: 'Add visual elements that represent your strengths',
    requirement: 'Add 3 elements showing your strengths',
    requiredElements: 3,
    ideas: [
      'Search for: lightbulb, hands helping, tools',
      'Draw your own symbols',
      'Add text labels with cool fonts',
      'Generate AI images that represent you'
    ]
  },
  {
    id: 2,
    title: 'What Matters Most to You?',
    emoji: '💎',
    description: 'Show your values through images and symbols',
    requirement: 'Select 2-3 values and add visuals for each',
    requiredElements: 2,
    ideas: [
      'Compassion: heart, helping hands, caring symbols',
      'Creativity: paint palette, lightbulb, artistic tools',
      'Innovation: rocket, gears, futuristic imagery'
    ]
  },
  {
    id: 3,
    title: 'Your Words to Live By',
    emoji: '💬',
    description: 'Add a quote, motto, or phrase that inspires you',
    requirement: 'Add an inspiring quote or personal motto',
    requiredElements: 1,
    ideas: [
      'Choose from our suggested quotes',
      'Browse our quote library',
      'Write your own personal motto',
      'Style it with different fonts and colors'
    ]
  },
  {
    id: 4,
    title: 'Paint Your Personality',
    emoji: '🎨',
    description: 'Add colors and symbols that represent you',
    requirement: 'Choose colors and add 3 symbols for your hobbies',
    requiredElements: 3,
    ideas: [
      'Pick 2-3 colors that feel like you',
      'Add symbols for your hobbies',
      'Include icons for your interests',
      'Represent places you love'
    ]
  },
  {
    id: 5,
    title: 'Where Are You Headed?',
    emoji: '🚀',
    description: 'Show your future goals and aspirations',
    requirement: 'Add 1-2 elements representing your future vision',
    requiredElements: 1,
    ideas: [
      'A career you\'re curious about',
      'A place you want to visit',
      'A skill you want to learn',
      'Something you want to create',
      'A problem you want to solve'
    ]
  }
];

export function getChallengeById(id: number): Omit<Challenge, 'completed' | 'elementsAdded'> | undefined {
  return CHALLENGES.find(c => c.id === id);
}
