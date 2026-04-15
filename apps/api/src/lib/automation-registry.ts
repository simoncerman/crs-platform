import { db } from "../db";
import { automations } from "../db/schema";
import { eq, lte, and } from "drizzle-orm";

export interface AutomationResult {
  success: boolean;
  message: string;
}

type AutomationHandler = () => Promise<AutomationResult>;

class AutomationRegistry {
  private handlers = new Map<string, AutomationHandler>();
  private schedulerInterval: ReturnType<typeof setInterval> | null = null;

  /** Register a handler for an automation key */
  register(key: string, handler: AutomationHandler) {
    this.handlers.set(key, handler);
  }

  /** Run an automation by key */
  async run(key: string): Promise<AutomationResult> {
    const handler = this.handlers.get(key);
    if (!handler) {
      return { success: false, message: `Handler pro "${key}" není registrován` };
    }

    try {
      return await handler();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, message };
    }
  }

  /** Start the scheduler that checks for due automations */
  startScheduler(checkIntervalMs = 30_000) {
    if (this.schedulerInterval) return;

    console.log("⏰ Automation scheduler started");

    this.schedulerInterval = setInterval(async () => {
      try {
        await this.checkAndRunDue();
      } catch (error) {
        console.error("Scheduler error:", error);
      }
    }, checkIntervalMs);
  }

  stopScheduler() {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
  }

  private async checkAndRunDue() {
    const now = new Date();

    // Find enabled automations that are due
    const dueAutomations = await db
      .select()
      .from(automations)
      .where(
        and(
          eq(automations.enabled, true),
          lte(automations.nextRunAt, now)
        )
      );

    for (const automation of dueAutomations) {
      if (automation.lastRunStatus === "running") continue;

      console.log(`▶ Running automation: ${automation.name}`);

      // Mark as running
      await db
        .update(automations)
        .set({ lastRunStatus: "running", lastRunAt: now, updatedAt: now })
        .where(eq(automations.id, automation.id));

      // Run and update result
      const result = await this.run(automation.key);
      const nextRunAt = new Date(Date.now() + automation.intervalMinutes * 60 * 1000);

      await db
        .update(automations)
        .set({
          lastRunStatus: result.success ? "success" : "error",
          lastRunMessage: result.message,
          lastRunAt: new Date(),
          nextRunAt,
          updatedAt: new Date(),
        })
        .where(eq(automations.id, automation.id));

      console.log(`${result.success ? "✅" : "❌"} ${automation.name}: ${result.message}`);
    }
  }

  /** Seed default automations into DB (idempotent) */
  async seedDefaults(defaults: Array<{ key: string; name: string; description: string }>) {
    for (const def of defaults) {
      const [existing] = await db
        .select()
        .from(automations)
        .where(eq(automations.key, def.key))
        .limit(1);

      if (!existing) {
        await db.insert(automations).values({
          key: def.key,
          name: def.name,
          description: def.description,
          enabled: false,
          intervalMinutes: 60,
        });
        console.log(`📋 Seeded automation: ${def.name}`);
      }
    }
  }
}

export const automationRegistry = new AutomationRegistry();
