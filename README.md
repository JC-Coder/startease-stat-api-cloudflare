# StartEase Stats API

A lightweight, serverless API built with Hono.js and Cloudflare Workers for tracking project generation statistics across different frameworks for the StartEase application.

## Overview

This API provides endpoints to track and retrieve statistics about projects generated through the StartEase application. It uses Cloudflare D1 as its database and is deployed as a Cloudflare Worker.

## Features

- Track project generation statistics by application and framework
- Retrieve aggregated statistics
- Built with TypeScript for type safety
- Request validation using Zod
- Deployed on Cloudflare's edge network for low-latency responses worldwide

## Tech Stack

- **Framework**: [Hono.js](https://honojs.dev/) - Lightweight web framework for Cloudflare Workers
- **Runtime**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) - SQLite-based serverless database
- **Validation**: [Zod](https://github.com/colinhacks/zod) for request validation
- **Language**: TypeScript

## Prerequisites

- Node.js (v16 or later recommended)
- npm or yarn
- Cloudflare account with Workers and D1 access
- Wrangler CLI installed globally (`npm install -g wrangler`)

## Setup and Installation

1. Clone the repository:

   ```bash
   git clone [repository-url]
   cd startease-stats-api-hono-cloudflare
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure Wrangler:

   - Make sure you're logged in to Cloudflare:
     ```bash
     wrangler login
     ```
   - Update `wrangler.json` with your D1 database details if needed

4. Initialize the database schema:
   ```bash
   wrangler d1 execute startease-db --file=schema.sql
   ```

## Development

Run the development server:

```bash
npm run dev
```

This will start a local development server using Wrangler, typically at http://localhost:8787.

## Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

## API Endpoints

### GET /

Test endpoint that returns all stats.

**Response:**

```json
{
  "results": [
    {
      "id": 1,
      "app": "example-app",
      "totalProjectGenerated": 10,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /add-stat

Add or update statistics for an app and framework.

**Request Body:**

```json
{
  "app": "example-app",
  "framework": "react"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "app": "example-app",
    "totalProjectGenerated": 1,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "message": "Success"
}
```

### GET /all-stats

Retrieve all statistics with framework details.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "app": "example-app",
      "totalProjectGenerated": 10,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z",
      "frameworks": [
        {
          "framework": "react",
          "genCount": 5
        },
        {
          "framework": "vue",
          "genCount": 5
        }
      ]
    }
  ],
  "message": "Success"
}
```

## Database Schema

### stats Table

- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `app`: TEXT NOT NULL UNIQUE
- `totalProjectGenerated`: INTEGER DEFAULT 0
- `createdAt`: DATETIME DEFAULT CURRENT_TIMESTAMP
- `updatedAt`: DATETIME DEFAULT CURRENT_TIMESTAMP

### projectGeneratedStats Table

- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `statId`: INTEGER NOT NULL (Foreign key to stats.id)
- `framework`: TEXT NOT NULL
- `genCount`: INTEGER DEFAULT 0

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "data": null,
  "message": "Error message details"
}
```
