# Database Setup for Neon PostgreSQL

## Quick Setup Instructions

### Option 1: Run SQL Script (Recommended)

1. **Go to Neon Dashboard**
   - Visit [console.neon.tech](https://console.neon.tech)
   - Select your project "identity-collage"

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Or go to: https://console.neon.tech/app/projects/YOUR_PROJECT_ID/branches/main/sql-editor

3. **Copy and Run SQL**
   - Copy the entire contents of `database/init.sql`
   - Paste into the SQL Editor
   - Click "Run" button
   - Wait for success message

4. **Verify Tables Created**
   - You should see 4 tables created:
     - ✅ identity_collages
     - ✅ collage_elements
     - ✅ badge_unlocks
     - ✅ collage_analytics

---

### Option 2: Use Drizzle Push (Alternative)

If you prefer to use Drizzle ORM to create tables automatically:

```bash
# Make sure .env has DATABASE_URL
npm run db:push
```

This will read the schema from `lib/db/schema.ts` and create tables automatically.

---

## Tables Overview

### 1. **identity_collages** (Main table)
Stores all collage data including:
- Student information
- Session 1 input (themes, interests, clusters)
- Canvas data (JSON)
- Challenge completion status
- Badges earned
- About Me text
- Metadata (time spent, element count)
- Export URLs (PDF, PNG)

### 2. **collage_elements** (Element tracking)
Tracks individual elements added to canvas:
- Which challenge it belongs to
- Element type (image, text, drawing)
- Position, size, rotation
- Source (search, upload, AI, etc.)

### 3. **badge_unlocks** (Badge system)
Records when badges are unlocked:
- Which collage
- Which student
- Which badge
- When it was unlocked

### 4. **collage_analytics** (Analytics)
Tracks all events for analytics:
- Event type (challenge_completed, tool_used, etc.)
- Event data (JSON)
- Timestamp

---

## Verification Queries

After creating tables, run these to verify:

### Check all tables exist:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Check identity_collages structure:
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'identity_collages'
ORDER BY ordinal_position;
```

### Test insert (optional):
```sql
INSERT INTO identity_collages (
    student_id,
    session1_themes,
    session1_interests,
    session1_clusters,
    template_type,
    canvas_json
) VALUES (
    gen_random_uuid(),
    '["Creative", "Helper", "Builder"]'::jsonb,
    '["Coding", "Art", "Gaming"]'::jsonb,
    '["STEM", "Arts"]'::jsonb,
    'grid',
    '{}'::jsonb
);

-- Verify it was inserted
SELECT id, student_id, template_type, created_at
FROM identity_collages
ORDER BY created_at DESC
LIMIT 1;
```

---

## Troubleshooting

### Error: "extension uuid-ossp does not exist"
**Solution**: Neon should have this by default. If not, contact Neon support.

### Error: "permission denied"
**Solution**: Make sure you're connected to the correct database and have admin rights.

### Error: "table already exists"
**Solution**: Tables are already created! You're good to go. Or drop them first:
```sql
DROP TABLE IF EXISTS collage_analytics CASCADE;
DROP TABLE IF EXISTS badge_unlocks CASCADE;
DROP TABLE IF EXISTS collage_elements CASCADE;
DROP TABLE IF EXISTS identity_collages CASCADE;
```

Then run the init.sql again.

### Want to reset everything?
```sql
-- Delete all data but keep tables
TRUNCATE TABLE collage_analytics, badge_unlocks, collage_elements, identity_collages CASCADE;

-- Or drop and recreate
DROP TABLE IF EXISTS collage_analytics CASCADE;
DROP TABLE IF EXISTS badge_unlocks CASCADE;
DROP TABLE IF EXISTS collage_elements CASCADE;
DROP TABLE IF EXISTS identity_collages CASCADE;
-- Then run init.sql again
```

---

## Indexes Created

For performance, these indexes are automatically created:

- `idx_collages_student_id` - Fast student lookups
- `idx_collages_status` - Filter by status
- `idx_collages_created_at` - Sort by date
- `idx_elements_collage_id` - Fast element lookups
- `idx_elements_challenge` - Filter by challenge
- `idx_badges_collage_id` - Fast badge lookups
- `idx_badges_student_id` - Student badge history
- `idx_analytics_collage_id` - Fast analytics queries

---

## Database Diagram

```
┌─────────────────────────┐
│  identity_collages      │
│  (main table)           │
├─────────────────────────┤
│ id (PK)                 │
│ student_id              │
│ session1_themes JSONB   │
│ session1_interests JSONB│
│ canvas_json JSONB       │
│ badges_earned JSONB     │
│ challenge1-5_complete   │
│ about_me                │
└───────┬─────────────────┘
        │
        │ (1:many)
        │
        ├──────────────────────────────┐
        │                              │
        ▼                              ▼
┌──────────────────┐          ┌─────────────────┐
│ collage_elements │          │  badge_unlocks  │
├──────────────────┤          ├─────────────────┤
│ id (PK)          │          │ id (PK)         │
│ collage_id (FK)  │          │ collage_id (FK) │
│ challenge_number │          │ student_id      │
│ element_type     │          │ badge_id        │
│ position_x/y     │          │ unlocked_at     │
│ width/height     │          └─────────────────┘
└──────────────────┘
        │
        │
        ▼
┌────────────────────┐
│ collage_analytics  │
├────────────────────┤
│ id (PK)            │
│ collage_id (FK)    │
│ event_type         │
│ event_data JSONB   │
│ timestamp          │
└────────────────────┘
```

---

## Next Steps After Setup

1. ✅ Tables created in Neon
2. ✅ Copy your connection string from Neon
3. ✅ Add to `.env` as `DATABASE_URL`
4. ✅ Run `npm run dev`
5. ✅ Test the application!

---

## Monitoring & Maintenance

### Check table sizes:
```sql
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check row counts:
```sql
SELECT 'identity_collages' as table_name, COUNT(*) as row_count FROM identity_collages
UNION ALL
SELECT 'collage_elements', COUNT(*) FROM collage_elements
UNION ALL
SELECT 'badge_unlocks', COUNT(*) FROM badge_unlocks
UNION ALL
SELECT 'collage_analytics', COUNT(*) FROM collage_analytics;
```

### View recent collages:
```sql
SELECT
    id,
    student_id,
    template_type,
    status,
    element_count,
    created_at,
    completed_at
FROM identity_collages
ORDER BY created_at DESC
LIMIT 10;
```

### View badge unlock activity:
```sql
SELECT
    b.badge_id,
    COUNT(*) as unlock_count,
    MAX(b.unlocked_at) as last_unlocked
FROM badge_unlocks b
GROUP BY b.badge_id
ORDER BY unlock_count DESC;
```

---

## Success! 🎉

Your database is now ready for the Identity Collage Builder!

**Connection String Format**:
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

Add this to your `.env` file as `DATABASE_URL`.
