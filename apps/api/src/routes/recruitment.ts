import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import { recruitmentSubmissions, recruitmentSettings } from "../db/schema";
import { eq, ne, desc } from "drizzle-orm";
import { recruitmentSchema } from "../schemas/recruitment";
import { authMiddleware } from "../middleware/auth";
import { sendMail, escapeHtml, draftContinueEmail, adminNotifyEmail, interviewConfirmEmail, acceptedEmail, rejectedEmail } from "../lib/mail";

const recruitmentRouter = new Hono();

// POST /api/recruitment/draft - Create or update draft (public)
recruitmentRouter.post("/draft", async (c) => {
  try {
    const data = await c.req.json();
    const { email, id } = data;

    if (!email || typeof email !== "string") {
      return c.json({ error: "Email is required" }, 400);
    }

    // Basic email format validation to prevent header injection
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 255) {
      return c.json({ error: "Invalid email address" }, 400);
    }

    // Extract only valid DB fields from request
    const draftFields = {
      name: data.name || undefined,
      phone: data.phone || undefined,
      dateOfBirth: data.dateOfBirth || undefined,
      education: data.education || undefined,
      experience: data.experience || undefined,
      interests: data.interests || undefined,
      motivation: data.motivation || undefined,
      skills: data.skills || undefined,
      preferredRole: data.preferredRole || undefined,
      availability: data.availability || undefined,
      task: data.task || undefined,
      taskTitle: data.taskTitle || undefined,
    };

    // If ID is provided, update existing draft
    if (id) {
      const [existingDraft] = await db
        .select()
        .from(recruitmentSubmissions)
        .where(eq(recruitmentSubmissions.id, id));

      if (existingDraft && existingDraft.email === email) {
        const [updatedDraft] = await db
          .update(recruitmentSubmissions)
          .set({
            ...draftFields,
            updatedAt: new Date(),
          })
          .where(eq(recruitmentSubmissions.id, id))
          .returning();

        return c.json({
          draft: {
            id: updatedDraft.id,
            email: updatedDraft.email,
          },
        });
      }
    }

    // Create new draft
    const [draft] = await db
      .insert(recruitmentSubmissions)
      .values({
        email,
        ...draftFields,
        status: "draft",
        name: draftFields.name || "Draft",
        motivation: draftFields.motivation || "",
        education: draftFields.education || "Neuvedeno",
        interests: draftFields.interests || "Neuvedeno",
      })
      .returning();

    const frontendUrl = process.env.CORS_ORIGIN || "http://localhost:3000";
    const continueLink = `${frontendUrl}/nabor?draft=${draft.id}&email=${encodeURIComponent(draft.email)}`;

    await sendMail({
      to: draft.email,
      subject: "Pokračuj v přihlášce – Czech Rocket Society",
      html: draftContinueEmail(continueLink),
    });

    return c.json(
      {
        draft: {
          id: draft.id,
          email: draft.email,
        },
      },
      201
    );
  } catch (error) {
    console.error("Draft creation error:", error);
    return c.json({ error: "Failed to save draft" }, 500);
  }
});

// GET /api/recruitment/draft/:id - Get draft by ID (public)
recruitmentRouter.get("/draft/:id", async (c) => {
  const id = c.req.param("id");
  const email = c.req.query("email");

  if (!email) {
    return c.json({ error: "Email is required" }, 400);
  }

  const [draft] = await db
    .select()
    .from(recruitmentSubmissions)
    .where(eq(recruitmentSubmissions.id, id));

  if (!draft) {
    return c.json({ error: "Draft not found" }, 404);
  }

  // Verify email matches
  if (draft.email !== email) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  return c.json({ draft });
});

