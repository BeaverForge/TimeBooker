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
```day

### 2. Configure local Docker overrides

Copy the example Docker Compose override file for local development:

```bash
cp docker-compose.override.yml.example docF someker-compose.override.yml
```

This exposes the Go backend on port 8080 so the Vite dev server can reach it. It is gitignored and has no effect in production.

### 3. Start the database and backend API

```bash
docker compose up --build
```

This does two things:
- **Builds** the Go backend into a Docker image using the `Dockerfile` in `backend/`. The build compiles the Go source into a single binary.
- **Starts** two containers: `db` (PostgreSQL) and `app` (the Go API server). On first run, PostgreSQL automatically executes `backend/internal/db/sql/schema.sql` to create the database tables. The two containers communicate over a private internal Docker network.

With the override file in place, the API will be available at `http://localhost:8080` for the Vite dev server to reach. Without it, the backend is internal to Docker and only reachable through nginx at `http://localhost`.

To stop the containers:

```bash
docker compose down
```

### 4. Start the frontend dev server

In a separate terminal, from the `frontend/` directory:

```bash
cd frontend
npm install   # only needed the first time
npm run dev
```

`npm install` downloads the JavaScript dependencies listed in `package.json` into `node_modules/`.

`npm run dev` starts the Vite development server. Vite serves the React app and watches your source files for changes — any edit you save is reflected in the browser instantly without a full page reload (this is called Hot Module Replacement, or HMR).

The app will be available at `http://localhost:5173`.

## Manual DB updates

After starting the containers, connect to the database:

```bash
docker compose exec db psql -U $POSTGRES_USER -d $POSTGRES_DB
```

Then, you can run whatever queries you like. 

For example, you can insert some available slots:

```sql
INSERT INTO slots (start_time, end_time) VALUES
  (NOW() + INTERVAL '1 day' + INTERVAL '9 hours',  NOW() + INTERVAL '1 day' + INTERVAL '10 hours'),
  (NOW() + INTERVAL '1 day' + INTERVAL '11 hours', NOW() + INTERVAL '1 day' + INTERVAL '12 hours'),
  (NOW() + INTERVAL '2 days' + INTERVAL '14 hours', NOW() + INTERVAL '2 days' + INTERVAL '15 hours'),
  (NOW() + INTERVAL '2 days' + INTERVAL '16 hours', NOW() + INTERVAL '2 days' + INTERVAL '17 hours');
```

Coaches can also create slots directly from the UI once logged in with a coach account.

