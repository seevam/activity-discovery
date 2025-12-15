import { QuoteSuggestion } from '@/types/collage';

export interface QuoteCategory {
  id: string;
  name: string;
  emoji: string;
  quotes: QuoteSuggestion[];
}

export const QUOTE_LIBRARY: QuoteCategory[] = [
  {
    id: 'motivation',
    name: 'Motivation',
    emoji: '💪',
    quotes: [
      {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt",
        theme: "Dreams"
      },
      {
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill",
        theme: "Perseverance"
      },
      {
        text: "Believe you can and you're halfway there.",
        author: "Theodore Roosevelt",
        theme: "Confidence"
      },
      {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        theme: "Passion"
      },
      {
        text: "Don't watch the clock; do what it does. Keep going.",
        author: "Sam Levenson",
        theme: "Dedication"
      },
      {
        text: "The only limit to our realization of tomorrow will be our doubts of today.",
        author: "Franklin D. Roosevelt",
        theme: "Possibility"
      },
      {
        text: "Your limitation—it's only your imagination.",
        author: "Unknown",
        theme: "Potential"
      },
      {
        text: "Wake up with determination. Go to bed with satisfaction.",
        author: "Unknown",
        theme: "Daily Goals"
      }
    ]
  },
  {
    id: 'courage',
    name: 'Courage',
    emoji: '🦁',
    quotes: [
      {
        text: "Dream big and dare to fail.",
        author: "Norman Vaughan",
        theme: "Bravery"
      },
      {
        text: "It always seems impossible until it's done.",
        author: "Nelson Mandela",
        theme: "Perseverance"
      },
      {
        text: "Do one thing every day that scares you.",
        author: "Eleanor Roosevelt",
        theme: "Growth"
      },
      {
        text: "Fortune favors the bold.",
        author: "Virgil",
        theme: "Risk-taking"
      },
      {
        text: "You are braver than you believe, stronger than you seem, and smarter than you think.",
        author: "A.A. Milne",
        theme: "Self-belief"
      },
      {
        text: "Courage is not the absence of fear, but rather the judgment that something else is more important than fear.",
        author: "Ambrose Redmoon",
        theme: "Bravery"
      },
      {
        text: "What would you attempt to do if you knew you could not fail?",
        author: "Robert H. Schuller",
        theme: "Fearlessness"
      }
    ]
  },
  {
    id: 'creativity',
    name: 'Creativity',
    emoji: '🎨',
    quotes: [
      {
        text: "Creativity is intelligence having fun.",
        author: "Albert Einstein",
        theme: "Innovation"
      },
      {
        text: "Every child is an artist. The problem is how to remain an artist once we grow up.",
        author: "Pablo Picasso",
        theme: "Artistic Expression"
      },
      {
        text: "The world is but a canvas to our imagination.",
        author: "Henry David Thoreau",
        theme: "Vision"
      },
      {
        text: "You can't use up creativity. The more you use, the more you have.",
        author: "Maya Angelou",
        theme: "Abundance"
      },
      {
        text: "Think left and think right and think low and think high. Oh, the thinks you can think up if only you try!",
        author: "Dr. Seuss",
        theme: "Imagination"
      },
      {
        text: "Logic will get you from A to B. Imagination will take you everywhere.",
        author: "Albert Einstein",
        theme: "Innovation"
      },
      {
        text: "The creative adult is the child who survived.",
        author: "Ursula K. Le Guin",
        theme: "Wonder"
      }
    ]
  },
  {
    id: 'authenticity',
    name: 'Be Yourself',
    emoji: '⭐',
    quotes: [
      {
        text: "Be yourself; everyone else is already taken.",
        author: "Oscar Wilde",
        theme: "Uniqueness"
      },
      {
        text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
        author: "Ralph Waldo Emerson",
        theme: "Authenticity"
      },
      {
        text: "Always be a first-rate version of yourself, instead of a second-rate version of somebody else.",
        author: "Judy Garland",
        theme: "Originality"
      },
      {
        text: "Why fit in when you were born to stand out?",
        author: "Dr. Seuss",
        theme: "Individuality"
      },
      {
        text: "You were born an original. Don't die a copy.",
        author: "John Mason",
        theme: "Uniqueness"
      },
      {
        text: "Imperfection is beauty, madness is genius and it's better to be absolutely ridiculous than absolutely boring.",
        author: "Marilyn Monroe",
        theme: "Self-acceptance"
      },
      {
        text: "Don't compromise yourself. You are all you've got.",
        author: "Janis Joplin",
        theme: "Integrity"
      }
    ]
  },
  {
    id: 'learning',
    name: 'Learning',
    emoji: '📚',
    quotes: [
      {
        text: "Education is the most powerful weapon which you can use to change the world.",
        author: "Nelson Mandela",
        theme: "Knowledge"
      },
      {
        text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
        author: "Dr. Seuss",
        theme: "Growth"
      },
      {
        text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
        author: "Mahatma Gandhi",
        theme: "Curiosity"
      },
      {
        text: "Anyone who has never made a mistake has never tried anything new.",
        author: "Albert Einstein",
        theme: "Experimentation"
      },
      {
        text: "The expert in anything was once a beginner.",
        author: "Helen Hayes",
        theme: "Practice"
      },
      {
        text: "I am always doing that which I cannot do, in order that I may learn how to do it.",
        author: "Pablo Picasso",
        theme: "Challenge"
      },
      {
        text: "Tell me and I forget. Teach me and I remember. Involve me and I learn.",
        author: "Benjamin Franklin",
        theme: "Experience"
      }
    ]
  },
  {
    id: 'kindness',
    name: 'Kindness',
    emoji: '💝',
    quotes: [
      {
        text: "In a world where you can be anything, be kind.",
        author: "Unknown",
        theme: "Compassion"
      },
      {
        text: "No act of kindness, no matter how small, is ever wasted.",
        author: "Aesop",
        theme: "Impact"
      },
      {
        text: "Kindness is a language which the deaf can hear and the blind can see.",
        author: "Mark Twain",
        theme: "Universal"
      },
      {
        text: "Be the change you wish to see in the world.",
        author: "Mahatma Gandhi",
        theme: "Action"
      },
      {
        text: "Throw kindness around like confetti.",
        author: "Unknown",
        theme: "Generosity"
      },
      {
        text: "How wonderful it is that nobody need wait a single moment before starting to improve the world.",
        author: "Anne Frank",
        theme: "Initiative"
      },
      {
        text: "We rise by lifting others.",
        author: "Robert Ingersoll",
        theme: "Support"
      }
    ]
  },
  {
    id: 'leadership',
    name: 'Leadership',
    emoji: '👑',
    quotes: [
      {
        text: "A leader is one who knows the way, goes the way, and shows the way.",
        author: "John C. Maxwell",
        theme: "Guidance"
      },
      {
        text: "Don't tell people how to do things, tell them what to do and let them surprise you with their results.",
        author: "George S. Patton",
        theme: "Empowerment"
      },
      {
        text: "The greatest leader is not necessarily the one who does the greatest things. They are the one that gets the people to do the greatest things.",
        author: "Ronald Reagan",
        theme: "Inspiration"
      },
      {
        text: "If your actions inspire others to dream more, learn more, do more and become more, you are a leader.",
        author: "John Quincy Adams",
        theme: "Influence"
      },
      {
        text: "A good leader takes a little more than their share of the blame, a little less than their share of the credit.",
        author: "Arnold H. Glasow",
        theme: "Responsibility"
      },
      {
        text: "Leadership is not about being in charge. It's about taking care of those in your charge.",
        author: "Simon Sinek",
        theme: "Service"
      }
    ]
  },
  {
    id: 'teamwork',
    name: 'Teamwork',
    emoji: '🤝',
    quotes: [
      {
        text: "Alone we can do so little; together we can do so much.",
        author: "Helen Keller",
        theme: "Collaboration"
      },
      {
        text: "Teamwork makes the dream work.",
        author: "John C. Maxwell",
        theme: "Unity"
      },
      {
        text: "Coming together is a beginning, staying together is progress, and working together is success.",
        author: "Henry Ford",
        theme: "Progress"
      },
      {
        text: "If everyone is moving forward together, then success takes care of itself.",
        author: "Henry Ford",
        theme: "Alignment"
      },
      {
        text: "Great things in business are never done by one person. They're done by a team of people.",
        author: "Steve Jobs",
        theme: "Collective Achievement"
      },
      {
        text: "None of us is as smart as all of us.",
        author: "Ken Blanchard",
        theme: "Wisdom"
      }
    ]
  },
  {
    id: 'perseverance',
    name: 'Never Give Up',
    emoji: '🔥',
    quotes: [
      {
        text: "Fall seven times, stand up eight.",
        author: "Japanese Proverb",
        theme: "Resilience"
      },
      {
        text: "I have not failed. I've just found 10,000 ways that won't work.",
        author: "Thomas Edison",
        theme: "Learning from Failure"
      },
      {
        text: "Success is the sum of small efforts repeated day in and day out.",
        author: "Robert Collier",
        theme: "Consistency"
      },
      {
        text: "The only impossible journey is the one you never begin.",
        author: "Tony Robbins",
        theme: "Starting"
      },
      {
        text: "It does not matter how slowly you go as long as you do not stop.",
        author: "Confucius",
        theme: "Persistence"
      },
      {
        text: "You just can't beat the person who never gives up.",
        author: "Babe Ruth",
        theme: "Determination"
      },
      {
        text: "Our greatest weakness lies in giving up. The most certain way to succeed is always to try just one more time.",
        author: "Thomas Edison",
        theme: "Tenacity"
      }
    ]
  }
];

// Get all quotes across all categories
export function getAllQuotes(): QuoteSuggestion[] {
  return QUOTE_LIBRARY.flatMap(category => category.quotes);
}

// Search quotes by text or author
export function searchQuotes(query: string): QuoteSuggestion[] {
  const lowercaseQuery = query.toLowerCase();
  return getAllQuotes().filter(
    quote =>
      quote.text.toLowerCase().includes(lowercaseQuery) ||
      quote.author.toLowerCase().includes(lowercaseQuery) ||
      quote.theme.toLowerCase().includes(lowercaseQuery)
  );
}

// Get quotes by category
export function getQuotesByCategory(categoryId: string): QuoteSuggestion[] {
  const category = QUOTE_LIBRARY.find(cat => cat.id === categoryId);
  return category ? category.quotes : [];
}

// Get a random selection of quotes
export function getRandomQuotes(count: number = 5): QuoteSuggestion[] {
  const allQuotes = getAllQuotes();
  const shuffled = [...allQuotes].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
