/**
 * Integration tests for /api/articles endpoints.
 *
 * The database module is mocked so tests never touch a real PostgreSQL
 * instance. Auth middleware uses real JWT verification via lib/jwt.
 */

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// This stores the "final result" that the Drizzle query chain will resolve to.
// We set it per-test before making requests.
let queryResult: unknown[] = [];

// Queue of results — auth middleware consumes the first call, handler gets subsequent ones.
// If queue is empty, falls back to queryResult.
let queryQueue: unknown[][] = [];

/**
 * Build a chainable mock that mirrors Drizzle's query-builder API.
 * Every method returns the same proxy so you can call any sequence of
 * .select().from().where().orderBy() etc. The chain is "terminated"
 * when it is awaited (via .then) — at that point it resolves with
 * whatever `queryResult` is set to (or next item from queryQueue).
 */
function createDbMock(): Record<string, jest.Mock> {
  const handler: ProxyHandler<Record<string, jest.Mock>> = {
    get(_target, prop) {
      if (prop === 'then') {
        return (resolve: (v: unknown) => void) => {
          if (queryQueue.length > 0) {
            resolve(queryQueue.shift()!);
          } else {
            resolve(queryResult);
          }
        };
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

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { Hono } from 'hono';
import articlesRouter from '../../routes/articles';
import { generateToken } from '../../lib/jwt';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildApp() {
  const app = new Hono();
  app.route('/api/articles', articlesRouter);
  return app;
}

const validToken = generateToken({
  userId: 'user-uuid-1',
  email: 'admin@crs.cz',
  role: 'admin',
});

function authHeader() {
  return { Authorization: `Bearer ${validToken}` };
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const publishedArticle = {
  id: 'art-uuid-1',
  title: 'Published Article',
  slug: 'published-article',
  excerpt: 'Excerpt',
  content: 'Full content of the published article.',
  coverImage: null,
  images: [],
  category: null,
  tags: [],
  status: 'published',
  published: true,
  publishedAt: new Date('2025-01-15'),
  authorId: 'user-uuid-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const draftArticle = {
  ...publishedArticle,
  id: 'art-uuid-2',
  title: 'Draft Article',
  slug: 'draft-article',
  status: 'draft',
  published: false,
  publishedAt: null,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('/api/articles', () => {
  const app = buildApp();

  beforeEach(() => {
    queryResult = [];
    queryQueue = [];
  });

  // ---- GET /api/articles (public) ----

  describe('GET /api/articles (public, no auth)', () => {
    it('returns published articles', async () => {
      queryResult = [publishedArticle];

      const res = await app.request('/api/articles');

      expect(res.status).toBe(200);
      const body = (await res.json()) as Record<string, unknown>;
      const articles = body.articles as unknown[];
      expect(Array.isArray(articles)).toBe(true);
      expect(articles).toHaveLength(1);
    });

    it('returns empty array when no articles exist', async () => {
      queryResult = [];

      const res = await app.request('/api/articles');

      expect(res.status).toBe(200);
      const body = (await res.json()) as Record<string, unknown>;
      const articles = body.articles as unknown[];
      expect(articles).toHaveLength(0);
    });
  });

  // ---- GET /api/articles (authenticated) ----

  describe('GET /api/articles (with auth)', () => {
    it('returns all articles including drafts', async () => {
      queryResult = [publishedArticle, draftArticle];

      const res = await app.request('/api/articles', {
        headers: authHeader(),
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as Record<string, unknown>;
      const articles = body.articles as unknown[];
      expect(articles).toHaveLength(2);
    });
  });

  // ---- GET /api/articles/slug/:slug ----

  describe('GET /api/articles/slug/:slug', () => {
    it('returns a published article by slug', async () => {
      queryResult = [publishedArticle];

      const res = await app.request('/api/articles/slug/published-article');

      expect(res.status).toBe(200);
      const body = (await res.json()) as Record<string, unknown>;
      const article = body.article as Record<string, unknown>;
      expect(article.slug).toBe('published-article');
    });

    it('returns 404 for non-existent slug', async () => {
      queryResult = [];

      const res = await app.request('/api/articles/slug/no-such-article');

      expect(res.status).toBe(404);
    });

    it('returns 404 for unpublished article slug', async () => {
      queryResult = [draftArticle];

      const res = await app.request('/api/articles/slug/draft-article');

      expect(res.status).toBe(404);
    });
  });

  // ---- POST /api/articles (protected) ----

  describe('POST /api/articles', () => {
    const validArticle = {
      title: 'New Test Article',
      slug: 'new-test-article',
      content: 'This is the content for a new article, long enough.',
      status: 'draft' as const,
      publishedAt: '2025-01-15T10:00:00Z',
    };

    it('returns 401 without auth token', async () => {
      const res = await app.request('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validArticle),
      });

      expect(res.status).toBe(401);
    });

    it('creates an article with valid auth and data', async () => {
      queryResult = [{
        ...validArticle,
        id: 'new-art-uuid',
        authorId: 'user-uuid-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }];

      const res = await app.request('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify(validArticle),
      });

      expect(res.status).toBe(201);
      const body = (await res.json()) as Record<string, unknown>;
      const article = body.article as Record<string, unknown>;
      expect(article.title).toBe('New Test Article');
      expect(article.authorId).toBe('user-uuid-1');
    });

    it('returns 400 for missing required fields', async () => {
      // Auth middleware needs a user, then validation should fail
      queryQueue = [[{ id: 'user-uuid-1' }]];
      queryResult = [];

      const res = await app.request('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({ title: 'Only title' }),
      });

      expect(res.status).toBe(400);
    });
  });

  // ---- PUT /api/articles/:id (protected) ----

  describe('PUT /api/articles/:id', () => {
    it('returns 401 without auth token', async () => {
      const res = await app.request('/api/articles/art-uuid-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated' }),
      });

      expect(res.status).toBe(401);
    });

    it('updates an article with valid auth', async () => {
      // The route does two awaits: first select, then update...returning
      // With our proxy mock, both resolve to queryResult.
      // We need the first await (select) to find the article, and the
      // second await (update chain) to return the updated article.
      // Since queryResult is shared, set it to the updated article — the
      // select will also return it (which is fine, it just checks existence).
      queryResult = [{
        ...publishedArticle,
        title: 'Updated Title',
      }];

      const res = await app.request('/api/articles/art-uuid-1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({ title: 'Updated Title' }),
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as Record<string, unknown>;
      const article = body.article as Record<string, unknown>;
      expect(article.title).toBe('Updated Title');
    });

    it('returns 404 when article does not exist', async () => {
      // Auth passes, then article lookup returns empty
      queryQueue = [[{ id: 'user-uuid-1' }]];
      queryResult = [];

      const res = await app.request('/api/articles/nonexistent-uuid', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({ title: 'Updated Title' }),
      });

      expect(res.status).toBe(404);
    });
  });

  // ---- DELETE /api/articles/:id (protected) ----

  describe('DELETE /api/articles/:id', () => {
    it('returns 401 without auth token', async () => {
      const res = await app.request('/api/articles/art-uuid-1', {
        method: 'DELETE',
      });

      expect(res.status).toBe(401);
    });

    it('deletes an article with valid auth', async () => {
      queryResult = [publishedArticle];

      const res = await app.request('/api/articles/art-uuid-1', {
        method: 'DELETE',
        headers: authHeader(),
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as Record<string, unknown>;
      expect(body.message).toBe('Article deleted successfully');
    });

    it('returns 404 when article does not exist', async () => {
      // Auth passes, then article lookup returns empty
      queryQueue = [[{ id: 'user-uuid-1' }]];
      queryResult = [];

      const res = await app.request('/api/articles/nonexistent-uuid', {
        method: 'DELETE',
        headers: authHeader(),
      });

      expect(res.status).toBe(404);
    });
  });
});
