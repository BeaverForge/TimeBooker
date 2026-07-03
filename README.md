# Time Booker

A lesson scheduling app. Users browse available time slots and book a lesson with the coach. The coach receives an email to confirm or decline, and the user is notified of the outcome.

## Stack

- **Frontend:** React + TypeScript (Vite)
- **Backend:** Go
- **Database:** PostgreSQL (Docker)

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) with Docker Compose
- [Node.js](https://nodejs.org/) (v18+)
- [Go](https://go.dev/) (v1.21+)

## Running the app

### 1. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

### 2. Start the database and backend API

```bash
docker compose up --build
```

This does two things:
- **Builds** the Go backend into a Docker image using the `Dockerfile` in `backend/`. The build compiles the Go source into a single binary.
- **Starts** two containers: `db` (PostgreSQL) and `app` (the Go API server). On first run, PostgreSQL automatically executes `backend/internal/db/sql/schema.sql` to create the database tables. The two containers communicate over a private internal Docker network.

The API will be available at `http://localhost:8080`.

To stop the containers:

```bash
docker compose down
```

### 3. Start the frontend dev server

In a separate terminal, from the `frontend/` directory:

```bash
cd frontend
npm install   # only needed the first time
npm run dev
```

`npm install` downloads the JavaScript dependencies listed in `package.json` into `node_modules/`.

`npm run dev` starts the Vite development server. Vite serves the React app and watches your source files for changes — any edit you save is reflected in the browser instantly without a full page reload (this is called Hot Module Replacement, or HMR).

The app will be available at `http://localhost:5173`.


TODO: 

Email — coach gets notified on booking, user gets notified on confirm/decline
Frontend deployment — serving the React app from somewhere (nginx on the droplet, or elsewhere)
Firewall — lock down the droplet so only necessary ports are exposed
CORS — make the allowed origin configurable for production