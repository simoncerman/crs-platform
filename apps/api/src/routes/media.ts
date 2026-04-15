import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

const mediaRouter = new Hono();

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// POST /api/media/upload - Upload image (protected)
mediaRouter.post("/upload", authMiddleware, async (c) => {
  try {
    console.log('[MEDIA UPLOAD] Request received');
    const body = await c.req.parseBody();
    console.log('[MEDIA UPLOAD] Body parsed, keys:', Object.keys(body));
    const file = body["file"];

    if (!file || typeof file === 'string') {
      console.log('[MEDIA UPLOAD] No file provided or not a File instance', { file: !!file });
      return c.json({ error: "No file provided" }, 400);
    }

    console.log('[MEDIA UPLOAD] File received:', { name: file.name, size: file.size, type: file.type });

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: "Invalid file type. Only images are allowed." }, 400);
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return c.json({ error: "File too large. Maximum size is 5MB." }, 400);
    }

    // Generate unique filename
    const ext = path.extname(file.name);
    const filename = `${randomUUID()}${ext}`;
    const filepath = path.join(UPLOADS_DIR, filename);

    // Save file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filepath, buffer);

    // Return URL
    const url = `/uploads/${filename}`;
    return c.json({
      url,
      filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return c.json({ error: "Failed to upload file" }, 500);
  }
});

// GET /api/media - List all uploaded images (protected)
mediaRouter.get("/", authMiddleware, async (c) => {
  try {
    const files = fs.readdirSync(UPLOADS_DIR);
    const images = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
      })
      .map((file) => {
        const filepath = path.join(UPLOADS_DIR, file);
        const stats = fs.statSync(filepath);
        return {
          filename: file,
          url: `/uploads/${file}`,
          size: stats.size,
          createdAt: stats.birthtime,
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return c.json({ images });
  } catch (error: any) {
    console.error("List images error:", error);
    return c.json({ error: "Failed to list images" }, 500);
  }
});

// DELETE /api/media/:filename - Delete image (protected)
mediaRouter.delete("/:filename", authMiddleware, async (c) => {
  try {
    const filename = c.req.param("filename");
    const filepath = path.join(UPLOADS_DIR, filename);

    if (!fs.existsSync(filepath)) {
      return c.json({ error: "File not found" }, 404);
    }

    fs.unlinkSync(filepath);
    return c.json({ message: "File deleted successfully" });
  } catch (error: any) {
    console.error("Delete error:", error);
    return c.json({ error: "Failed to delete file" }, 500);
  }
});

export default mediaRouter;
