import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import { members } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { createMemberSchema, updateMemberSchema } from "../schemas/member";
import { authMiddleware } from "../middleware/auth";

const membersRouter = new Hono();

// GET /api/members - Get all members (public)
membersRouter.get("/", async (c) => {
  const activeParam = c.req.query("active");
  const tagParam = c.req.query("tag");

  let query = db.select().from(members);

  if (activeParam === "true") {
    query = query.where(eq(members.active, true)) as typeof query;
  } else if (activeParam === "false") {
    query = query.where(eq(members.active, false)) as typeof query;
  }

  let allMembers = await query;

  // Filter by tag in application layer (jsonb array)
  if (tagParam) {
    allMembers = allMembers.filter(
      (m) => Array.isArray(m.tags) && m.tags.includes(tagParam)
    );
  }

  return c.json({ members: allMembers });
});

// GET /api/members/:id - Get single member (public)
membersRouter.get("/:id", async (c) => {
  const id = c.req.param("id");

  const [member] = await db.select().from(members).where(eq(members.id, id));

  if (!member) {
    return c.json({ error: "Member not found" }, 404);
  }

  return c.json({ member });
});

// POST /api/members - Create member (protected)
membersRouter.post(
  "/",
  authMiddleware,
  zValidator("json", createMemberSchema),
  async (c) => {
    const data = c.req.valid("json");

    const { joinedAt, ...rest } = data;
    const [newMember] = await db.insert(members).values({
      ...rest,
      ...(joinedAt ? { joinedAt: new Date(joinedAt) } : {}),
    }).returning();

    return c.json({ member: newMember }, 201);
  }
);

// PUT /api/members/:id - Update member (protected)
membersRouter.put(
  "/:id",
  authMiddleware,
  zValidator("json", updateMemberSchema),
  async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");

    const [member] = await db.select().from(members).where(eq(members.id, id));

    if (!member) {
      return c.json({ error: "Member not found" }, 404);
    }

    const { joinedAt: joinedAtStr, ...restData } = data;
    const [updatedMember] = await db
      .update(members)
      .set({
        ...restData,
        ...(joinedAtStr ? { joinedAt: new Date(joinedAtStr) } : {}),
        updatedAt: new Date(),
      })
      .where(eq(members.id, id))
      .returning();

    return c.json({ member: updatedMember });
  }
);

// DELETE /api/members/:id - Delete member (protected)
membersRouter.delete("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");

  const [member] = await db.select().from(members).where(eq(members.id, id));

  if (!member) {
    return c.json({ error: "Member not found" }, 404);
  }

  await db.delete(members).where(eq(members.id, id));

  return c.json({ message: "Member deleted successfully" });
});

// PUT /api/members/:id/onboarding - Update onboarding checklist (protected)
membersRouter.put("/:id/onboarding", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  const [member] = await db.select().from(members).where(eq(members.id, id));
  if (!member) {
    return c.json({ error: "Member not found" }, 404);
  }

  const current = member.onboardingChecklist || {
    googleAccount: false,
    notionWorkspace: false,
    slackInvite: false,
    notionDatabase: false,
  };

  const updated = { ...current, ...body };

  const [result] = await db
    .update(members)
    .set({ onboardingChecklist: updated, updatedAt: new Date() })
    .where(eq(members.id, id))
    .returning();

  return c.json({ member: result });
});

// POST /api/members/:id/push-notion - Write member to Notion private DB (protected)
membersRouter.post("/:id/push-notion", authMiddleware, async (c) => {
  const id = c.req.param("id");

  const NOTION_API_KEY = process.env.NOTION_API_KEY || "";
  const NOTION_DB_ID = process.env.NOTION_MEMBERS_DB_ID || "";

  if (!NOTION_API_KEY || !NOTION_DB_ID) {
    return c.json({ error: "Notion API není nakonfigurováno (NOTION_API_KEY, NOTION_MEMBERS_DB_ID)" }, 500);
  }

  const [member] = await db.select().from(members).where(eq(members.id, id));
  if (!member) {
    return c.json({ error: "Member not found" }, 404);
  }

  const properties: Record<string, unknown> = {
    "Celé jméno": {
      title: [{ text: { content: member.name } }],
    },
    "Email": {
      email: member.email || null,
    },
    "Typ členství": {
      select: { name: member.membershipType === "Řádný člen" ? "Řádné členství" : "Mimořádné" },
    },
    "Přihláška": {
      checkbox: member.membershipApplication || false,
    },
    "GDPR Souhlas": {
      checkbox: member.gdprConsent || false,
    },
  };

  if (member.phone) {
    properties["Telefon"] = { phone_number: member.phone };
  }
  if (member.dateOfBirth) {
    properties["Datum narození"] = { date: { start: member.dateOfBirth } };
  }
  if (member.joinedAt) {
    properties["Nástup"] = { date: { start: new Date(member.joinedAt).toISOString().split("T")[0] } };
  }
  if (member.address) {
    properties["Adresa"] = { rich_text: [{ text: { content: member.address } }] };
  }
  if (member.department) {
    properties["Department"] = { select: { name: member.department } };
  }

  try {
    const res = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_DB_ID },
        properties,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Notion API error:", res.status, text);
      return c.json({ error: `Notion API chyba: ${res.status}` }, 500);
    }

    const page = await res.json();

    // Auto-update checklist
    const checklist = member.onboardingChecklist || {
      googleAccount: false,
      notionWorkspace: false,
      slackInvite: false,
      notionDatabase: false,
    };
    checklist.notionDatabase = true;

    await db
      .update(members)
      .set({ onboardingChecklist: checklist, updatedAt: new Date() })
      .where(eq(members.id, id));

    return c.json({ ok: true, notionPageId: page.id });
  } catch (error) {
    console.error("Notion push error:", error);
    return c.json({ error: "Nepodařilo se připojit k Notion API" }, 500);
  }
});

export default membersRouter;
