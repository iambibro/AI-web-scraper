# Web Scraper with PostgreSQL in Docker

A web scraper application with Docker-based PostgreSQL database and JWT authentication.

## Prerequisites

- Node.js (v16+)
- npm or yarn
- Docker and Docker Compose

## Setup Instructions

1. **Clone the repository**

```bash
git clone <repository-url>
cd web-scraper-01
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
- `POST /api/auth/login` - Login and get JWT token

### Scraping

- `POST /api/scrape` - Scrape a URL
- `GET /api/scrape` - Get all scraped URLs
- `DELETE /api/scrape/:id` - Delete a scraped URL

### Search

- `POST /api/search` - Search through scraped content

## Docker Commands

- Start the database: `npm run docker:up`
- Stop the database: `npm run docker:down`
- Reset the database: `npm run db:reset`

## License

MIT 