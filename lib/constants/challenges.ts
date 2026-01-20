import { Challenge } from '@/types/collage';

export const CHALLENGES: Omit<Challenge, 'completed' | 'elementsAdded'>[] = [
  {
    id: 1,
    title: 'What Are You Really Good At?',
    emoji: '🏆',
    description: 'Think about what you do well - then show it with images!',
    requirement: 'Add 3 things that show what you\'re good at',
    requiredElements: 3,
    ideas: [
      '💡 Good at solving problems? → Add a lightbulb or puzzle piece',
      '🤝 Great at helping others? → Add hands, hearts, or teamwork images',
      '🎨 Creative thinker? → Add art supplies, ideas, or colorful designs',
      '🔧 Good at building/fixing? → Add tools, gears, or machines',
      '💬 Can\'t find the right image? → Use text to write what you\'re good at!'
    ],
    examples: [
      'I\'m good at making people laugh → comedy mask 🎭',
      'I\'m great at video games → game controller 🎮',
      'I solve math problems easily → calculator or numbers'
    ]
  },
  {
    id: 2,
    title: 'What\'s Important to You?',
    emoji: '💎',
    description: 'If you could only pick 2-3 things that matter MOST in life, what would they be?',
    requirement: 'Pick 2-3 things that are super important to you, then add images for each',
    requiredElements: 2,
    helpText: 'Not sure what to pick? Think about: What makes you happy? What do you care about? What kind of person do you want to be?',
    ideas: [
      '❤️ Family & Friends → hearts, family photos, people together',
      '🌍 Helping Others/Kindness → helping hands, volunteer symbols, caring images',
      '🎨 Creativity & Self-Expression → art, music, writing, dance',
      '⚖️ Fairness & Justice → scales, equality symbols, standing up for others',
      '🌱 Nature & Animals → plants, pets, Earth, recycling',
      '📚 Learning & Growth → books, brain, school, questions',
      '🏆 Success & Achievement → trophies, goals, climbing mountains',
      '😊 Happiness & Fun → smiles, sunshine, laughter, games'
    ],
    examples: [
      'Family is everything to me → family photo or heart with "family"',
      'I care about the environment → Earth, trees, recycling symbol',
      'Being kind matters most → helping hands or heart emoji'
    ]
  },
  {
    id: 3,
    title: 'What Words Inspire You?',
    emoji: '💬',
    description: 'Pick a quote, saying, or motto that makes you feel motivated or describes how you want to live',
    requirement: 'Add 1 quote that means something to you',
    requiredElements: 1,
    helpText: 'This could be from a song, a movie, a famous person, your family, or even something YOU made up!',
    ideas: [
      '📚 Browse our Quote Library → 60+ quotes organized by theme',
      '✨ Get personalized suggestions → We\'ll suggest quotes based on your interests',
      '✍️ Write your own → Create a personal motto that\'s uniquely YOU',
      '🎨 Make it yours → Change fonts, colors, and styles to make it pop!'
    ],
    examples: [
      '"Be yourself; everyone else is taken" - Oscar Wilde',
      '"Dream big and dare to fail" - Norman Vaughan',
      'My family motto: "Work hard, stay humble"',
      'My own saying: "Create, don\'t wait!"'
    ]
  },
  {
    id: 4,
    title: 'Show Your Style & Hobbies',
    emoji: '🎨',
    description: 'What colors feel like YOU? What do you love to do for fun?',
    requirement: 'Change your background colors AND add 3 images/symbols for things you love doing',
    requiredElements: 3,
    helpText: 'This is where you make your collage uniquely YOURS with your favorite colors and hobbies!',
    ideas: [
      '🎨 Pick Your Colors:',
      '   • Click the background tool',
      '   • Choose 1-2 colors that feel like you',
      '   • Try a gradient for a cool effect!',
      '',
      '⚽ Show Your Hobbies:',
      '   • Sports you play → balls, equipment, courts',
      '   • Music you love → instruments, notes, headphones',
      '   • Games you play → controllers, dice, cards',
      '   • Art you make → paint, pencils, cameras',
      '   • Books you read → books, library, genres',
      '   • Tech you use → computers, robots, code'
    ],
    examples: [
      'Blue background + soccer ball + guitar + book = sporty, musical reader!',
      'Pink & purple gradient + paint brush + dance shoes + cat = creative, active animal lover!',
      'Green background + basketball + video game + pizza = fun-loving gamer athlete!'
    ]
  },
  {
    id: 5,
    title: 'Where Do You See Yourself Going?',
    emoji: '🚀',
    description: 'Dream big! What do you want to do, see, learn, or become in the future?',
    requirement: 'Add 1-2 images about your future dreams or goals',
    requiredElements: 1,
    helpText: 'Don\'t overthink it! This can be a BIG dream (astronaut!) or something simple (learn to skateboard). Both are perfect!',
    ideas: [
      '💼 Career Dreams:',
      '   • Doctor, teacher, engineer, artist, athlete, chef, etc.',
      '   • Search for job symbols or workplace images',
      '',
      '✈️ Places to Visit:',
      '   • Countries, cities, landmarks you want to see',
      '   • Beach, mountains, famous buildings',
      '',
      '🎯 Skills to Learn:',
      '   • Speak another language, play instrument, code, cook',
      '   • Search for the tool or activity',
      '',
      '💡 Problems to Solve:',
      '   • Help the environment, cure disease, invent something',
      '   • Search for solution symbols or impact images'
    ],
    examples: [
      'I want to be a vet → add animals and medical symbols',
      'I want to visit Japan → add Japanese landmarks or flag',
      'I want to learn guitar → add guitar image',
      'I want to help stop climate change → add Earth + recycling'
    ]
  }
];

export function getChallengeById(id: number): Omit<Challenge, 'completed' | 'elementsAdded'> | undefined {
  return CHALLENGES.find(c => c.id === id);
}