// POST /api/recruitment/draft/:id/submit - Finalize draft as a pending submission (public)
recruitmentRouter.post("/draft/:id/submit", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { email } = body;

  if (!email || typeof email !== "string") {
    return c.json({ error: "Email is required" }, 400);
  }

  const [draft] = await db
    .select()
    .from(recruitmentSubmissions)
    .where(eq(recruitmentSubmissions.id, id));

  if (!draft || draft.email !== email) {
    return c.json({ error: "Not found" }, 404);
  }

  // Only allow transitioning from "draft" status
  if (draft.status !== "draft") {
    return c.json({ error: "Already submitted" }, 409);
  }

  // Update draft with final data and set status to pending
  const updateFields: Record<string, unknown> = {
    status: "pending",
    updatedAt: new Date(),
  };

  // Accept final submission data to update the draft
  if (body.name) updateFields.name = body.name;
  if (body.phone !== undefined) updateFields.phone = body.phone;
  if (body.dateOfBirth !== undefined) updateFields.dateOfBirth = body.dateOfBirth;
  if (body.education) updateFields.education = body.education;
  if (body.experience !== undefined) updateFields.experience = body.experience;
  if (body.interests) updateFields.interests = body.interests;
  if (body.motivation) updateFields.motivation = body.motivation;
  if (body.skills !== undefined) updateFields.skills = body.skills;
  if (body.preferredRole !== undefined) updateFields.preferredRole = body.preferredRole;
  if (body.availability !== undefined) updateFields.availability = body.availability;
  if (body.task !== undefined) updateFields.task = body.task;
  if (body.taskTitle !== undefined) updateFields.taskTitle = body.taskTitle;

  const [submission] = await db
    .update(recruitmentSubmissions)
    .set(updateFields)
    .where(eq(recruitmentSubmissions.id, id))
    .returning();

  // Notify admin about new submission
  const adminEmail = process.env.ADMIN_EMAIL || "admin@crs.local";
  const frontendUrl = process.env.CORS_ORIGIN || "http://localhost:3000";
  const adminUrl = `${frontendUrl}/admin/recruitment/${submission.id}`;

  await sendMail({
    to: adminEmail,
    subject: `Nová přihláška: ${escapeHtml(submission.name)}`,
    html: adminNotifyEmail(submission.name, submission.email, adminUrl),
  });

  return c.json({ ok: true, submission: { id: submission.id, name: submission.name, email: submission.email } });
});

// POST /api/recruitment - Submit recruitment form (public)
recruitmentRouter.post(
  "/",
  zValidator("json", recruitmentSchema),
  async (c) => {
    const data = c.req.valid("json");

    const [submission] = await db
      .insert(recruitmentSubmissions)
      .values({
        ...data,
        status: "pending",
      })
      .returning();

    // Notify admin only — no auto-email to applicant (admin reviews first)
    const adminEmail = process.env.ADMIN_EMAIL || "admin@crs.local";
    const frontendUrl = process.env.CORS_ORIGIN || "http://localhost:3000";
    const adminUrl = `${frontendUrl}/admin/recruitment/${submission.id}`;

    await sendMail({
      to: adminEmail,
      subject: `Nová přihláška: ${escapeHtml(submission.name)}`,
      html: adminNotifyEmail(submission.name, submission.email, adminUrl),
    });

    return c.json(
      {
        message: "Application submitted successfully",
        submission: {
          id: submission.id,
          name: submission.name,
          email: submission.email,
        },
      },
      201
    );
  }
);

// GET /api/recruitment - Get all submissions (protected, excludes drafts)
recruitmentRouter.get("/", authMiddleware, async (c) => {
  const submissions = await db
    .select()
    .from(recruitmentSubmissions)
    .where(ne(recruitmentSubmissions.status, "draft"))
    .orderBy(desc(recruitmentSubmissions.updatedAt));

  return c.json({ submissions });
});

// Get recruitment settings (public - for the form)
recruitmentRouter.get("/settings/public", async (c) => {
  const settings = await db.select().from(recruitmentSettings).limit(1);

  if (settings.length === 0) {
    return c.json({ isActive: true, roles: [], tasks: [] });
  }

  const { id: _id, updatedAt: _updatedAt, ...publicSettings } = settings[0];
  return c.json(publicSettings);
});

// Get recruitment settings (admin)
recruitmentRouter.get("/settings", authMiddleware, async (c) => {
  try {
    const settings = await db.select().from(recruitmentSettings).limit(1);

    if (settings.length === 0) {
      return c.json({
        isActive: true,
        roles: [],
        tasks: [],
      });
    }

    return c.json(settings[0]);
  } catch (err) {
    console.error("Failed to load recruitment settings:", err);
    return c.json({ error: "Failed to load settings" }, 500);
  }
});

