import { CollageTemplate } from '@/types/collage';

export const TEMPLATES: CollageTemplate[] = [
  {
    id: 'grid',
    name: 'Grid Layout',
    description: 'Organized & Balanced',
    type: 'grid',
    zones: [
      { type: 'strengths', position: 'top-left', label: 'Your Strengths' },
      { type: 'values', position: 'top-center', label: 'Your Values' },
      { type: 'interests', position: 'top-right', label: 'Your Interests' },
      { type: 'quote', position: 'middle-center', label: 'Your Motto' },
      { type: 'colors', position: 'bottom-left', label: 'Your Colors' },
      { type: 'future', position: 'bottom-right', label: 'Your Vision' }
    ],
    backgroundColor: '#FFFFFF',
    gridLines: true
  },
  {
    id: 'circular',
    name: 'Circular Focus',
    description: 'Centered & Personal',
    type: 'circular',
    zones: [
      { type: 'center', position: 'center', label: 'About Me', size: 'large' },
      { type: 'orbit', position: 'surrounding', label: 'Surrounding Elements' }
    ],
    backgroundColor: '#BCF2F6',
    gridLines: false
  },
  {
    id: 'freeform',
    name: 'Freeform Scatter',
    description: 'Creative & Artistic',
    type: 'freeform',
    zones: [
      { type: 'flexible', position: 'anywhere', label: 'Place anywhere!' }
    ],
    backgroundColor: '#FFFFFF',
    gridLines: false
  },
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Complete Freedom',
    type: 'blank',
    zones: [],
    backgroundColor: '#FFFFFF',
    gridLines: false
  },
  {
    id: 'prefilled',
    name: 'Pre-filled Starter',
    description: 'Jumpstart based on your Session 1',
    type: 'prefilled',
    zones: [],
    backgroundColor: '#FFFFFF',
    gridLines: false
  }
];
