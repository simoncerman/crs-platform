import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { loginSchema, registerSchema } from "../schemas/auth";
import { generateToken } from "../lib/jwt";
import { authMiddleware } from "../middleware/auth";

const auth = new Hono();

// POST /api/auth/login
auth.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  // Find user by email
  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

// POST /api/auth/register (admin only - will be protected in server.ts)
auth.post("/register", zValidator("json", registerSchema), async (c) => {
  const { email, password, name, role } = c.req.valid("json");

  // Check if user already exists
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUser) {
    return c.json({ error: "User already exists" }, 400);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      name,
      role,
    })
    .returning();

  return c.json(
    {
      message: "User created successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    },
    201
  );
});

// GET /api/auth/me — validate token and return current user
auth.get("/me", authMiddleware, async (c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload = (c as any).get("user") as { userId: string; email: string; role: string };
  const [user] = await db
    .select({ id: users.id, email: users.email, name: users.name, role: users.role })
    .from(users)
    .where(eq(users.id, payload.userId));

  if (!user) {
    return c.json({ error: "Uživatel neexistuje" }, 401);
  }

  return c.json({ user });
});

export default auth;
