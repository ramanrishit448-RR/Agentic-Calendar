# Local setup guide — Agentic Calendar

This guide walks you through running **Agentic Calendar** on your machine from a fresh clone. You will run PostgreSQL in Docker, the Express/Mastra backend on port **4000**, and the Next.js frontend on port **3000**.

---

## What you need before you start

| Requirement | Notes |
| :--- | :--- |
| **Node.js 20+** | Check with `node -v` |
| **npm** | Bundled with Node.js; check with `npm -v` |
| **Docker Desktop** | Used for PostgreSQL (port **5442** on the host) |
| **Descope account** | [Sign up](https://www.descope.com/) — auth and Google Calendar OAuth |
| **LLM API key** | **Google Gemini** (recommended) or **OpenAI** — at least one is required |
| **Google Cloud** | Google Calendar API enabled; OAuth wired through Descope |

---

## Step 1 — Clone the repository

```bash
git clone <your-repo-url>
cd Agentic-Calendar
```

Use the actual clone URL for your fork or the upstream repository.

---

## Step 2 — Configure external services

### 2.1 Descope (authentication)

1. Create a project in the [Descope Console](https://app.descope.com/).
2. Copy the **Project ID** (starts with `P2...`).
3. Under project settings, create or copy a **Management Key** (starts with `K2...`). Store it securely; the backend uses it for user and token operations.
4. Enable a sign-in flow for your app (e.g. email/password or social) and note the flow ID if you customize the sign-in page later.

### 2.2 Google Calendar via Descope (outbound connection)

1. In [Google Cloud Console](https://console.cloud.google.com/), enable the **Google Calendar API** for your project.
2. Configure OAuth consent and credentials as required by Descope’s Google Calendar outbound connector documentation.
3. In Descope, add an **Outbound App / connection** for Google Calendar.
4. Set the connection ID in your backend `.env` as `DESCOPE_CALENDAR_CONNECTION_ID`. The default in `.env.example` is `google-calendar` — it must match the ID in Descope exactly.

### 2.3 LLM provider (pick one)

**Option A — Google Gemini (matches README recommendation)**

1. Create an API key in [Google AI Studio](https://aistudio.google.com/api-keys).
2. In `backend/.env`, set `GOOGLE_GEMINI_API_KEY=...`.
3. Optionally set `AI_MODEL` (e.g. `gemini-2.5-pro`). If omitted with a Gemini key, the app uses a default Gemini model.

**Option B — OpenAI**

1. Create an API key at [OpenAI](https://platform.openai.com/api-keys).
2. In `backend/.env`, set `OPENAI_API_KEY=...` and optionally `AI_MODEL=gpt-4o-mini`.

Do not set both as primary without understanding precedence: if a Gemini key is present, Gemini is used first (see `backend/src/services/agent.service.ts`).

---

## Step 3 — Start PostgreSQL (Docker)

From the **repository root** (where `docker-compose.yml` lives):

```bash
docker compose up -d
```

Verify the container is running:

```bash
docker compose ps
```

Expected database settings (already defined in `docker-compose.yml`):

| Setting | Value |
| :--- | :--- |
| Host | `localhost` |
| Port | `5442` |
| User / password | `postgres` / `postgres` |
| Database | `agentic_calendar_app_db` |

Connection string (used in backend `.env`):

```text
postgresql://postgres:postgres@localhost:5442/agentic_calendar_app_db
```

---

## Step 4 — Backend setup

Open a terminal in the `backend` folder.

### 4.1 Install dependencies

```bash
cd backend
npm install
```

### 4.2 Environment file

**Linux / macOS:**

```bash
cp .env.example .env
```

**Windows (PowerShell):**

```powershell
Copy-Item .env.example .env
```

Edit `backend/.env` and fill in at least:

| Variable | Purpose |
| :--- | :--- |
| `DATABASE_URL` | Use the connection string from Step 3 unless you changed Docker settings |
| `DESCOPE_PROJECT_ID` | From Descope |
| `DESCOPE_MANAGEMENT_KEY` | From Descope |
| `DESCOPE_CALENDAR_CONNECTION_ID` | Must match your Descope Google Calendar connection |
| `GOOGLE_GEMINI_API_KEY` **or** `OPENAI_API_KEY` | At least one LLM key |

Defaults you can usually keep for local dev:

- `PORT=4000`
- `APP_URL=http://localhost:3000`
- `SERVER_URL=http://localhost:4000`
- `DESCOPE_MCP_SERVER_WELL_KNOWN_URL=http://localhost:4000/.well-known/mcp`

### 4.3 Run database migrations

With PostgreSQL up and `DATABASE_URL` set:

```bash
npm run migrate
```

You should see lines like `Migrated: sql/001_users.sql` and `Migrated: sql/002_connections.sql`.

### 4.4 Start the backend dev server

```bash
npm run dev
```

Leave this terminal open. The API should be available at **http://localhost:4000**.

Optional production-style run:

```bash
npm run build
npm start
```

---

## Step 5 — Frontend setup

Open a **second** terminal in the `frontend` folder.

### 5.1 Install dependencies

```bash
cd frontend
npm install
```

### 5.2 Environment file

**Linux / macOS:**

```bash
cp .env.example .env.local
```

**Windows (PowerShell):**

```powershell
Copy-Item .env.example .env.local
```

Edit `frontend/.env.local`:

| Variable | Value |
| :--- | :--- |
| `NEXT_PUBLIC_DESCOPE_PROJECT_ID` | Same Project ID as backend `DESCOPE_PROJECT_ID` |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` |

### 5.3 Start the Next.js dev server

```bash
npm run dev
```

Leave this terminal open. The app should be at **http://localhost:3000**.

---

## Step 6 — Use the app locally

1. Open **http://localhost:3000** in your browser.
2. Sign in via Descope (redirects to `/sign-in` if needed).
3. Go to the **dashboard**.
4. Connect **Google Calendar** using the connection panel (OAuth through Descope). Wait until status shows **Connected**.
5. Open the chat and try a prompt, e.g. *"What does my schedule look like for today?"*

Both servers must stay running while you develop:

| Service | URL |
| :--- | :--- |
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| PostgreSQL | localhost:5442 |

---

## Quick reference — npm scripts

**Backend (`backend/`)**

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start API with hot reload (`tsx watch`) |
| `npm run migrate` | Apply SQL files in `backend/sql/` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled server |

**Frontend (`frontend/`)**

| Command | Description |
| :--- | :--- |
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm start` | Serve production build |

---

## Troubleshooting

### Docker / database

- **Port 5442 already in use** — Stop the other service or change the host port in `docker-compose.yml` and update `DATABASE_URL` accordingly.
- **`npm run migrate` fails** — Ensure `docker compose up -d` completed and `DATABASE_URL` matches Docker credentials.

### Backend

- **Missing LLM API key** — Set `GOOGLE_GEMINI_API_KEY` or `OPENAI_API_KEY` in `backend/.env` and restart `npm run dev`.
- **Descope errors** — Confirm `DESCOPE_PROJECT_ID` and `DESCOPE_MANAGEMENT_KEY`; management key is required for server-side operations.
- **CORS issues** — `APP_URL` in backend `.env` must be `http://localhost:3000` (no trailing slash mismatch with the browser origin).

### Frontend

- **Sign-in fails** — `NEXT_PUBLIC_DESCOPE_PROJECT_ID` must match the Descope project; restart `npm run dev` after changing `.env.local`.
- **API errors / network failed** — Check `NEXT_PUBLIC_API_URL` points to `http://localhost:4000` and the backend terminal shows no crash.

### Google Calendar connection

- **Stuck on Not Connected / Pending** — Verify Descope outbound Google Calendar setup and that `DESCOPE_CALENDAR_CONNECTION_ID` matches Descope. Use refresh on the connection panel after completing OAuth.
- **OAuth redirect** — Local redirect typically returns to `http://localhost:3000/dashboard`; ensure that URL is allowed in Descope/Google OAuth settings if you use custom domains.

---

## Stopping local services

```bash
# From repo root — stop PostgreSQL
docker compose down

# Stop frontend and backend with Ctrl+C in their terminals
```

To remove PostgreSQL data volumes (full reset):

```bash
docker compose down -v
```

You will need to run `npm run migrate` again after recreating the database.

---

## Next steps

- Environment variable tables also appear in [README.md](./README.md#-environment-variables).
- Example chat prompts are in [README.md](./README.md#-example-prompts).
