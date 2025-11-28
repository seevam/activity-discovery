# Identity Collage Builder - Ascend Now Career Exploration Platform

A comprehensive web application for middle school students to create visual identity collages that explore their strengths, values, interests, and future aspirations.

## 🎨 Project Overview

This is a Next.js 14 application that guides students through creating a personalized collage using:
- **5 Interactive Challenges**: Strengths, Values, Quote, Colors/Symbols, Future Vision
- **Badge System**: 6 badges to unlock as students complete challenges
- **AI-Powered Features**: OpenAI integration for personalization and image generation
- **Canvas Manipulation**: Fabric.js for drag-drop-rotate-resize functionality
- **Auto-save**: Real-time progress saving to Neon PostgreSQL database
- **Export**: PDF and PNG downloads with badge certificates

## 🚀 Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS (Duolingo-inspired design system)
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Canvas**: Fabric.js for visual manipulation
- **AI**: OpenAI GPT-4 and DALL-E 3
- **Images**: Unsplash API for free image search
- **PDF**: jsPDF for collage export
- **Deployment**: Vercel-ready

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Add your API keys to .env:
# - DATABASE_URL (from Neon)
# - OPENAI_API_KEY
# - UNSPLASH_ACCESS_KEY

# Push database schema
npm run db:push

# Run development server
npm run dev
```

## 🏗️ Project Structure

```
├── app/
│   ├── page.tsx                      # Welcome screen ✅
│   ├── layout.tsx                    # Root layout ✅
│   ├── globals.css                   # Global styles ✅
│   ├── collage/
│   │   ├── session1-input/page.tsx   # Session 1 input ✅
│   │   ├── template-selection/page.tsx # Template selection (TODO)
│   │   └── builder/page.tsx          # Main canvas builder (TODO)
│   └── api/
│       ├── collages/route.ts         # CRUD operations (TODO)
│       ├── personalize/route.ts      # AI personalization (TODO)
│       ├── images/search/route.ts    # Image search (TODO)
│       └── images/generate/route.ts  # AI image generation (TODO)
│
├── components/
│   ├── ui/                           # Reusable UI components ✅
│   │   ├── Button.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   ├── canvas/                       # Canvas-related components (TODO)
│   │   ├── FabricCanvas.tsx
│   │   ├── ToolPanel.tsx
│   │   └── ElementControls.tsx
│   ├── challenges/                   # Challenge components (TODO)
│   │   ├── Challenge1Strengths.tsx
│   │   ├── Challenge2Values.tsx
│   │   ├── Challenge3Quote.tsx
│   │   ├── Challenge4Colors.tsx
│   │   └── Challenge5Future.tsx
│   └── layout/                       # Layout components (TODO)
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── ChallengePanel.tsx
│
├── lib/
│   ├── db/
│   │   ├── schema.ts                 # Database schema ✅
│   │   └── index.ts                  # DB connection ✅
│   ├── api/
│   │   ├── openai.ts                 # OpenAI utilities ✅
│   │   └── unsplash.ts               # Unsplash utilities ✅
│   ├── constants/
│   │   ├── badges.ts                 # Badge definitions ✅
│   │   ├── templates.ts              # Template definitions ✅
│   │   └── challenges.ts             # Challenge definitions ✅
│   └── utils/
│       └── cn.ts                     # className utility ✅
│
├── types/
│   └── collage.ts                    # TypeScript types ✅
│
└── Configuration Files ✅
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── next.config.js
    ├── postcss.config.js
    └── drizzle.config.ts
