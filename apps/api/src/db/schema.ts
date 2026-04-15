import { pgTable, text, timestamp, uuid, varchar, boolean, jsonb, integer, pgEnum, serial } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * Partner tier enum
 */
export const partnerTierEnum = pgEnum('partner_tier', ['silver', 'gold', 'diamond']);

/**
 * Users table - Admin users for CMS
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('editor'), // admin, editor
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Articles table - Blog posts and news
 */
export const articles = pgTable('articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 500 }).notNull(),
  slug: varchar('slug', { length: 500 }).notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  coverImage: text('cover_image'),
  images: jsonb('images').$type<string[]>().default([]),
  category: varchar('category', { length: 100 }),
  tags: jsonb('tags').$type<string[]>().default([]),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  published: boolean('published').notNull().default(false),
  publishedAt: timestamp('published_at'),
  authorId: uuid('author_id').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Events table - Upcoming events and launches
 */
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 500 }).notNull(),
  slug: varchar('slug', { length: 500 }).notNull().unique(),
  description: text('description').notNull(),
  location: varchar('location', { length: 255 }),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  coverImage: text('cover_image'),
  specialStatus: varchar('special_status', { length: 50 }), // null = automatic (from dates), 'cancelled', 'postponed'
  eventType: varchar('event_type', { length: 100 }).notNull().default('event'), // launch, test, recruitment, pr, event
  published: boolean('published').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Members table - Team members
 */
export const members = pgTable('members', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  dateOfBirth: text('date_of_birth'), // YYYY-MM-DD
  email: varchar('email', { length: 255 }), // Personal email
  phone: varchar('phone', { length: 50 }),
  gmail: varchar('gmail', { length: 255 }), // Spolkový email: jmeno.prijmeni@czechrockets.com
  address: text('address'),
  role: varchar('role', { length: 255 }).notNull(), // Lead Engineer, Avionics Specialist, etc.
  department: varchar('department', { length: 100 }), // Avionics, Propulsion, Structures, etc.
  classification: varchar('classification', { length: 100 }), // Zařazení
  tags: jsonb('tags').$type<string[]>().default([]), // Správní rada, Vedení, Člen, etc.
  membershipType: varchar('membership_type', { length: 100 }), // Typ členství
  membershipApplication: boolean('membership_application').default(false), // Přihláška podána
  gdprConsent: boolean('gdpr_consent').default(false), // GDPR souhlas
  membershipValidity: text('membership_validity'), // Platnost členství (datum nebo popis)
  bio: text('bio'),
  avatar: text('avatar'),
  linkedIn: text('linkedin'),
  github: text('github'),
  active: boolean('active').notNull().default(true),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  endDate: timestamp('end_date'), // Konec ve spolku
  onboardingChecklist: jsonb('onboarding_checklist').$type<{
    googleAccount: boolean;
    notionWorkspace: boolean;
    slackInvite: boolean;
    notionDatabase: boolean;
  }>(),
  recruitmentId: text('recruitment_id'), // Link back to recruitment submission
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Projects table - Rocket projects
 */
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }), // Rakety, Motory, Avionika, atd.
  status: varchar('status', { length: 50 }).notNull().default('planning'), // planning, development, testing, completed
  coverImage: text('cover_image'),
  images: jsonb('images').$type<string[]>().default([]),
  startDate: timestamp('start_date'),
  completionDate: timestamp('completion_date'),
  specs: jsonb('specs').$type<Record<string, any>>(), // Technical specifications
  published: boolean('published').notNull().default(false),
  isFeatured: boolean('is_featured').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Project Members - Many-to-many relationship
 */
export const projectMembers = pgTable('project_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  memberId: uuid('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 255 }), // Project Lead, Engineer, etc.
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Recruitment Submissions - Applications from potential members
 */
export const recruitmentSubmissions = pgTable('recruitment_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: text('phone'),
  dateOfBirth: text('date_of_birth'), // YYYY-MM-DD
  education: text('education').notNull(),
  experience: text('experience'),
  interests: text('interests').notNull(),
  motivation: text('motivation').notNull(),
  skills: text('skills'),
  preferredRole: text('preferred_role'),
  availability: text('availability'),
  resumeUrl: text('resume_url'),
  task: text('task'), // Task response from applicant
  taskTitle: text('task_title'), // Title of the selected task
  // Status flow: draft → pending → interview_scheduled → interviewed → accepted → documents_sent → completed | rejected
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  notes: text('notes'), // Admin notes
  interviewDate: text('interview_date'), // ISO date string for scheduled interview
  interviewNotes: text('interview_notes'), // Notes from the interview
  rejectionStep: varchar('rejection_step', { length: 50 }), // At which step was rejected (pending, interview_scheduled, interviewed)
  onboardingChecklist: jsonb('onboarding_checklist').$type<{
    googleAccount: boolean;
    notionWorkspace: boolean;
    slackInvite: boolean;
    notionDatabase: boolean;
  }>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Recruitment Settings - Configuration for recruitment process
 */
export const recruitmentSettings = pgTable('recruitment_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  isActive: boolean('is_active').notNull().default(true),
  roles: jsonb('roles').$type<Array<{id: string, name: string, description?: string}>>().notNull().default([]),
  tasks: jsonb('tasks').$type<Array<{id: string, title: string, description: string, timeEstimate: string, roles: string[]}>>().notNull().default([]),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Partners table - Company partners
 */
export const partners = pgTable('partners', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  tier: partnerTierEnum('tier').notNull(),
  logo: text('logo'), // URL k logu
  description: text('description'), // Krátký popis (pro gold a diamond)
  fullDescription: text('full_description'), // Dlouhý popis (jen pro diamond)
  heroImage: text('hero_image'), // Hero obrázek (jen pro diamond)
  website: text('website'), // URL webu partnera
  order: integer('order').notNull().default(0), // Pro řazení partnerů
  published: boolean('published').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Automations table - Scheduled background tasks
 */
export const automations = pgTable('automations', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 100 }).notNull().unique(), // unique identifier e.g. "notion-members-sync"
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  enabled: boolean('enabled').notNull().default(false),
  intervalMinutes: integer('interval_minutes').notNull().default(60),
  lastRunAt: timestamp('last_run_at'),
  lastRunStatus: varchar('last_run_status', { length: 20 }), // success, error, running
  lastRunMessage: text('last_run_message'),
  nextRunAt: timestamp('next_run_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relations
export const articlesRelations = relations(articles, ({ one }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  member: one(members, {
    fields: [projectMembers.memberId],
    references: [members.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type RecruitmentSubmission = typeof recruitmentSubmissions.$inferSelect;
export type NewRecruitmentSubmission = typeof recruitmentSubmissions.$inferInsert;

export type Partner = typeof partners.$inferSelect;
export type NewPartner = typeof partners.$inferInsert;

export type RecruitmentSettings = typeof recruitmentSettings.$inferSelect;
export type NewRecruitmentSettings = typeof recruitmentSettings.$inferInsert;

export type Automation = typeof automations.$inferSelect;
export type NewAutomation = typeof automations.$inferInsert;