// GET /api/recruitment/:id - Get single submission (protected)
recruitmentRouter.get("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");

  const [submission] = await db
    .select()
    .from(recruitmentSubmissions)
    .where(eq(recruitmentSubmissions.id, id));

  if (!submission) {
    return c.json({ error: "Submission not found" }, 404);
  }

  return c.json({ submission });
});

// Update recruitment settings
recruitmentRouter.put("/settings", authMiddleware, async (c) => {
  const body = await c.req.json();

  const existingSettings = await db.select().from(recruitmentSettings).limit(1);

  if (existingSettings.length === 0) {
    const [newSettings] = await db.insert(recruitmentSettings).values({
      isActive: body.isActive,
      roles: body.roles,
      tasks: body.tasks,
    }).returning();

    return c.json(newSettings);
  } else {
    const [updatedSettings] = await db.update(recruitmentSettings)
      .set({
        isActive: body.isActive,
        roles: body.roles,
        tasks: body.tasks,
        updatedAt: new Date(),
      })
      .where(eq(recruitmentSettings.id, existingSettings[0].id))
      .returning();

    return c.json(updatedSettings);
  }
});

// PUT /api/recruitment/:id - Update notes or interview notes (protected)
recruitmentRouter.put("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { notes, interviewNotes } = body;

  if (notes === undefined && interviewNotes === undefined) {
    return c.json({ error: "No fields to update" }, 400);
  }

  const [submission] = await db
    .select()
    .from(recruitmentSubmissions)
    .where(eq(recruitmentSubmissions.id, id));

  if (!submission) {
    return c.json({ error: "Submission not found" }, 404);
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (notes !== undefined) updateData.notes = notes;
  if (interviewNotes !== undefined) updateData.interviewNotes = interviewNotes;

  const [updatedSubmission] = await db
    .update(recruitmentSubmissions)
    .set(updateData)
    .where(eq(recruitmentSubmissions.id, id))
    .returning();

  return c.json({ submission: updatedSubmission });
});

// POST /api/recruitment/:id/confirm-interview - Confirm interview with date (protected)
recruitmentRouter.post("/:id/confirm-interview", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { interviewDate } = body;

  if (!interviewDate) {
    return c.json({ error: "Interview date is required" }, 400);
  }

  const [submission] = await db
    .select()
    .from(recruitmentSubmissions)
    .where(eq(recruitmentSubmissions.id, id));

  if (!submission) {
    return c.json({ error: "Submission not found" }, 404);
  }

  if (submission.status !== "pending") {
    return c.json({ error: "Can only confirm interview for pending submissions" }, 400);
  }

  const [updated] = await db
    .update(recruitmentSubmissions)
    .set({ status: "interview_scheduled", interviewDate, updatedAt: new Date() })
    .where(eq(recruitmentSubmissions.id, id))
    .returning();

  // Send interview confirmation email to applicant
  await sendMail({
    to: submission.email,
    subject: "Potvrzení pohovoru – Czech Rocket Society",
    html: interviewConfirmEmail(submission.name, interviewDate),
  });

  return c.json({ submission: updated });
});

// POST /api/recruitment/:id/mark-interviewed - Mark interview as done (protected)
recruitmentRouter.post("/:id/mark-interviewed", authMiddleware, async (c) => {
  const id = c.req.param("id");

  const [submission] = await db
    .select()
    .from(recruitmentSubmissions)
    .where(eq(recruitmentSubmissions.id, id));

  if (!submission) {
    return c.json({ error: "Submission not found" }, 404);
  }

  if (submission.status !== "interview_scheduled") {
    return c.json({ error: "Can only mark as interviewed from interview_scheduled" }, 400);
  }

  const [updated] = await db
    .update(recruitmentSubmissions)
    .set({ status: "interviewed", updatedAt: new Date() })
    .where(eq(recruitmentSubmissions.id, id))
    .returning();

  return c.json({ submission: updated });
});

