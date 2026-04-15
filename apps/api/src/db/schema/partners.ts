import { pgTable, text, serial, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const partnerTierEnum = pgEnum('partner_tier', ['silver', 'gold', 'diamond']);

export const partners = pgTable('partners', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  tier: partnerTierEnum('tier').notNull(),
  logo: text('logo').notNull(), // URL k logu
  description: text('description'), // Krátký popis (pro gold a diamond)
  fullDescription: text('full_description'), // Dlouhý popis (jen pro diamond)
  heroImage: text('hero_image'), // Hero obrázek (jen pro diamond)
  website: text('website'), // URL webu partnera
  order: serial('order').notNull(), // Pro řazení partnerů
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Partner = typeof partners.$inferSelect;
export type NewPartner = typeof partners.$inferInsert;
