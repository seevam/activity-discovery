// Core types for the Identity Collage Builder

export interface Session1Input {
  themes: string[];
  interests: string[];
  careerClusters: string[];
  customInterests?: string[];
}

export interface CollageTemplate {
  id: string;
  name: string;
  description: string;
  type: 'grid' | 'circular' | 'freeform' | 'blank' | 'prefilled';
  zones?: TemplateZone[];
  backgroundColor: string;
  gridLines?: boolean;
}

export interface TemplateZone {
  type: string;
  position: string;
  label: string;
  size?: 'small' | 'medium' | 'large';
}

export interface CanvasElement {
  id: string;
  type: 'image' | 'text' | 'drawing';
  challenge?: number;
  tags?: string[];
  source?: 'search' | 'upload' | 'ai' | 'draw' | 'text';
  content?: string;
  url?: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  style?: Record<string, any>;
}

export interface Challenge {
  id: number;
  title: string;
  emoji: string;
  description: string;
  requirement: string;
  ideas: string[];
  completed: boolean;
  elementsAdded: number;
  requiredElements: number;
  helpText?: string; // Extra explanation for students who need more context
  examples?: string[]; // Real examples students can see
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  challenge: number | 'final';
  requirement: string;
  stickersUnlocked: string[];
  unlocked: boolean;
  unlockedAt?: Date;
  special?: boolean;
}

export interface CollageData {
  id: string;
  studentId: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  status: 'in_progress' | 'completed';

  // Input data
  session1Input: Session1Input;

  // Template & canvas
  templateType: string;
  canvasWidth: number;
  canvasHeight: number;
  canvasJSON: any; // Fabric.js JSON

  // Challenge tracking
  challenges: {
    [key: number]: {
      completed: boolean;
      completedAt?: Date;
      elementsAdded: number;
    };
  };

  // Badges
  badgesEarned: string[];

  // Final outputs
  aboutMe?: string;
  pdfUrl?: string;
  pngUrl?: string;
  shareLink?: string;

  // Metadata
  timeSpentSeconds: number;
  elementCount: number;
}

export interface AIPersonalization {
  challengePrompts: {
    [key: number]: string;
  };
  imageKeywords: string[];
  suggestedValues: string[];
  quotes: QuoteSuggestion[];
}

export interface QuoteSuggestion {
  text: string;
  author: string;
  theme: string;
}

export interface ImageSearchResult {
  id: string;
  url: string;
  fullUrl: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
}

export interface AIImageGenerationParams {
  prompt: string;
  style: 'icon' | 'illustration' | 'abstract' | 'realistic';
  colorful: boolean;
}

export interface AIImageResult {
  id: string;
  url: string;
  prompt: string;
}

export interface AboutMeSuggestion {
  focus: string;
  text: string;
}

export interface ToolType {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface AutoSaveState {
  collageId: string;
  lastSaved: Date;
  saving: boolean;
  error?: string;
}
