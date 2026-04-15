import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import { projects } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { createProjectSchema, updateProjectSchema } from "../schemas/project";
import { authMiddleware } from "../middleware/auth";

const projectsRouter = new Hono();

// GET /api/projects - Get all projects (public)
projectsRouter.get("/", async (c) => {
  const allProjects = await db
    .select()
    .from(projects)
    .orderBy(desc(projects.updatedAt));

  return c.json({ projects: allProjects });
});

// GET /api/projects/slug/:slug - Get single project by slug (public)
projectsRouter.get("/slug/:slug", async (c) => {
  const slug = c.req.param("slug");

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug));

  if (!project) {
    return c.json({ error: "Project not found" }, 404);
  }

  return c.json({ project });
});

// GET /api/projects/:id - Get single project (public)
projectsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");

  const [project] = await db.select().from(projects).where(eq(projects.id, id));

  if (!project) {
    return c.json({ error: "Project not found" }, 404);
  }

  return c.json({ project });
});

// POST /api/projects - Create project (protected)
projectsRouter.post(
  "/",
  authMiddleware,
  async (c) => {
    try {
      const data: any = await c.req.json();
      
      // Manual validation of required fields
      if (!data.name || data.name.length < 2) {
        return c.json({ error: "Název musí mít alespoň 2 znaky" }, 400);
      }
      if (!data.slug || data.slug.length < 2) {
        return c.json({ error: "Slug musí mít alespoň 2 znaky" }, 400);
      }
      if (!data.description || data.description.length < 1) {
        return c.json({ error: "Popis je povinný" }, 400);
      }

      const projectData: any = { 
        ...data,
        status: data.status || "planning",
        images: data.images || [],
        published: data.published ?? false,
        isFeatured: data.isFeatured ?? false,
      };
      
      if (data.startDate) {
        projectData.startDate = new Date(data.startDate);
      }
      if (data.completionDate) {
        projectData.completionDate = new Date(data.completionDate);
      }

      const [newProject] = await db.insert(projects).values(projectData).returning();
      return c.json({ project: newProject }, 201);
    } catch (dbError: any) {
      console.error("Database insert error:", dbError);
      return c.json({ 
        error: "Database insert failed", 
        details: dbError.message,
        code: dbError.code
      }, 500);
    }
  }
);

// PUT /api/projects/:id - Update project (protected)
projectsRouter.put(
  "/:id",
  authMiddleware,
  async (c) => {
    const id = c.req.param("id");
    
    // Skip Zod validation due to a bug with .partial() and .default()
    const data: any = await c.req.json();

    const [project] = await db.select().from(projects).where(eq(projects.id, id));

    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }

    const updateData: any = { ...data };
    
    // Remove fields that might not exist in the DB yet or cause issues
    // if they are undefined/null and the DB has constraints
    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    } else if (data.startDate === null) {
      updateData.startDate = null;
    }
    
    if (data.completionDate) {
      updateData.completionDate = new Date(data.completionDate);
    } else if (data.completionDate === null) {
      updateData.completionDate = null;
    }
    
    updateData.updatedAt = new Date();

    try {
      const [updatedProject] = await db
        .update(projects)
        .set(updateData)
        .where(eq(projects.id, id))
        .returning();

      return c.json({ project: updatedProject });
    } catch (dbError: any) {
      console.error("Database update error:", dbError);
      return c.json({ 
        error: "Database update failed", 
        details: dbError.message,
        code: dbError.code 
      }, 500);
    }
  }
);

// DELETE /api/projects/:id - Delete project (protected)
projectsRouter.delete("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");

  const [project] = await db.select().from(projects).where(eq(projects.id, id));

  if (!project) {
    return c.json({ error: "Project not found" }, 404);
  }

  await db.delete(projects).where(eq(projects.id, id));

  return c.json({ message: "Project deleted successfully" });
});

export default projectsRouter;
