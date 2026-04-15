// Mock DB before imports
function createDbMock(): Record<string, jest.Mock> {
  const handler: ProxyHandler<Record<string, jest.Mock>> = {
    get(_target, prop) {
      if (prop === 'then') {
        return (resolve: (v: unknown) => void) => resolve([{ id: 'user-1' }]);
      }
      if (!_target[prop as string]) {
        _target[prop as string] = jest.fn(() => proxy);
      }
      return _target[prop as string];
    },
  };
  const target: Record<string, jest.Mock> = {};
  const proxy = new Proxy(target, handler);
  return proxy;
}

jest.mock('../../db', () => ({
  db: createDbMock(),
}));

import { Hono } from 'hono';
import { authMiddleware, adminOnly } from '../../middleware/auth';
import { generateToken, type JWTPayload } from '../../lib/jwt';

type Variables = {
  user: JWTPayload;
};

describe('Auth Middleware', () => {
  let app: Hono<{ Variables: Variables }>;

  beforeEach(() => {
    app = new Hono<{ Variables: Variables }>();
  });

  describe('authMiddleware', () => {
    it('should reject request without authorization header', async () => {
      app.get('/protected', authMiddleware, (c) => c.json({ message: 'success' }));

      const req = new Request('http://localhost/protected');
      const res = await app.request(req);

      expect(res.status).toBe(401);
      const body = await res.json() as { error: string };
      expect(body.error).toContain('token nebyl poskytnut');
    });

    it('should reject request with malformed authorization header', async () => {
      app.get('/protected', authMiddleware, (c) => c.json({ message: 'success' }));

      const req = new Request('http://localhost/protected', {
        headers: { 'Authorization': 'InvalidFormat token123' }
      });
      const res = await app.request(req);

      expect(res.status).toBe(401);
      const body = await res.json() as { error: string };
      expect(body.error).toContain('token nebyl poskytnut');
    });

    it('should reject request with invalid token', async () => {
      app.get('/protected', authMiddleware, (c) => c.json({ message: 'success' }));

      const req = new Request('http://localhost/protected', {
        headers: { 'Authorization': 'Bearer invalid-token' }
      });
      const res = await app.request(req);

      expect(res.status).toBe(401);
      const body = await res.json() as { error: string };
      expect(body.error).toContain('neplatný nebo expirovaný token');
    });

    it('should allow request with valid token', async () => {
      app.get('/protected', authMiddleware, (c) => {
        const user = c.get('user');
        return c.json({ message: 'success', user });
      });

      const token = generateToken({
        userId: '1',
        email: 'test@test.com',
        role: 'admin',
      });

      const req = new Request('http://localhost/protected', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const res = await app.request(req);

      expect(res.status).toBe(200);
      const body = await res.json() as { message: string; user: JWTPayload };
      expect(body.message).toBe('success');
      expect(body.user.userId).toBe('1');
      expect(body.user.email).toBe('test@test.com');
    });

    it('should set user context correctly', async () => {
      app.get('/protected', authMiddleware, (c) => {
        const user = c.get('user');
        return c.json({ 
          userId: user.userId,
          email: user.email,
          role: user.role
        });
      });

      const token = generateToken({
        userId: '123',
        email: 'user@example.com',
        role: 'editor',
      });

      const req = new Request('http://localhost/protected', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const res = await app.request(req);

      expect(res.status).toBe(200);
      const body = await res.json() as { userId: string; email: string; role: string };
      expect(body.userId).toBe('123');
      expect(body.email).toBe('user@example.com');
      expect(body.role).toBe('editor');
    });
  });

  describe('adminOnly middleware', () => {
    it('should reject request without user context', async () => {
      app.get('/admin', adminOnly, (c) => c.json({ message: 'admin access' }));

      const req = new Request('http://localhost/admin');
      const res = await app.request(req);

      expect(res.status).toBe(403);
      const body = await res.json() as { error: string };
      expect(body.error).toContain('Admin access');
    });

    it('should reject editor role', async () => {
      app.get('/admin', authMiddleware, adminOnly, (c) => c.json({ message: 'admin access' }));

      const token = generateToken({
        userId: '1',
        email: 'editor@test.com',
        role: 'editor',
      });

      const req = new Request('http://localhost/admin', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const res = await app.request(req);

      expect(res.status).toBe(403);
      const body = await res.json() as { error: string };
      expect(body.error).toContain('Admin access');
    });

    it('should allow admin role', async () => {
      app.get('/admin', authMiddleware, adminOnly, (c) => c.json({ message: 'admin access granted' }));

      const token = generateToken({
        userId: '1',
        email: 'admin@test.com',
        role: 'admin',
      });

      const req = new Request('http://localhost/admin', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const res = await app.request(req);

      expect(res.status).toBe(200);
      const body = await res.json() as { message: string };
      expect(body.message).toBe('admin access granted');
    });
  });
});