```

## ✅ What's Been Built

### 1. **Core Infrastructure**
- ✅ Next.js 14 project setup with TypeScript
- ✅ Tailwind CSS with Duolingo-style design system
- ✅ Neon PostgreSQL database schema
- ✅ Drizzle ORM configuration
- ✅ Environment configuration

### 2. **Type Definitions**
- ✅ Complete TypeScript interfaces for all data structures
- ✅ Database schema types
- ✅ API response types

### 3. **Database Schema**
- ✅ `identity_collages` table
- ✅ `collage_elements` table
- ✅ `badge_unlocks` table
- ✅ `collage_analytics` table

### 4. **Constants & Configuration**
- ✅ 6 Badge definitions with sticker unlocks
- ✅ 5 Template definitions
- ✅ 5 Challenge configurations
- ✅ OpenAI integration setup
- ✅ Unsplash integration setup

### 5. **Reusable UI Components**
- ✅ Button (3 variants: primary, secondary, success)
- ✅ ProgressBar with shimmer animation
- ✅ Badge with unlock animations
- ✅ Card components
- ✅ Input/TextArea components

### 6. **Pages**
- ✅ Home/Welcome page
- ✅ Session 1 Input collection page
- 🟡 Template selection page (structure created, needs implementation)

### 7. **API Utilities**
- ✅ OpenAI personalization generator
- ✅ OpenAI About Me suggestions
- ✅ OpenAI image generation (DALL-E)
- ✅ Unsplash image search

## 🔨 What Still Needs to Be Built

### Priority 1: Core Canvas Builder

1. **Template Selection Page** (`app/collage/template-selection/page.tsx`)
   - Display 5 template options
   - Allow preview and selection
   - Generate pre-filled starter based on Session 1 input

2. **Main Canvas Builder** (`app/collage/builder/page.tsx`)
   - Fabric.js canvas integration
   - Challenge progression system
   - Tool panel integration
   - Auto-save functionality
   - Real-time progress tracking

3. **Fabric Canvas Component** (`components/canvas/FabricCanvas.tsx`)
   ```tsx
   - Initialize Fabric.js canvas
   - Element manipulation (drag, resize, rotate)
   - Layer management (bring to front/back)
   - Undo/redo history
   - Zoom and pan controls
   - Export to PNG/JSON
   ```

4. **Tool Panel** (`components/canvas/ToolPanel.tsx`)
   - Image search modal
   - AI image generator
   - File upload
   - Text editor
   - Drawing tool

### Priority 2: Challenge Components

5. **Challenge 1: Strengths** (`components/challenges/Challenge1Strengths.tsx`)
6. **Challenge 2: Values** (`components/challenges/Challenge2Values.tsx`)
7. **Challenge 3: Quote** (`components/challenges/Challenge3Quote.tsx`)
8. **Challenge 4: Colors** (`components/challenges/Challenge4Colors.tsx`)
9. **Challenge 5: Future** (`components/challenges/Challenge5Future.tsx`)
10. **Final: About Me** (`components/challenges/FinalAboutMe.tsx`)

### Priority 3: API Routes

11. **Collage CRUD** (`app/api/collages/route.ts`)
    - POST /api/collages - Create new collage
    - GET /api/collages/[id] - Get collage
    - PUT /api/collages/[id] - Update/auto-save
    - POST /api/collages/[id]/complete - Mark complete

12. **Personalization** (`app/api/personalize/route.ts`)
    - POST /api/personalize - Generate AI personalization

13. **Image Search** (`app/api/images/search/route.ts`)
    - GET /api/images/search?q=... - Search Unsplash

14. **AI Generation** (`app/api/images/generate/route.ts`)
    - POST /api/images/generate - Generate DALL-E image

15. **PDF Export** (`app/api/export/pdf/route.ts`)
    - POST /api/export/pdf - Generate PDF

### Priority 4: Polish & Features

16. **Badge Unlock Animations**
17. **Confetti Celebrations**
18. **Auto-save Indicator**
19. **Mobile Responsiveness**
20. **Error Handling**
21. **Loading States**

## 🎯 Implementation Guide

### Step 1: Create Template Selection Page

```bash
# Create the file
touch app/collage/template-selection/page.tsx
```

Key features:
- Display all 5 templates with previews
- Click to select
- Show modal with enlarged preview
- Continue to canvas builder

### Step 2: Build Canvas with Fabric.js

```bash
# Install Fabric.js types
npm install --save-dev @types/fabric
```

Create `components/canvas/FabricCanvas.tsx`:
```tsx
'use client';

import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

export function FabricCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (canvasRef.current && !fabricRef.current) {
      fabricRef.current = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: '#FFFFFF',
      });
    }

    return () => {
      fabricRef.current?.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} />;
}
```

### Step 3: Create API Routes

Example: `app/api/collages/route.ts`
```tsx
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { identityCollages } from '@/lib/db/schema';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newCollage = await db.insert(identityCollages).values(body).returning();
    return NextResponse.json(newCollage[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create collage' }, { status: 500 });
  }
}
```

### Step 4: Implement Challenges

Each challenge component should:
1. Display challenge description
2. Show progress (X/Y elements added)
3. Provide tools for adding elements
4. Auto-detect completion
5. Unlock badge when complete
6. Show celebration animation

### Step 5: Add PDF Export

Use jsPDF to generate:
1. Cover page with title and student name
2. Full collage image
3. Badge collection page
4. About Me page
5. Next steps page

## 🎨 Design System Reference

### Colors
```css
--yellow-primary: #FFF100
--blue-primary: #006BFF
--cyan-light: #08C2FF
--cyan-ultra-light: #BCF2F6
--green-success: #58CC02
--purple-creative: #CE82FF
--orange-warm: #FF9600
```

### Typography
- Font: Nunito
- Weights: 400 (regular), 600 (semi-bold), 700 (bold), 800 (extra-bold)

### Components
- Buttons have 3D shadow effect (Duolingo-style)
- Rounded corners: 12-16px
- Hover states: slight lift (-translate-y)
- Cards have subtle shadows

## 📝 Environment Variables Needed

```env
DATABASE_URL="postgresql://..."  # Get from Neon
OPENAI_API_KEY="sk-..."          # Get from OpenAI
UNSPLASH_ACCESS_KEY="..."        # Get from Unsplash
```

## 🚀 Deployment to Vercel

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main

# Deploy on Vercel
1. Import project from GitHub
2. Add environment variables
3. Deploy!
```

## 📊 Database Setup (Neon)

1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Run migrations:
   ```bash
   npm run db:push
   ```

## 🤝 Next Steps

1. Create template selection page
2. Build main canvas with Fabric.js
3. Implement all 5 challenge components
4. Create API routes
5. Add badge unlock mechanics
6. Implement PDF export
7. Add animations and polish
8. Test complete user flow
9. Deploy to Vercel

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Fabric.js Documentation](http://fabricjs.com/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [OpenAI API](https://platform.openai.com/docs)
- [Unsplash API](https://unsplash.com/documentation)

## 📄 License

This project is part of the Ascend Now Career Exploration Platform.

---

Built with ❤️ for helping students discover their potential!
