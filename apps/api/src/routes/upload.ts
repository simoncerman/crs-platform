import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import path from 'path';
import fs from 'fs';

const uploadRouter = new Hono();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// POST /api/upload - Upload file (conditionally protected)
uploadRouter.post('/', async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'];
    const type = body['type'] as string; // 'image' or 'document'

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file uploaded' }, 400);
    }

    // Check authentication for image uploads
    if (type !== 'document') {
      // Verify token for image uploads
      const authHeader = c.req.header('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
    }

    // Validate file type based on upload type
    let allowedTypes: string[];
    if (type === 'document') {
      allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    } else {
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    }
    
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` }, 400);
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return c.json({ error: 'File too large. Maximum size is 5MB.' }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const filename = `${timestamp}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    // Save file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filepath, buffer);

    // Return file URL (use full URL for cross-origin access)
    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const fileUrl = `${apiUrl}/uploads/${filename}`;

    return c.json({
      message: 'File uploaded successfully',
      url: fileUrl,
      filename: filename,
      size: file.size,
      type: file.type,
    }, 201);
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Failed to upload file' }, 500);
  }
});

// GET /api/upload/:filename - Get uploaded file
uploadRouter.get('/:filename', async (c) => {
  const filename = c.req.param('filename');
  const filepath = path.join(uploadsDir, filename);

  if (!fs.existsSync(filepath)) {
    return c.json({ error: 'File not found' }, 404);
  }

  const file = fs.readFileSync(filepath);
  const ext = path.extname(filename).toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';

  return c.body(file, 200, {
    'Content-Type': contentType,
  });
});

// DELETE /api/upload/:filename - Delete uploaded file (protected)
uploadRouter.delete('/:filename', authMiddleware, async (c) => {
  const filename = c.req.param('filename');
  const filepath = path.join(uploadsDir, filename);

  if (!fs.existsSync(filepath)) {
    return c.json({ error: 'File not found' }, 404);
  }

  try {
    fs.unlinkSync(filepath);
    return c.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    return c.json({ error: 'Failed to delete file' }, 500);
  }
});

export default uploadRouter;
