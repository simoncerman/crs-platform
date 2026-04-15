import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import * as dotenv from 'dotenv';
import auth from './routes/auth';
import articlesRouter from './routes/articles';
import eventsRouter from './routes/events';
import membersRouter from './routes/members';
import projectsRouter from './routes/projects';
import recruitmentRouter from './routes/recruitment';
import uploadRouter from './routes/upload';
import mediaRouter from './routes/media';
import partnersRouter from './routes/partners';
import automationsRouter from './routes/automations';
import { setupSwagger } from './lib/swagger';
import { automationRegistry } from './lib/automation-registry';
import { registerAutomations, automationDefaults } from './automations';

// Load environment variables
dotenv.config();

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Serve static files from uploads directory
app.use('/uploads/*', serveStatic({ root: './' }));

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api', (c) => {
  return c.json({ 
    message: 'Czech Rocket Society API',
    version: '0.1.0',
    endpoints: [
      '/api/auth/login',
      '/api/auth/register',
      '/api/articles',
      '/api/events',
      '/api/members',
      '/api/projects',
      '/api/recruitment',
    ]
  });
});

// Mount route handlers
app.route('/api/auth', auth);
app.route('/api/articles', articlesRouter);
app.route('/api/events', eventsRouter);
app.route('/api/members', membersRouter);
app.route('/api/projects', projectsRouter);
app.route('/api/recruitment', recruitmentRouter);
app.route('/api/upload', uploadRouter);
app.route('/api/media', mediaRouter);
app.route('/api/partners', partnersRouter);
app.route('/api/automations', automationsRouter);

// Setup Swagger documentation
setupSwagger(app);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

const port = parseInt(process.env.PORT || '3001');

// Register and start automations
registerAutomations();
automationRegistry.seedDefaults(automationDefaults).catch(console.error);
automationRegistry.startScheduler();

console.log(`🚀 Server starting on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
