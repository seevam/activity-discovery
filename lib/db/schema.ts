import { pgTable, uuid, text, timestamp, boolean, integer, jsonb, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Main collages table
export const identityCollages = pgTable('identity_collages', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: text('student_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  status: varchar('status', { length: 20 }).notNull().default('in_progress'),

  // Session 1 input
  session1Themes: jsonb('session1_themes').notNull(),
  session1Interests: jsonb('session1_interests').notNull(),
  session1Clusters: jsonb('session1_clusters').notNull(),

  // Template & canvas
  templateType: varchar('template_type', { length: 50 }).notNull(),
  canvasWidth: integer('canvas_width').notNull().default(800),
  canvasHeight: integer('canvas_height').notNull().default(600),
  canvasJSON: jsonb('canvas_json').notNull(),

  // Challenge completion
  challenge1Complete: boolean('challenge1_complete').default(false),
  challenge2Complete: boolean('challenge2_complete').default(false),
  challenge3Complete: boolean('challenge3_complete').default(false),
  challenge4Complete: boolean('challenge4_complete').default(false),
  challenge5Complete: boolean('challenge5_complete').default(false),
  finalChallengeComplete: boolean('final_challenge_complete').default(false),

  // Badges earned
  badgesEarned: jsonb('badges_earned').notNull().default(sql`'[]'::jsonb`),

  // About Me statement
  aboutMe: text('about_me'),

  // Metadata
  timeSpentSeconds: integer('time_spent_seconds').default(0),
  elementCount: integer('element_count').default(0),

  // Exports
  pdfUrl: text('pdf_url'),
  pngUrl: text('png_url'),
  shareLink: text('share_link'),
});

// Challenge elements tracking
export const collageElements = pgTable('collage_elements', {
  id: uuid('id').primaryKey().defaultRandom(),
  collageId: uuid('collage_id').notNull().references(() => identityCollages.id, { onDelete: 'cascade' }),
  challengeNumber: integer('challenge_number'),
  elementType: varchar('element_type', { length: 50 }).notNull(),
  sourceType: varchar('source_type', { length: 50 }).notNull(),
  contentUrl: text('content_url'),
  contentText: text('content_text'),
  positionX: integer('position_x'),
  positionY: integer('position_y'),
  width: integer('width'),
  height: integer('height'),
  rotation: integer('rotation'),
  zIndex: integer('z_index'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Badge unlocks
export const badgeUnlocks = pgTable('badge_unlocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  collageId: uuid('collage_id').notNull().references(() => identityCollages.id, { onDelete: 'cascade' }),
  studentId: text('student_id').notNull(),
  badgeId: varchar('badge_id', { length: 50 }).notNull(),
  unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
});

// Activity analytics
export const collageAnalytics = pgTable('collage_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  collageId: uuid('collage_id').references(() => identityCollages.id, { onDelete: 'cascade' }),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  eventData: jsonb('event_data'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export type IdentityCollage = typeof identityCollages.$inferSelect;
export type NewIdentityCollage = typeof identityCollages.$inferInsert;
export type CollageElement = typeof collageElements.$inferSelect;
export type NewCollageElement = typeof collageElements.$inferInsert;
export type BadgeUnlock = typeof badgeUnlocks.$inferSelect;
export type NewBadgeUnlock = typeof badgeUnlocks.$inferInsert;
export type CollageAnalytic = typeof collageAnalytics.$inferSelect;
export type NewCollageAnalytic = typeof collageAnalytics.$inferInsert;
