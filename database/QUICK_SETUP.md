# Quick Database Setup - 3 Steps

## Step 1: Go to Neon SQL Editor

1. Visit: https://console.neon.tech
2. Click on your project "identity-collage"
3. Click "SQL Editor" in left sidebar

## Step 2: Copy & Paste SQL

Copy EVERYTHING below and paste into Neon SQL Editor:

```sql
-- Create tables for Identity Collage Builder
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE identity_collages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
    session1_themes JSONB NOT NULL,
    session1_interests JSONB NOT NULL,
    session1_clusters JSONB NOT NULL,
    template_type VARCHAR(50) NOT NULL,
    canvas_width INTEGER NOT NULL DEFAULT 800,
    canvas_height INTEGER NOT NULL DEFAULT 600,
    canvas_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    challenge1_complete BOOLEAN DEFAULT FALSE,
    challenge2_complete BOOLEAN DEFAULT FALSE,
    challenge3_complete BOOLEAN DEFAULT FALSE,
    challenge4_complete BOOLEAN DEFAULT FALSE,
    challenge5_complete BOOLEAN DEFAULT FALSE,
    final_challenge_complete BOOLEAN DEFAULT FALSE,
    badges_earned JSONB NOT NULL DEFAULT '[]'::jsonb,
    about_me TEXT,
    time_spent_seconds INTEGER DEFAULT 0,
    element_count INTEGER DEFAULT 0,
    pdf_url TEXT,
    png_url TEXT,
    share_link TEXT
);

CREATE TABLE collage_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collage_id UUID NOT NULL REFERENCES identity_collages(id) ON DELETE CASCADE,
    challenge_number INTEGER,
    element_type VARCHAR(50) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    content_url TEXT,
    content_text TEXT,
    position_x INTEGER,
    position_y INTEGER,
    width INTEGER,
    height INTEGER,
    rotation INTEGER,
    z_index INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE badge_unlocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collage_id UUID NOT NULL REFERENCES identity_collages(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    badge_id VARCHAR(50) NOT NULL,
    unlocked_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE collage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collage_id UUID REFERENCES identity_collages(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collages_student_id ON identity_collages(student_id);
CREATE INDEX idx_elements_collage_id ON collage_elements(collage_id);
CREATE INDEX idx_badges_collage_id ON badge_unlocks(collage_id);
CREATE INDEX idx_analytics_collage_id ON collage_analytics(collage_id);
```

## Step 3: Click "Run"

Click the "Run" button and wait for success message!

## Verify Success

You should see output like:
```
CREATE EXTENSION
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
```

## Done! ✅

Your database is ready! Now:

1. Go back to Neon dashboard
2. Copy your connection string
3. Add to `.env` file as `DATABASE_URL`

Example:
```env
DATABASE_URL="postgresql://user:pass@ep-abc-123.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

---

## Troubleshooting

**"Table already exists"**
→ Already set up! You're good to go.

**"Permission denied"**
→ Make sure you're the project owner.

**"Extension does not exist"**
→ Should work on Neon by default. Contact support if issue persists.

---

## Need to Reset?

Run this first, then run the setup again:
```sql
DROP TABLE IF EXISTS collage_analytics CASCADE;
DROP TABLE IF EXISTS badge_unlocks CASCADE;
DROP TABLE IF EXISTS collage_elements CASCADE;
DROP TABLE IF EXISTS identity_collages CASCADE;
```

---

That's it! Database setup complete in 3 steps! 🎉
