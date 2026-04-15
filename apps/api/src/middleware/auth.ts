import { Context, Next } from "hono";
import { verifyToken } from "../lib/jwt";
import { db } from "../db/index";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Nepřihlášen — token nebyl poskytnut" }, 401);
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return c.json({ error: "Nepřihlášen — neplatný nebo expirovaný token" }, 401);
  }

  // Verify user still exists in database
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, payload.userId)).limit(1);
  if (!user) {
    return c.json({ error: "Nepřihlášen — uživatel neexistuje. Přihlaste se znovu." }, 401);
  }

  c.set("user", payload);
  await next();
}

export async function adminOnly(c: Context, next: Next) {
  const user = c.get("user");

  if (!user || user.role !== "admin") {
    return c.json({ error: "Forbidden - Admin access required" }, 403);
  }

  await next();
}
