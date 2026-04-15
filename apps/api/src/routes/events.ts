import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import { events } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { createEventSchema, updateEventSchema } from "../schemas/event";
import { authMiddleware } from "../middleware/auth";
import { JWTPayload } from "../lib/jwt";

const eventsRouter = new Hono();

// GET /api/events - Get all events (public)
eventsRouter.get("/", async (c) => {
  try {
    const allEvents = await db
      .select()
      .from(events)
      .orderBy(desc(events.startDate));

    return c.json({ events: allEvents });
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return c.json({ error: "Nepodařilo se načíst události z databáze", details: error.message }, 500);
  }
});

// GET /api/events/:id - Get single event (public)
eventsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");

  const [event] = await db.select().from(events).where(eq(events.id, id));

  if (!event) {
    return c.json({ error: "Event not found" }, 404);
  }

  return c.json({ event });
});

// GET /api/events/slug/:slug - Get single event by slug (public)
eventsRouter.get("/slug/:slug", async (c) => {
  const slug = c.req.param("slug");

  const [event] = await db.select().from(events).where(eq(events.slug, slug));

  if (!event) {
    return c.json({ error: "Event not found" }, 404);
  }

  return c.json({ event });
});

// POST /api/events - Create event (protected)
eventsRouter.post(
  "/",
  authMiddleware,
  zValidator("json", createEventSchema),
  async (c) => {
    const data = c.req.valid("json");
    const _user = (c as any).get("user") as JWTPayload;

    const [newEvent] = await db
      .insert(events)
      .values({
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        specialStatus: data.specialStatus || null,
      })
      .returning();

    return c.json({ event: newEvent }, 201);
  }
);

// PUT /api/events/:id - Update event (protected)
eventsRouter.put(
  "/:id",
  authMiddleware,
  zValidator("json", updateEventSchema),
  async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");

    const [event] = await db.select().from(events).where(eq(events.id, id));

    if (!event) {
      return c.json({ error: "Event not found" }, 404);
    }

    const updateData: any = { ...data };
    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    }
    if (data.endDate) {
      updateData.endDate = new Date(data.endDate);
    }
    // Allow explicitly setting specialStatus to null (clearing it)
    if ('specialStatus' in data) {
      updateData.specialStatus = data.specialStatus || null;
    }
    updateData.updatedAt = new Date();

    const [updatedEvent] = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id))
      .returning();

    return c.json({ event: updatedEvent });
  }
);

// DELETE /api/events/:id - Delete event (protected)
eventsRouter.delete("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");

  const [event] = await db.select().from(events).where(eq(events.id, id));

  if (!event) {
    return c.json({ error: "Event not found" }, 404);
  }

  await db.delete(events).where(eq(events.id, id));

  return c.json({ message: "Event deleted successfully" });
});

export default eventsRouter;
