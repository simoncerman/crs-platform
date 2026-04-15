/**
 * Integration tests for POST /api/auth/login.
 *
 * The database module and bcryptjs are mocked so tests never touch
 * a real PostgreSQL instance.
 */

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

let queryResult: unknown[] = [];

/**
 * Chainable Drizzle mock — every method returns a proxy that can be
 * further chained. Awaiting the chain resolves with `queryResult`.
 */
function createDbMock(): Record<string, jest.Mock> {
  const handler: ProxyHandler<Record<string, jest.Mock>> = {
    get(_target, prop) {
      if (prop === 'then') {
        return (resolve: (v: unknown) => void) => resolve(queryResult);
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

jest.mock('bcryptjs', () => ({
  __esModule: true,
  default: {
    compare: jest.fn(),
    hash: jest.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { Hono } from 'hono';
import authRouter from '../../routes/auth';
import bcrypt from 'bcryptjs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildApp() {
  const app = new Hono();
  app.route('/api/auth', authRouter);
  return app;
}

function post(app: Hono, path: string, body: unknown) {
  return app.request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const fakeUser = {
  id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  email: 'admin@crs.cz',
  passwordHash: '$2a$10$hashedpassword',
  name: 'Admin CRS',
  role: 'admin',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/auth/login', () => {
  const app = buildApp();

  beforeEach(() => {
    jest.clearAllMocks();
    queryResult = [];
  });

  it('returns 200 with token and user for valid credentials', async () => {
    queryResult = [fakeUser];
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const res = await post(app, '/api/auth/login', {
      email: 'admin@crs.cz',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toHaveProperty('token');
    expect(typeof body.token).toBe('string');
    const user = body.user as Record<string, unknown>;
    expect(user.id).toBe(fakeUser.id);
    expect(user.email).toBe(fakeUser.email);
    expect(user.name).toBe(fakeUser.name);
    expect(user.role).toBe(fakeUser.role);
  });

  it('returns 401 when password is wrong', async () => {
    queryResult = [fakeUser];
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const res = await post(app, '/api/auth/login', {
      email: 'admin@crs.cz',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.error).toBe('Invalid credentials');
  });

  it('returns 401 when email does not exist', async () => {
    queryResult = [];

    const res = await post(app, '/api/auth/login', {
      email: 'nobody@crs.cz',
      password: 'password123',
    });

    expect(res.status).toBe(401);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.error).toBe('Invalid credentials');
  });

  it('returns 400 when email is missing', async () => {
    const res = await post(app, '/api/auth/login', {
      password: 'password123',
    });

    expect(res.status).toBe(400);
  });

  it('returns 400 when password is missing', async () => {
    const res = await post(app, '/api/auth/login', {
      email: 'admin@crs.cz',
    });

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid email format', async () => {
    const res = await post(app, '/api/auth/login', {
      email: 'not-valid',
      password: 'password123',
    });

    expect(res.status).toBe(400);
  });

  it('returns 400 when password is shorter than 6 characters', async () => {
    const res = await post(app, '/api/auth/login', {
      email: 'admin@crs.cz',
      password: '12345',
    });

    expect(res.status).toBe(400);
  });
});
