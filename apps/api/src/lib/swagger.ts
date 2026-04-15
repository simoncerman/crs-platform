import { swaggerUI } from '@hono/swagger-ui';
import { Hono } from 'hono';

export function setupSwagger(app: Hono) {
  // Swagger UI route
  app.get('/docs', swaggerUI({ url: '/api/openapi.json' }));

  // OpenAPI JSON spec
  app.get('/api/openapi.json', (c) => {
    return c.json({
      openapi: '3.0.0',
      info: {
        title: 'Czech Rocket Society API',
        version: '0.1.0',
        description: 'REST API pro Czech Rocket Society platformu',
      },
      servers: [
        {
          url: 'http://localhost:3001',
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
        schemas: {
          Error: {
            type: 'object',
            properties: {
              error: {
                type: 'string',
              },
            },
          },
          User: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
              },
              email: {
                type: 'string',
                format: 'email',
              },
              name: {
                type: 'string',
              },
              role: {
                type: 'string',
                enum: ['admin', 'editor'],
              },
            },
          },
          Article: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
              },
              title: {
                type: 'string',
              },
              slug: {
                type: 'string',
              },
              excerpt: {
                type: 'string',
                nullable: true,
              },
              content: {
                type: 'string',
              },
              coverImage: {
                type: 'string',
                nullable: true,
              },
              category: {
                type: 'string',
                nullable: true,
              },
              tags: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              published: {
                type: 'boolean',
              },
              publishedAt: {
                type: 'string',
                format: 'date-time',
                nullable: true,
              },
              authorId: {
                type: 'string',
                format: 'uuid',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
        },
      },
      paths: {
        '/api/auth/login': {
          post: {
            tags: ['Authentication'],
            summary: 'Přihlášení uživatele',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                      email: {
                        type: 'string',
                        format: 'email',
                      },
                      password: {
                        type: 'string',
                        minLength: 6,
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Úspěšné přihlášení',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        token: {
                          type: 'string',
                        },
                        user: {
                          $ref: '#/components/schemas/User',
                        },
                      },
                    },
                  },
                },
              },
              '401': {
                description: 'Neplatné přihlašovací údaje',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Error',
                    },
                  },
                },
              },
            },
          },
        },
        '/api/articles': {
          get: {
            tags: ['Articles'],
            summary: 'Získat všechny články',
            responses: {
              '200': {
                description: 'Seznam článků',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        articles: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/Article',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          post: {
            tags: ['Articles'],
            summary: 'Vytvořit nový článek',
            security: [{ bearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['title', 'slug', 'content', 'authorId'],
                    properties: {
                      title: {
                        type: 'string',
                        minLength: 3,
                      },
                      slug: {
                        type: 'string',
                        minLength: 3,
                      },
                      excerpt: {
                        type: 'string',
                      },
                      content: {
                        type: 'string',
                        minLength: 10,
                      },
                      coverImage: {
                        type: 'string',
                        format: 'uri',
                      },
                      status: {
                        type: 'string',
                        enum: ['draft', 'published'],
                        default: 'draft',
                      },
                      authorId: {
                        type: 'integer',
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'Článek vytvořen',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        article: {
                          $ref: '#/components/schemas/Article',
                        },
                      },
                    },
                  },
                },
              },
              '401': {
                description: 'Unauthorized',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Error',
                    },
                  },
                },
              },
            },
          },
        },
        '/api/articles/{id}': {
          get: {
            tags: ['Articles'],
            summary: 'Získat článek podle ID',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                  type: 'integer',
                },
              },
            ],
            responses: {
              '200': {
                description: 'Detail článku',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        article: {
                          $ref: '#/components/schemas/Article',
                        },
                      },
                    },
                  },
                },
              },
              '404': {
                description: 'Článek nenalezen',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Error',
                    },
                  },
                },
              },
            },
          },
          put: {
            tags: ['Articles'],
            summary: 'Aktualizovat článek',
            security: [{ bearerAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                  type: 'integer',
                },
              },
            ],
            responses: {
              '200': {
                description: 'Článek aktualizován',
              },
              '401': {
                description: 'Unauthorized',
              },
              '404': {
                description: 'Článek nenalezen',
              },
            },
          },
          delete: {
            tags: ['Articles'],
            summary: 'Smazat článek',
            security: [{ bearerAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                  type: 'integer',
                },
              },
            ],
            responses: {
              '200': {
                description: 'Článek smazán',
              },
              '401': {
                description: 'Unauthorized',
              },
              '404': {
                description: 'Článek nenalezen',
              },
            },
          },
        },
        '/api/events': {
          get: {
            tags: ['Events'],
            summary: 'Získat všechny události',
            responses: {
              '200': {
                description: 'Seznam událostí',
              },
            },
          },
        },
        '/api/members': {
          get: {
            tags: ['Members'],
            summary: 'Získat všechny členy',
            responses: {
              '200': {
                description: 'Seznam členů',
              },
            },
          },
        },
        '/api/projects': {
          get: {
            tags: ['Projects'],
            summary: 'Získat všechny projekty',
            responses: {
              '200': {
                description: 'Seznam projektů',
              },
            },
          },
        },
        '/api/recruitment': {
          post: {
            tags: ['Recruitment'],
            summary: 'Odeslat náborový formulář',
            responses: {
              '201': {
                description: 'Formulář odeslán',
              },
            },
          },
        },
      },
    });
  });
}
