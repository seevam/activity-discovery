# Setup Guide - Identity Collage Builder

Complete guide to getting the Identity Collage Builder up and running.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- GitHub account (for Vercel deployment)
- Neon account (for PostgreSQL database)
- OpenAI API account
- Unsplash Developer account

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd activity-discovery
npm install
```

This will install all required packages including:
- Next.js, React, TypeScript
- Tailwind CSS
- Drizzle ORM
- Fabric.js
- OpenAI SDK
- Unsplash SDK
- jsPDF
- And more...

### 2. Set Up Neon Database

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project called "identity-collage"
3. Copy the connection string (starts with `postgresql://`)
4. Keep this tab open - you'll need it next

### 3. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your credentials
```

Your `.env` should look like:

```env
# Database (from Neon)
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# OpenAI API (from platform.openai.com)
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxx"

# Unsplash API (from unsplash.com/developers)
UNSPLASH_ACCESS_KEY="xxxxxxxxxxxxx"
UNSPLASH_SECRET_KEY="xxxxxxxxxxxxx"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
UPLOAD_MAX_SIZE=5242880
AI_CREDITS_PER_ACTIVITY=10
```

### 4. Get API Keys

#### OpenAI API Key:
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to API Keys section
4. Create new secret key
5. Copy and paste into `.env`
6. **Important**: Add credit to your account (min $5 recommended)

#### Unsplash API Key:
1. Go to [unsplash.com/developers](https://unsplash.com/developers)
2. Register as a developer
3. Create a new application
4. Name it "Identity Collage Builder"
5. Copy both Access Key and Secret Key
6. Paste into `.env`

### 5. Push Database Schema

```bash
npm run db:push
```

This will create all necessary tables in your Neon database:
- `identity_collages`
- `collage_elements`
- `badge_unlocks`
- `collage_analytics`

You can view your database using:
```bash
npm run db:studio
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the welcome screen!

## Testing the Current Build

### What Works Now:

1. **Home Page** (`/`)
   - Welcome screen with activity overview
   - "Let's Get Started" button

2. **Session 1 Input** (`/collage/session1-input`)
   - Enter 3 interest themes
   - Select interests (with custom options)
   - Choose career clusters
   - Form validation
   - Data saves to localStorage

3. **Template Selection** (`/collage/template-selection`)
   - View all 5 templates
   - Visual previews
   - Select template
   - Continue to builder (page not yet created)

### Navigation Flow:
```
Home (/)
  → Session 1 Input (/collage/session1-input)
    → Template Selection (/collage/template-selection)
      → Canvas Builder (/collage/builder) [TODO]
```

## What Still Needs to Be Built

See `README.md` for complete list, but key priorities:

1. **Canvas Builder Page** - Main collage creation interface
2. **Fabric.js Integration** - Canvas manipulation
3. **5 Challenge Components** - Individual challenge UIs
4. **Tool Panel** - Search, upload, draw, text, AI generate
5. **Badge System** - Unlock mechanics and animations
6. **API Routes** - Complete all CRUD operations
7. **PDF Export** - Generate downloadable collages
8. **Auto-save** - Real-time saving to database

## Development Tips

### Working with Fabric.js

Fabric.js requires client-side rendering. Always use `'use client'` directive:

```tsx
'use client';

import { fabric } from 'fabric';
// ... component code
```

### TypeScript Tips

All types are defined in `types/collage.ts`. Import as needed:

```tsx
import { CollageData, Challenge, Badge } from '@/types/collage';
```

### Tailwind Custom Classes

Use the custom CSS classes defined in `app/globals.css`:

```tsx
<button className="btn-primary">Primary Button</button>
<div className="card">Card Content</div>
<div className="progress-container">
  <div className="progress-fill" style={{ width: '50%' }} />
</div>
```

### Database Queries

Use Drizzle ORM:

```tsx
import { db } from '@/lib/db';
import { identityCollages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Insert
const result = await db.insert(identityCollages).values(data).returning();

// Select
const collages = await db.select().from(identityCollages).where(eq(identityCollages.studentId, id));

// Update
await db.update(identityCollages).set({ status: 'completed' }).where(eq(identityCollages.id, collageId));
```

### OpenAI Integration

Use the helper functions in `lib/api/openai.ts`:

```tsx
import { generatePersonalization, generateAboutMeSuggestions, generateAIImage } from '@/lib/api/openai';

// Generate personalization
const result = await generatePersonalization(session1Input);

// Generate About Me suggestions
const suggestions = await generateAboutMeSuggestions(collageData);

// Generate AI image
const imageUrl = await generateAIImage('a colorful heart', 'illustration');
```

## Common Issues & Solutions

### Issue: "DATABASE_URL is not defined"
**Solution**: Make sure `.env` file exists and has `DATABASE_URL` set.

### Issue: OpenAI API errors
**Solution**:
- Check API key is valid
- Ensure you have credit in your account
- Check rate limits

### Issue: Unsplash images not loading
**Solution**:
- Verify API keys are correct
- Check you haven't exceeded rate limit (50 requests/hour on free tier)
- Add `images.unsplash.com` to Next.js image domains

### Issue: Fabric.js "canvas is undefined"
**Solution**:
- Make sure component has `'use client'` directive
- Check canvas ref is properly initialized
- Ensure code runs in useEffect

### Issue: Styles not applying
**Solution**:
- Run `npm run dev` to restart dev server
- Check Tailwind config includes all content paths
- Verify className is spelled correctly

## Next Steps

1. **Build the Canvas Builder page**
   - Create `app/collage/builder/page.tsx`
   - Integrate Fabric.js canvas
   - Add challenge progression logic

2. **Create Tool Components**
   - Image search modal
   - AI image generator
   - File upload handler
   - Text editor
   - Drawing tool

3. **Implement Challenge Components**
   - One component per challenge
   - Auto-detect completion
   - Trigger badge unlocks

4. **Add API Routes**
   - Complete CRUD operations
   - Image search endpoint
   - AI generation endpoint
   - PDF export endpoint

5. **Deploy to Vercel**
   - Push to GitHub
   - Connect to Vercel
   - Add environment variables
   - Deploy!

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Identity Collage Builder"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository
5. Add environment variables:
   - `DATABASE_URL`
   - `OPENAI_API_KEY`
   - `UNSPLASH_ACCESS_KEY`
   - `UNSPLASH_SECRET_KEY`
6. Click "Deploy"

### 3. Post-Deployment

1. Run database migrations on production:
   ```bash
   # In Vercel dashboard, go to Settings > Environment Variables
   # Add DATABASE_URL
   # Then run: npm run db:push
   ```

2. Test the deployed application

3. Monitor errors in Vercel dashboard

## Support

For questions or issues:
1. Check the README.md for architecture details
2. Review this SETUP.md guide
3. Check Next.js, Fabric.js, and Drizzle documentation
4. Review the code comments in the existing files

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Fabric.js Demos](http://fabricjs.com/demos)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [OpenAI API](https://platform.openai.com/docs)
- [Unsplash API](https://unsplash.com/documentation)
- [Vercel Deployment](https://vercel.com/docs)

---

Happy building! 🚀
