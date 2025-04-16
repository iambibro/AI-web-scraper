# Web Scraper with PostgreSQL in Docker

A web scraper application with Docker-based PostgreSQL database and JWT authentication.

## Project Structure

```
.
├── src/                    # Source code
│   ├── controllers/       # Route controllers
│   ├── middlewares/       # Express middlewares
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── validations/      # Request validation schemas
│   ├── config/           # Configuration files
│   └── prisma/           # Database schema and migrations
├── dist/                  # Compiled JavaScript files
├── prisma/                # Prisma ORM files
├── .env                   # Environment variables
├── .env.example          # Example environment variables
├── docker-compose.yml     # Docker configuration
├── package.json          # Project dependencies
└── tsconfig.json         # TypeScript configuration
```

## Prerequisites

- Node.js (v16+)
- npm or yarn
- Docker and Docker Compose

## Setup Instructions

1. **Clone the repository**

```bash
git clone <repository-url>
cd AI-web-scraper
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory with your environment variables (see `.env.example` for reference).

4. **Start the PostgreSQL database with Docker**

```bash
npm run docker:up
```

5. **Initialize the database**

```bash
npm run db:setup
```

6. **Start the development server**

```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  - Request body: `{ email: string, password: string }`
- `POST /api/auth/login` - Login and get JWT token
  - Request body: `{ email: string, password: string }`

### Scraping

- `POST /api/scrape` - Scrape a URL
  - Request body: `{ url: string }`
  - Requires authentication
- `GET /api/scrape` - Get all scraped URLs with pagination and search
  - Query parameters: 
    - `title` (optional): Filter by title
    - `url` (optional): Filter by URL
    - `page` (optional): Page number (default: 1)
    - `limit` (optional): Items per page (default: 10, max: 100)
  - Requires authentication
- `DELETE /api/scrape/:id` - Delete a scraped URL
  - Requires authentication

### Search

- `POST /api/search` - Perform semantic search on scraped content
  - Request body: `{ query: string }`
  - Requires authentication

## Docker Commands

- Start the database: `npm run docker:up`
- Stop the database: `npm run docker:down`
- Reset the database: `npm run db:reset`

## License

MIT 