// POST /api/recruitment/:id/accept - Accept applicant (protected)
recruitmentRouter.post("/:id/accept", authMiddleware, async (c) => {
  const id = c.req.param("id");

  const [submission] = await db
    .select()
    .from(recruitmentSubmissions)
    .where(eq(recruitmentSubmissions.id, id));

  if (!submission) {
    return c.json({ error: "Submission not found" }, 404);
  }

  if (submission.status !== "interviewed") {
    return c.json({ error: "Can only accept after interview" }, 400);
  }

  const [updated] = await db
    .update(recruitmentSubmissions)
    .set({ status: "accepted", updatedAt: new Date() })
    .where(eq(recruitmentSubmissions.id, id))
    .returning();

  return c.json({ submission: updated });
});

// POST /api/recruitment/:id/send-documents - Send documents to accepted applicant (protected)
recruitmentRouter.post("/:id/send-documents", authMiddleware, async (c) => {
  const id = c.req.param("id");

  const [submission] = await db
    .select()
    .from(recruitmentSubmissions)
    .where(eq(recruitmentSubmissions.id, id));

  if (!submission) {
    return c.json({ error: "Submission not found" }, 404);
  }

  if (submission.status !== "accepted") {
    return c.json({ error: "Can only send documents to accepted applicants" }, 400);
  }

  // Send email with documents
  await sendMail({
    to: submission.email,
    subject: "Přijat/a do Czech Rocket Society! 🚀",
    html: acceptedEmail(submission.name),
  });

  const [updated] = await db
    .update(recruitmentSubmissions)
    .set({ status: "documents_sent", updatedAt: new Date() })
    .where(eq(recruitmentSubmissions.id, id))
    .returning();

  return c.json({ submission: updated });
});

// POST /api/recruitment/:id/complete - Complete recruitment (protected)
recruitmentRouter.post("/:id/complete", authMiddleware, async (c) => {
  const id = c.req.param("id");

  const [submission] = await db
    .select()
    .from(recruitmentSubmissions)
    .where(eq(recruitmentSubmissions.id, id));

  if (!submission) {
    return c.json({ error: "Submission not found" }, 404);
  }

  if (submission.status !== "documents_sent") {
    return c.json({ error: "Can only complete after documents are sent" }, 400);
  }

  // Mark recruitment as completed — member creation is done manually by admin
  const [updated] = await db
    .update(recruitmentSubmissions)
    .set({ status: "completed", updatedAt: new Date() })
    .where(eq(recruitmentSubmissions.id, id))
    .returning();

  return c.json({ submission: updated });
});

// POST /api/recruitment/:id/set-status - Rollback/override status (protected)
recruitmentRouter.post("/:id/set-status", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { status } = body;

  const validStatuses = ["pending", "interview_scheduled", "interviewed", "accepted", "documents_sent", "completed"];
  if (!status || !validStatuses.includes(status)) {
    return c.json({ error: "Invalid status" }, 400);
  }

  const [submission] = await db
    .select()
    .from(recruitmentSubmissions)
    .where(eq(recruitmentSubmissions.id, id));

  if (!submission) {
    return c.json({ error: "Submission not found" }, 404);
  }

  const [updated] = await db
    .update(recruitmentSubmissions)
    .set({ status, updatedAt: new Date() })
    .where(eq(recruitmentSubmissions.id, id))
    .returning();

  return c.json({ submission: updated });
});

// POST /api/recruitment/:id/reject - Reject applicant at any step (protected)
recruitmentRouter.post("/:id/reject", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { rejectionReason } = body;

  const [submission] = await db
    .select()
    .from(recruitmentSubmissions)
    .where(eq(recruitmentSubmissions.id, id));

  if (!submission) {
    return c.json({ error: "Submission not found" }, 404);
  }

  const rejectableStatuses = ["pending", "interview_scheduled", "interviewed"];
  if (!rejectableStatuses.includes(submission.status)) {
    return c.json({ error: "Cannot reject from this status" }, 400);
  }

  const [updated] = await db
    .update(recruitmentSubmissions)
    .set({
      status: "rejected",
      rejectionStep: submission.status,
      updatedAt: new Date(),
    })
    .where(eq(recruitmentSubmissions.id, id))
    .returning();

  // Send rejection email
  await sendMail({
    to: submission.email,
    subject: "Výsledek přihlášky – Czech Rocket Society",
    html: rejectedEmail(submission.name, rejectionReason || undefined),
  });

  return c.json({ submission: updated });
});

export default recruitmentRouter;
