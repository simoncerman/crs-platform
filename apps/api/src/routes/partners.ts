import { Hono } from 'hono';
import { db } from '../db';
import { partners, type Partner, type NewPartner } from '../db/schema';
import { eq, desc, asc } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';

const app = new Hono();

// Validation schemas
const partnerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  tier: z.enum(['silver', 'gold', 'diamond']),
  logo: z.string().nullable().optional().transform(val => val && val.trim() !== '' ? val : null),
  description: z.string().nullable().optional().transform(val => val && val.trim() !== '' ? val : null),
  fullDescription: z.string().nullable().optional().transform(val => val && val.trim() !== '' ? val : null),
  heroImage: z.string().nullable().optional().transform(val => val && val.trim() !== '' ? val : null),
  website: z.string().nullable().optional().transform(val => val && val.trim() !== '' ? val : null),
  order: z.number().int().default(0),
  published: z.boolean().default(true),
});

// GET /api/partners - Get all partners (public: published only, authenticated: all)
app.get('/', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const isAuthenticated = authHeader && authHeader.startsWith('Bearer ');

    let allPartners;
    if (isAuthenticated) {
      allPartners = await db
        .select()
        .from(partners)
        .orderBy(asc(partners.order), asc(partners.createdAt));
    } else {
      allPartners = await db
        .select()
        .from(partners)
        .where(eq(partners.published, true))
        .orderBy(asc(partners.order), asc(partners.createdAt));
    }

    // Group by tier
    const grouped = {
      diamond: allPartners.filter(p => p.tier === 'diamond'),
      gold: allPartners.filter(p => p.tier === 'gold'),
      silver: allPartners.filter(p => p.tier === 'silver'),
    };

    return c.json(grouped);
  } catch (error) {
    console.error('Error fetching partners:', error);
    return c.json({ error: 'Failed to fetch partners' }, 500);
  }
});

// PUT /api/partners/reorder - Batch update order and tier (admin)
const reorderSchema = z.object({
  partners: z.array(z.object({
    id: z.string().uuid(),
    tier: z.enum(['silver', 'gold', 'diamond']),
    order: z.number().int(),
  })),
});

app.put('/reorder', authMiddleware, zValidator('json', reorderSchema), async (c) => {
  try {
    const { partners: updates } = c.req.valid('json');

    await Promise.all(
      updates.map(({ id, tier, order }) =>
        db.update(partners).set({ tier, order, updatedAt: new Date() }).where(eq(partners.id, id))
      )
    );

    return c.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Error reordering partners:', error);
    return c.json({ error: 'Failed to reorder partners' }, 500);
  }
});

// GET /api/partners/:id - Get single partner
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const [partner] = await db
      .select()
      .from(partners)
      .where(eq(partners.id, id))
      .limit(1);

    if (!partner) {
      return c.json({ error: 'Partner not found' }, 404);
    }

    return c.json({ partner });
  } catch (error) {
    console.error('Error fetching partner:', error);
    return c.json({ error: 'Failed to fetch partner' }, 500);
  }
});

// POST /api/partners - Create new partner (admin)
app.post('/', authMiddleware, zValidator('json', partnerSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    
    const [newPartner] = await db
      .insert(partners)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return c.json({ partner: newPartner }, 201);
  } catch (error: any) {
    console.error('Error creating partner:', error);
    return c.json({ 
      error: error.message || 'Failed to create partner',
      details: error.toString()
    }, 500);
  }
});

// PUT /api/partners/:id - Update partner (admin)
app.put('/:id', authMiddleware, zValidator('json', partnerSchema.partial()), async (c) => {
  try {
    const id = c.req.param('id');
    const data = c.req.valid('json');

    const [updatedPartner] = await db
      .update(partners)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(partners.id, id))
      .returning();

    if (!updatedPartner) {
      return c.json({ error: 'Partner not found' }, 404);
    }

    return c.json({ partner: updatedPartner });
  } catch (error) {
    console.error('Error updating partner:', error);
    return c.json({ error: 'Failed to update partner' }, 500);
  }
});

// DELETE /api/partners/:id - Delete partner (admin)
app.delete('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');

    const [deletedPartner] = await db
      .delete(partners)
      .where(eq(partners.id, id))
      .returning();

    if (!deletedPartner) {
      return c.json({ error: 'Partner not found' }, 404);
    }

    return c.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    console.error('Error deleting partner:', error);
    return c.json({ error: 'Failed to delete partner' }, 500);
  }
});

export default app;
