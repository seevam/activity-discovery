-- Identity Collage Builder - Database Schema
-- Run this SQL in your Neon SQL Editor to create all tables

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Main collages table
CREATE TABLE IF NOT EXISTS identity_collages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress',

    -- Session 1 input (stored as JSONB)
    session1_themes JSONB NOT NULL,
    session1_interests JSONB NOT NULL,
    session1_clusters JSONB NOT NULL,

    -- Template & canvas
    template_type VARCHAR(50) NOT NULL,
    canvas_width INTEGER NOT NULL DEFAULT 800,
    canvas_height INTEGER NOT NULL DEFAULT 600,
    canvas_json JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Challenge completion flags
    challenge1_complete BOOLEAN DEFAULT FALSE,
    challenge2_complete BOOLEAN DEFAULT FALSE,
    challenge3_complete BOOLEAN DEFAULT FALSE,
    challenge4_complete BOOLEAN DEFAULT FALSE,
    challenge5_complete BOOLEAN DEFAULT FALSE,
    final_challenge_complete BOOLEAN DEFAULT FALSE,

    -- Badges earned (array of badge IDs)
    badges_earned JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- About Me statement
    about_me TEXT,

    -- Metadata
    time_spent_seconds INTEGER DEFAULT 0,
    element_count INTEGER DEFAULT 0,

    -- Export URLs
    pdf_url TEXT,
    png_url TEXT,
    share_link TEXT
);

-- 2. Challenge elements tracking table
CREATE TABLE IF NOT EXISTS collage_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collage_id UUID NOT NULL,
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
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Foreign key constraint
    CONSTRAINT fk_collage
        FOREIGN KEY (collage_id)
        REFERENCES identity_collages(id)
        ON DELETE CASCADE
);

-- 3. Badge unlocks table
CREATE TABLE IF NOT EXISTS badge_unlocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collage_id UUID NOT NULL,
    student_id TEXT NOT NULL,
    badge_id VARCHAR(50) NOT NULL,
    unlocked_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Foreign key constraint
    CONSTRAINT fk_badge_collage
        FOREIGN KEY (collage_id)
        REFERENCES identity_collages(id)
        ON DELETE CASCADE
);

-- 4. Activity analytics table
CREATE TABLE IF NOT EXISTS collage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collage_id UUID,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Foreign key constraint (nullable for global events)
    CONSTRAINT fk_analytics_collage
        FOREIGN KEY (collage_id)
        REFERENCES identity_collages(id)
        ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_collages_student_id ON identity_collages(student_id);
CREATE INDEX IF NOT EXISTS idx_collages_status ON identity_collages(status);
CREATE INDEX IF NOT EXISTS idx_collages_created_at ON identity_collages(created_at);

CREATE INDEX IF NOT EXISTS idx_elements_collage_id ON collage_elements(collage_id);
CREATE INDEX IF NOT EXISTS idx_elements_challenge ON collage_elements(challenge_number);

CREATE INDEX IF NOT EXISTS idx_badges_collage_id ON badge_unlocks(collage_id);
CREATE INDEX IF NOT EXISTS idx_badges_student_id ON badge_unlocks(student_id);
CREATE INDEX IF NOT EXISTS idx_badges_badge_id ON badge_unlocks(badge_id);

CREATE INDEX IF NOT EXISTS idx_analytics_collage_id ON collage_analytics(collage_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON collage_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON collage_analytics(timestamp);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at on identity_collages
DROP TRIGGER IF EXISTS update_identity_collages_updated_at ON identity_collages;
CREATE TRIGGER update_identity_collages_updated_at
    BEFORE UPDATE ON identity_collages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('identity_collages', 'collage_elements', 'badge_unlocks', 'collage_analytics')
ORDER BY table_name;

-- Show table structures
\d identity_collages
\d collage_elements
\d badge_unlocks
\d collage_analytics
