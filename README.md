<div align="center">

# 📅 Agentic Calendar

### *An Intelligent, Context-Aware AI Executive Assistant for Google Calendar*

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.2-lightgrey?style=for-the-badge&logo=express&logoColor=black)](https://expressjs.com/)
[![Mastra AI](https://img.shields.io/badge/Mastra_AI-1.59-purple?style=for-the-badge&logo=openai&logoColor=white)](https://mastra.ai/)
[![Descope](https://img.shields.io/badge/Descope_MCP-Auth_&_Tools-FF6B6B?style=for-the-badge&logo=descope&logoColor=white)](https://www.descope.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

<br/>

<p align="center">
  <b>Agentic Calendar</b> transforms how you manage your schedule. Instead of clicking through endless calendar tabs, simply speak or type to your autonomous AI assistant. Built with <b>Mastra AI</b>, <b>Descope MCP</b>, and <b>Google Calendar API</b>, it provides persistent working memory, real-time event management, and intelligent conversational scheduling.
</p>

[Key Features](#-key-features) •
[Architecture](#-system-architecture) •
[Tech Stack](#-tech-stack) •
[Project Structure](#-project-structure) •
[Getting Started](#-getting-started) •
[Environment Variables](#-environment-variables) •
[Example Prompts](#-example-prompts)

---

</div>

## 💡 Why Agentic Calendar?

Traditional calendar apps require excessive manual friction: clicking through dates, manually configuring meeting durations, entering attendee emails, generating video links, and verifying conflicts across multiple views.

**Agentic Calendar** acts as an autonomous executive scheduler that:
1. **Understands Natural Language & Context:** Understands complex scheduling requests like *"Set up a quick sync with John tomorrow afternoon, but check what I have before that."*
2. **Maintains Working Memory:** Retains user habits, timezones, default durations, and regular invitees across conversations without repetitive prompting.
3. **Executes Authenticated Tool Calls:** Utilizes the **Model Context Protocol (MCP)** powered by Descope to securely execute actions directly against your Google Calendar on your behalf.
4. **Delivers Real-time Streaming Feedback:** Displays immediate token streaming and agent planning progress indicators while invoking tools.

---

## ✨ Key Features

- 🧠 **Autonomous Planning & Tool Execution:** Powered by [Mastra Agent](https://mastra.ai/) with dynamic tool dispatching (Listing, Creating, Rescheduling, Canceling meetings).
- 🔒 **Secure Auth & Integration via Descope:** Out-of-the-box user authentication and delegated Google Calendar OAuth handling via Descope MCP.
- ⚡ **Real-Time Token Streaming & Agent Events:** Live feedback showing planning state, tool execution indicators, and conversational token responses.
- 📝 **Persistent Memory & Thread History:** Multi-session thread recall powered by PostgreSQL and Mastra Memory.
- 🎨 **Modern Minimalist UI:** Built with Next.js 16 App Router, Tailwind CSS v4, Lucide icons, and Markdown formatting.
- 🐳 **One-Command Database Orchestration:** Includes Docker Compose configuration for instant PostgreSQL setup.

---

## 🏗 System Architecture

```mermaid
flowchart TD
    subgraph Client ["🖥️ Frontend (Next.js 16 + React 19)"]
        UI[Chat Interface & Dashboard]
        AuthClient[Descope Next.js SDK]
    end

    subgraph Backend ["⚙️ Backend (Express + TypeScript)"]
        Router[Express API & Middleware]
        McpServer[Descope MCP Express Server]
        
        subgraph AgentEngine ["🤖 Mastra AI Engine"]
            Agent[Mastra Meeting Assistant]
            Memory[(Working Memory & Thread Recall)]
        end
        
        subgraph Tools ["🛠️ MCP Tools"]
            CalendarTool[Google Calendar Tools]
            TokenService[Descope Token Exchange]
        end
    end

    subgraph External ["🌐 External Services"]
        DescopeAuth[Descope Auth & OAuth Provider]
        OpenAI[OpenAI / LLM Provider]
        GCal[Google Calendar API]
        Postgres[(PostgreSQL DB: 5442)]
    end

    UI <-->|Session & JWT| AuthClient
    AuthClient <-->|User Auth| DescopeAuth
    UI <-->|SSE Stream & Chat Requests| Router
    Router <--> Agent
    Agent <--> Memory
    Memory <--> Postgres
    Agent <-->|Prompt & Completions| OpenAI
    Agent -->|Execute Tools| McpServer
    McpServer --> CalendarTool
    CalendarTool --> TokenService
    TokenService <-->|Fetch Google Access Token| DescopeAuth
    CalendarTool <-->|Read / Write Events| GCal
```

---

## 💻 Tech Stack

### Frontend
| Technology | Purpose |
| :--- | :--- |
| **Next.js 16 (App Router)** | Modern full-stack React framework |
| **React 19** | Concurrent UI rendering and state handling |
| **@descope/nextjs-sdk** | Client-side authentication and session management |
| **Tailwind CSS v4 & shadcn/ui** | Utility-first responsive design and UI components |
| **React Markdown & Remark GFM** | Rich formatting for agent calendar responses |

### Backend
| Technology | Purpose |
| :--- | :--- |
| **Express 5 & TypeScript** | Fast, type-safe API server |
| **@mastra/core & @mastra/memory** | AI Agent orchestration, memory persistence, and tool binding |
| **@descope/mcp-express** | Model Context Protocol (MCP) server for tool authorization |
| **googleapis** | Direct interaction with Google Calendar API |
| **PostgreSQL & pg** | Reliable relational storage for user sessions and memory threads |

---

## 📁 Project Structure

```text
Agentic-Calendar/
├── 🐳 docker-compose.yml       # PostgreSQL container setup (Port: 5442)
├── 📄 README.md                # Project documentation
│
├── 📂 frontend/                # Next.js 16 Web Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/      # Chat & Calendar connection interface
│   │   │   ├── sign-in/        # Descope authentication page
│   │   │   └── layout.tsx      # Root layout & Descope Auth provider
│   │   ├── components/         # Chat panel, connection cards, UI buttons
│   │   └── lib/                # API helpers and types
│   ├── .env.example            # Frontend environment variable template
│   └── package.json
│
└── 📂 backend/                 # Express & Mastra AI Server
    ├── scripts/
    │   └── migrate.ts          # Database migration runner
    ├── sql/                    # SQL schema definitions (users, connections)
    ├── src/
    │   ├── config/             # Agent prompt instructions, Descope & Memory config
    │   ├── db/                 # PostgreSQL pool connection
    │   ├── mcp/                # Calendar MCP tools & server mount
    │   ├── middleware/         # Auth & Session verification
    │   ├── routes/             # Agent streaming & Connection routes
    │   ├── services/           # Calendar service, Token service, Agent engine
    │   └── index.ts            # Server entry point (Port: 4000)
    ├── .env.example            # Backend environment variable template
    └── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v20.x` or later
- **Docker Desktop**: For running PostgreSQL database
- **Descope Account**: [Sign up here](https://www.descope.com/)
- **OpenAI API Key**: [Get key here](https://platform.openai.com/)
- **Google Cloud Console**: Enabled Google Calendar API with OAuth credentials configured in Descope

---

### 2. Database Setup

Start the PostgreSQL container:

```bash
docker compose up -d
```
*This starts PostgreSQL on port `5442` with database `agentic_calendar_app_db`.*

---

### 3. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your .env file with your API keys and credentials!

# Run database migrations
npm run migrate

# Start backend development server
npm run dev
```
> Server will be running at `http://localhost:4000`

---

### 4. Frontend Setup

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your NEXT_PUBLIC_DESCOPE_PROJECT_ID into .env.local

# Start Next.js development server
npm run dev
```
> Frontend will be running at `http://localhost:3000`

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `4000` |
| `APP_URL` | Frontend origin for CORS | `http://localhost:3000` |
| `SERVER_URL` | Backend base URL | `http://localhost:4000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5442/agentic_calendar_app_db` |
| `DESCOPE_PROJECT_ID` | Descope Project Identifier | `P2...` |
| `DESCOPE_MANAGEMENT_KEY` | Descope Management Key for user/token operations | `K2...` |
| `DESCOPE_CALENDAR_CONNECTION_ID` | Descope Outbound connector ID for Google Calendar | `google-calendar` |
| `DESCOPE_MCP_SERVER_WELL_KNOWN_URL` | MCP discovery URL | `http://localhost:4000/.well-known/mcp` |
| `OPENAI_API_KEY` | OpenAI API Key for agent completions | `sk-...` |
| `AI_MODEL` | LLM model name | `gpt-4o-mini` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_DESCOPE_PROJECT_ID` | Descope Project ID for client auth | `P2...` |
| `NEXT_PUBLIC_API_URL` | Backend API endpoint URL | `http://localhost:4000` |

---

## 💬 Example Prompts

Here are some example queries you can try in the chat interface:

| Intent | Example Prompt |
| :--- | :--- |
| 📅 **Agenda Summary** | *"What does my schedule look like for today?"* |
| 🔍 **Deep-Dive Details** | *"Tell me more about the sync meeting at 3 PM. Who is attending?"* |
| ➕ **Quick Scheduling** | *"Schedule a 45-minute project kickoff with alex@example.com tomorrow at 11 AM."* |
| 🔄 **Rescheduling** | *"Move my design review meeting tomorrow to 4 PM instead."* |
| ❌ **Cancellation** | *"Cancel the test sync meeting on Friday."* |
| 🧠 **Memory Learning** | *"Remember that my default meeting length is 25 minutes and my timezone is IST."* |

---

## 🔒 Security & MCP Implementation

- **Decoupled Tool Auth:** The LLM does not receive raw Google credentials. Instead, requests flow through Descope MCP where scoped tokens are minted and validated per user.
- **Session Verification:** Backend endpoints verify Descope session tokens to ensure users only access and modify their own calendar events.

---

<div align="center">

Built with ❤️ using **Next.js**, **Mastra AI**, **Descope**, and **Google Calendar**

</div>
