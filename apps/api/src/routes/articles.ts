import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import { articles } from "../db/schema";
import { eq, desc, and, lte } from "drizzle-orm";
import { createArticleSchema, updateArticleSchema } from "../schemas/article";
import { authMiddleware } from "../middleware/auth";
import { JWTPayload } from "../lib/jwt";

const articlesRouter = new Hono();

// GET /api/articles - Get all articles (public - only published)
articlesRouter.get("/", async (c) => {
  // Check if user is authenticated (for admin access to all articles)
  const authHeader = c.req.header('Authorization');
  const isAuthenticated = authHeader && authHeader.startsWith('Bearer ');
  
  let allArticles;
  if (isAuthenticated) {
    // Admin: return all articles, sorted by published date (newest first)
    allArticles = await db
      .select()
      .from(articles)
      .orderBy(desc(articles.publishedAt), desc(articles.createdAt));
  } else {
    // Public: only published articles with publishedAt in the past
    allArticles = await db
      .select()
      .from(articles)
      .where(and(
        eq(articles.status, 'published'),
        lte(articles.publishedAt, new Date()),
      ))
      .orderBy(desc(articles.publishedAt));
  }

  return c.json({ articles: allArticles });
});

// GET /api/articles/slug/:slug - Get article by slug (public - only published)
articlesRouter.get("/slug/:slug", async (c) => {
  const slug = c.req.param("slug");

  const [article] = await db.select().from(articles).where(eq(articles.slug, slug));

  if (!article) {
    return c.json({ error: "Article not found" }, 404);
  }

  // Only return published articles with publishedAt in the past
  if (article.status !== 'published') {
    return c.json({ error: "Article not found" }, 404);
  }
  if (article.publishedAt && new Date(article.publishedAt) > new Date()) {
    return c.json({ error: "Article not found" }, 404);
  }

  return c.json({ article });
});

// GET /api/articles/:id - Get single article (public - only published, unless authenticated)
articlesRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const authHeader = c.req.header('Authorization');
  const isAuthenticated = authHeader && authHeader.startsWith('Bearer ');

  const [article] = await db.select().from(articles).where(eq(articles.id, id));

  if (!article) {
    return c.json({ error: "Article not found" }, 404);
  }

  // If not authenticated, deny access to unpublished or future articles
  if (!isAuthenticated) {
    if (article.status !== 'published') {
      return c.json({ error: "Article not found" }, 404);
    }
    if (article.publishedAt && new Date(article.publishedAt) > new Date()) {
      return c.json({ error: "Article not found" }, 404);
    }
  }

  return c.json({ article });
});

// POST /api/articles - Create article (protected)
articlesRouter.post(
  "/",
  authMiddleware,
  zValidator("json", createArticleSchema),
  async (c) => {
    const data = c.req.valid("json");
    const user = (c as any).get("user") as JWTPayload;

    // Convert publishedAt string to Date if provided
    const articleData: any = {
      ...data,
      authorId: user.userId,
    };
    
    if (articleData.publishedAt) {
      articleData.publishedAt = new Date(articleData.publishedAt);
    }

    const [newArticle] = await db
      .insert(articles)
      .values(articleData)
      .returning();

    return c.json({ article: newArticle }, 201);
  }
);

// PUT /api/articles/:id - Update article (protected)
articlesRouter.put(
  "/:id",
  authMiddleware,
  zValidator("json", updateArticleSchema),
  async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");

    const [article] = await db.select().from(articles).where(eq(articles.id, id));

    if (!article) {
      return c.json({ error: "Article not found" }, 404);
    }

    // Convert publishedAt string to Date if provided
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };
    
    if (updateData.publishedAt) {
      updateData.publishedAt = new Date(updateData.publishedAt);
    }

    const [updatedArticle] = await db
      .update(articles)
      .set(updateData)
      .where(eq(articles.id, id))
      .returning();

    return c.json({ article: updatedArticle });
  }
);

// DELETE /api/articles/:id - Delete article (protected)
articlesRouter.delete("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");

  const [article] = await db.select().from(articles).where(eq(articles.id, id));

  if (!article) {
    return c.json({ error: "Article not found" }, 404);
  }

  await db.delete(articles).where(eq(articles.id, id));

  return c.json({ message: "Article deleted successfully" });
});

export default articlesRouter;
