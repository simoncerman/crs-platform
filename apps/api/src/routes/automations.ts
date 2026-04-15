import { Hono } from "hono";
import { db } from "../db";
import { automations } from "../db/schema";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { automationRegistry } from "../lib/automation-registry";
import { getLastSyncResult } from "../automations/notion-members-sync";

const automationsRouter = new Hono();

// All routes require authentication
automationsRouter.use("*", authMiddleware);

// GET /api/automations - List all automations
automationsRouter.get("/", async (c) => {
  const allAutomations = await db
    .select()
    .from(automations)
    .orderBy(automations.name);

  return c.json({ automations: allAutomations });
});

// GET /api/automations/:id - Get single automation
automationsRouter.get("/:id", async (c) => {
  const { id } = c.req.param();

  const [automation] = await db
    .select()
    .from(automations)
    .where(eq(automations.id, id))
    .limit(1);

  if (!automation) {
    return c.json({ error: "Automatizace nenalezena" }, 404);
  }

  return c.json({ automation });
});

// PUT /api/automations/:id - Update automation config (enable/disable, interval)
automationsRouter.put("/:id", async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  const [existing] = await db
    .select()
    .from(automations)
    .where(eq(automations.id, id))
    .limit(1);

  if (!existing) {
    return c.json({ error: "Automatizace nenalezena" }, 404);
  }

  const updateData: Record<string, any> = {
    updatedAt: new Date(),
  };

  if (typeof body.enabled === "boolean") {
    updateData.enabled = body.enabled;
  }

  if (typeof body.intervalMinutes === "number" && body.intervalMinutes >= 1) {
    updateData.intervalMinutes = body.intervalMinutes;
  }

  // Recalculate nextRunAt if enabling or changing interval
  if (updateData.enabled === true || updateData.intervalMinutes) {
    const interval = updateData.intervalMinutes || existing.intervalMinutes;
    const enabled = updateData.enabled ?? existing.enabled;
    if (enabled) {
      updateData.nextRunAt = new Date(Date.now() + interval * 60 * 1000);
    } else {
      updateData.nextRunAt = null;
    }
  }

  if (updateData.enabled === false) {
    updateData.nextRunAt = null;
  }

  const [updated] = await db
    .update(automations)
    .set(updateData)
    .where(eq(automations.id, id))
    .returning();

  return c.json({ automation: updated });
});

// POST /api/automations/:id/trigger - Manually trigger an automation
automationsRouter.post("/:id/trigger", async (c) => {
  const { id } = c.req.param();

  const [automation] = await db
    .select()
    .from(automations)
    .where(eq(automations.id, id))
    .limit(1);

  if (!automation) {
    return c.json({ error: "Automatizace nenalezena" }, 404);
  }

  // Check if already running
  if (automation.lastRunStatus === "running") {
    return c.json({ error: "Automatizace již běží" }, 409);
  }

  // Mark as running
  await db
    .update(automations)
    .set({ lastRunStatus: "running", lastRunAt: new Date(), updatedAt: new Date() })
    .where(eq(automations.id, id));

  // Run in background (don't await)
  automationRegistry
    .run(automation.key)
    .then(async (result) => {
      const nextRunAt = automation.enabled
        ? new Date(Date.now() + automation.intervalMinutes * 60 * 1000)
        : null;

      await db
        .update(automations)
        .set({
          lastRunStatus: result.success ? "success" : "error",
          lastRunMessage: result.message,
          lastRunAt: new Date(),
          nextRunAt,
          updatedAt: new Date(),
        })
        .where(eq(automations.id, id));
    })
    .catch(async (error) => {
      // Catch unexpected crashes so the automation doesn't stay stuck in "running"
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`Automation ${automation.key} crashed:`, msg);
      await db
        .update(automations)
        .set({
          lastRunStatus: "error",
          lastRunMessage: `💥 Neočekávaná chyba: ${msg}`,
          lastRunAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(automations.id, id));
    });

  return c.json({ message: "Automatizace spuštěna" });
});

// GET /api/automations/:id/data - Get data from last automation run
automationsRouter.get("/:id/data", async (c) => {
  const { id } = c.req.param();

  const [automation] = await db
    .select()
    .from(automations)
    .where(eq(automations.id, id))
    .limit(1);

  if (!automation) {
    return c.json({ error: "Automatizace nenalezena" }, 404);
  }

  // Return data based on automation key
  if (automation.key === "notion-members-sync") {
    return c.json({ syncResult: getLastSyncResult() });
  }

  return c.json({ data: null });
});

export default automationsRouter;
