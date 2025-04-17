import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Web Scraper API',
      version: '1.0.0',
      description: 'API documentation for the AI-powered web scraper and search engine',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
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
        User: {
          type: 'object',
          required: ['email', 'password', 'name'],
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
        Scrape: {
          type: 'object',
          required: ['url'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            url: {
              type: 'string',
              format: 'uri',
            },
            title: {
              type: 'string',
            },
            cleanData: {
              type: 'object',
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
      '/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'name'],
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                    },
                    password: {
                      type: 'string',
                      format: 'password',
                    },
                    name: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'User registered successfully',
            },
            '400': {
              description: 'Invalid input',
            },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login user',
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
                      format: 'password',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Login successful',
            },
            '401': {
              description: 'Invalid credentials',
            },
          },
        },
      },
      '/scrape': {
        post: {
          tags: ['Scraping'],
          summary: 'Scrape a URL',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['url'],
                  properties: {
                    url: {
                      type: 'string',
                      format: 'uri',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'URL scraped successfully',
            },
            '400': {
              description: 'Invalid URL',
            },
            '401': {
              description: 'Unauthorized',
            },
          },
        },
        get: {
          tags: ['Scraping'],
          summary: 'Get scraped data',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'List of scraped data',
            },
            '401': {
              description: 'Unauthorized',
            },
          },
        },
      },
      '/scrape/{id}': {
        delete: {
          tags: ['Scraping'],
          summary: 'Delete scraped data',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Scraped data deleted successfully',
            },
            '401': {
              description: 'Unauthorized',
            },
            '404': {
              description: 'Scrape not found',
            },
          },
        },
      },
      '/search': {
        post: {
          tags: ['Search'],
          summary: 'Search through scraped content',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['query'],
                  properties: {
                    query: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Search results',
            },
            '401': {
              description: 'Unauthorized',
            },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, '../routes/*.ts')],
};

export const swaggerSpec = swaggerJsdoc(options); 