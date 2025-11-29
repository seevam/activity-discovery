import OpenAI from 'openai';
import { Session1Input } from '@/types/collage';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface PersonalizationResult {
  challengePrompts: {
    [key: number]: string;
  };
  imageKeywords: string[];
  suggestedValues: string[];
  quotes: Array<{ text: string; author: string; theme: string }>;
}

export async function generatePersonalization(
  session1Input: Session1Input
): Promise<PersonalizationResult> {
  const prompt = `Analyze this student's Session 1 career discovery results and generate personalized content:

Student Profile:
- Themes: ${session1Input.themes.join(', ')}
- Interests: ${session1Input.interests.join(', ')}
- Career Clusters: ${session1Input.careerClusters.join(', ')}

Generate:
1. Personalized challenge prompts for 5 challenges (Strengths, Values, Quote, Colors/Symbols, Future Vision)
2. 10 image search keywords that match their interests
3. 5 suggested values based on their profile
4. 5 inspiring quotes that align with their themes (include author and theme for each)

Format as JSON with keys: challengePrompts (object with keys 1-5), imageKeywords (array), suggestedValues (array), quotes (array of objects with text, author, theme)

Keep tone encouraging, age-appropriate for middle school, and specific to their profile.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant for a career exploration program for middle school students. Generate encouraging, personalized content based on student profiles.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.8,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  return JSON.parse(content);
}

export interface AboutMeSuggestion {
  focus: string;
  text: string;
}

export async function generateAboutMeSuggestions(
  collageData: {
    themes: string[];
    interests: string[];
    values: string[];
    careerClusters: string[];
    quote?: string;
  }
): Promise<AboutMeSuggestion[]> {
  const prompt = `Generate 3 different "About Me" statements (50-75 words each) for a middle school student based on their identity collage:

Collage Analysis:
- Themes: ${collageData.themes.join(', ')}
- Interests: ${collageData.interests.join(', ')}
- Values: ${collageData.values.join(', ')}
- Career Clusters: ${collageData.careerClusters.join(', ')}
${collageData.quote ? `- Quote they chose: "${collageData.quote}"` : ''}

Generate 3 distinct versions:
1. One focusing on their creative/artistic side
2. One focusing on their helping/collaborative side
3. One focusing on their building/making side

Each should:
- Sound natural for a 6th-8th grader (not overly formal)
- Be authentic and personal
- Include their values and aspirations
- Be 50-75 words
- Use first person ("I'm..." not "This student...")
- Be specific to their profile (not generic)

Return as JSON array: [{ focus: "creative", text: "..." }, { focus: "collaborative", text: "..." }, { focus: "builder", text: "..." }]`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant for a career exploration program. Generate authentic, age-appropriate "About Me" statements for middle school students.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.9,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  const result = JSON.parse(content);
  return result.suggestions || [];
}

export async function generateAIImage(
  prompt: string,
  style: 'icon' | 'illustration' | 'abstract' | 'realistic' = 'illustration'
): Promise<string> {
  const styleModifiers = {
    icon: 'simple icon, flat design, minimalist, clean lines, white background',
    illustration: 'digital illustration, vibrant colors, artistic, detailed, white background',
    abstract: 'abstract art, creative, modern, artistic interpretation, colorful',
    realistic: 'photorealistic, detailed, high quality, professional'
  };

  const fullPrompt = `${prompt}, ${styleModifiers[style]}, high quality, centered composition`;

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: fullPrompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
  });

  if (!response.data || response.data.length === 0) {
    throw new Error('No image data in response');
  }

  const imageUrl = response.data[0].url;
  if (!imageUrl) {
    throw new Error('No image URL in response');
  }

  return imageUrl;
}
