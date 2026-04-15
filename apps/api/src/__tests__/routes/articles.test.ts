import { loginSchema, registerSchema } from '../../schemas/auth';
import { createArticleSchema, updateArticleSchema } from '../../schemas/article';
import { createEventSchema, updateEventSchema } from '../../schemas/event';
import { createMemberSchema, updateMemberSchema } from '../../schemas/member';
import { createProjectSchema, updateProjectSchema } from '../../schemas/project';

describe('Auth Validation Schemas', () => {
  describe('Login Schema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject email without domain', () => {
      const invalidData = {
        email: 'test@',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '12345',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing email', () => {
      const invalidData = {
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Register Schema', () => {
    it('should validate valid registration data', () => {
      const validData = {
        email: 'newuser@example.com',
        password: 'securepass123',
        name: 'John Doe',
        role: 'editor' as const,
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid role', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'superuser',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate admin role', () => {
      const validData = {
        email: 'admin@example.com',
        password: 'adminpass123',
        name: 'Admin User',
        role: 'admin' as const,
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});

describe('Article Validation Schemas', () => {
  describe('Create Article Schema', () => {
    it('should validate valid article data', () => {
      const validData = {
        title: 'Test Article',
        slug: 'test-article',
        content: 'This is test content for the article.',
        status: 'draft' as const,
        publishedAt: '2025-01-15T10:00:00Z',
      };

      const result = createArticleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject title that is too short', () => {
      const invalidData = {
        title: 'AB',
        slug: 'test',
        content: 'Test content',
        authorId: 1,
      };

      const result = createArticleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate published status', () => {
      const validData = {
        title: 'Published Article',
        slug: 'published-article',
        content: 'Content for published article',
        status: 'published' as const,
        publishedAt: '2025-01-15T10:00:00Z',
      };

      const result = createArticleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow optional excerpt', () => {
      const validData = {
        title: 'Article with Excerpt',
        slug: 'article-excerpt',
        content: 'Full article content',
        excerpt: 'Short excerpt',
        publishedAt: '2025-01-15T10:00:00Z',
      };

      const result = createArticleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        title: 'Test',
      };

      const result = createArticleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Update Article Schema', () => {
    it('should accept partial data for update', () => {
      const partialData = {
        title: 'Updated Title',
      };

      const result = updateArticleSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });

    it('should accept status update only', () => {
      const partialData = {
        status: 'published' as const,
      };

      const result = updateArticleSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });

    it('should accept multiple field updates', () => {
      const partialData = {
        title: 'New Title',
        content: 'New content',
        excerpt: 'New excerpt',
      };

      const result = updateArticleSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });
  });
});

describe('Event Validation Schemas', () => {
  describe('Create Event Schema', () => {
    it('should validate valid event data', () => {
      const validData = {
        title: 'Rocket Launch Event',
        slug: 'rocket-launch-2025',
        description: 'Join us for an exciting rocket launch event.',
        startDate: '2025-06-15T10:00:00Z',
        endDate: '2025-06-15T18:00:00Z',
        location: 'Launch Site Alpha',
      };

      const result = createEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate multi-day event', () => {
      const validData = {
        title: 'Multi-day Event',
        slug: 'multi-day-event',
        description: 'A multi-day conference event.',
        startDate: '2025-06-15T10:00:00Z',
        endDate: '2025-06-17T18:00:00Z',
        location: 'Conference Center',
      };

      const result = createEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate all specialStatus types', () => {
      const specialStatuses = ['cancelled', 'postponed'];

      specialStatuses.forEach(specialStatus => {
        const validData = {
          title: `Event with ${specialStatus} status`,
          slug: `event-${specialStatus}`,
          description: 'Test event description.',
          startDate: '2025-06-15T10:00:00Z',
          endDate: '2025-06-15T18:00:00Z',
          location: 'Test Location',
          specialStatus: specialStatus as any,
        };

        const result = createEventSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    it('should validate event without specialStatus (automatic)', () => {
      const validData = {
        title: 'Auto Status Event',
        slug: 'auto-status-event',
        description: 'Event with automatic status from dates.',
        startDate: '2025-06-15T10:00:00Z',
        endDate: '2025-06-15T18:00:00Z',
        location: 'Test Location',
      };

      const result = createEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        title: 'Missing Fields Event',
        slug: 'missing-fields',
      };

      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe('Member Validation Schemas', () => {
  describe('Create Member Schema', () => {
    it('should validate valid member data', () => {
      const validData = {
        name: 'Jane Smith',
        role: 'Engineer',
        bio: 'Experienced aerospace engineer with passion for rocketry.',
      };

      const result = createMemberSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept avatar as string', () => {
      const validData = {
        name: 'John Doe',
        role: 'Pilot',
        avatar: '/uploads/avatar.jpg',
      };

      const result = createMemberSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept optional social links', () => {
      const validData = {
        name: 'Tech Expert',
        role: 'Developer',
        linkedIn: 'https://linkedin.com/in/techexpert',
        github: 'https://github.com/techexpert',
      };

      const result = createMemberSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});

describe('Project Validation Schemas', () => {
  describe('Create Project Schema', () => {
    it('should validate valid project data', () => {
      const validData = {
        name: 'Mars Mission 2026',
        slug: 'mars-mission-2026',
        description: 'Ambitious project to send rover to Mars',
        status: 'planning' as const,
      };

      const result = createProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate completed status', () => {
      const validData = {
        name: 'Moon Landing',
        slug: 'moon-landing',
        description: 'Successfully landed on the moon',
        status: 'completed' as const,
      };

      const result = createProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate all status types', () => {
      const statuses = ['planning', 'development', 'testing', 'completed'];

      statuses.forEach(status => {
        const validData = {
          name: `Project ${status}`,
          slug: `project-${status}`,
          description: `A project in ${status} phase.`,
          status: status as any,
        };

        const result = createProjectSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid status', () => {
      const invalidData = {
        name: 'Test Project',
        slug: 'test-project',
        description: 'Test',
        status: 'invalid-status',
      };

      const result = createProjectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept optional dates', () => {
      const validData = {
        name: 'Timed Project',
        slug: 'timed-project',
        description: 'A project with start and completion dates.',
        startDate: '2025-01-01T00:00:00Z',
        completionDate: '2025-12-31T23:59:59Z',
      };

      const result = createProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
