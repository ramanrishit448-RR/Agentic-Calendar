# Agentic Calendar

Agentic Calendar is an AI-powered meeting assistant and calendar manager built to streamline scheduling and calendar management through natural language interaction. Instead of manually navigating through calendar interfaces, users can simply chat with an AI agent to view, create, reschedule, or summarize their meetings.

## Why this project was built

Managing calendars traditionally involves a lot of clicks, context switching, and repetitive data entry. This project was built to solve these friction points by leveraging **Agentic AI**:
- **Intuitive Interaction:** Natural language makes scheduling as easy as texting an assistant ("What's my agenda today?" or "Set up a 30-min meeting with John tomorrow at 10 AM").
- **Working Memory:** The AI agent remembers user preferences (like timezones, default meeting lengths, and frequent invitees) so you don't have to repeat yourself.
- **Modern AI Integration Patterns:** It showcases how to build a production-ready AI agent using the **Model Context Protocol (MCP)** for secure, authenticated tool execution, and **Mastra** for agent orchestration and memory.

## Architecture & Tech Stack

The repository is structured as a monorepo containing a separate Next.js frontend and an Express/Node.js backend.

### Frontend
- **Framework:** Next.js 16 (App Router) with React 19
- **Styling:** Tailwind CSS & shadcn/ui for a modern, responsive, and accessible UI
- **Authentication:** Descope Next.js SDK for seamless user sign-in and session management
- **Features:** A conversational dashboard interface that renders rich markdown responses (including event details and links) using `react-markdown`.

### Backend
- **Framework:** Node.js with Express & TypeScript
- **AI Agent Framework:** [Mastra](https://mastra.ai/) (`@mastra/core`, `@mastra/memory`, `@mastra/libsql`) for orchestrating the AI logic, managing working memory, and handling conversation threads.
- **Tool Integration (MCP):** [Model Context Protocol](https://modelcontextprotocol.io/) via Descope (`@descope/mcp-express`) to securely expose Google Calendar tools to the LLM.
- **APIs:** Google APIs (`googleapis`) for Calendar integration.
- **Database:** PostgreSQL (`pg`) for persisting user data and agent memory.

## How it works

1. **Authentication:** Users sign in via the Next.js frontend using Descope.
2. **Chat Interface:** The user sends a natural language request from the Dashboard.
3. **Agent Orchestration:** The backend Mastra agent receives the prompt along with the user's conversation history and working memory.
4. **Tool Execution:** If the user asks to schedule a meeting or check their agenda, the agent intelligently decides to call the Google Calendar MCP tools. The Descope MCP middleware ensures that the tool is executed securely using the authenticated user's credentials.
5. **Response:** The agent formulates a concise, markdown-formatted response which is streamed back to the frontend UI.

## Getting Started

### Prerequisites
- Node.js (v20+)
- PostgreSQL Database
- Google Cloud Console Project (with Calendar API enabled and OAuth credentials)
- Descope Project (for authentication)
- OpenAI API Key

### Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies: `npm install`
3. Set up your `.env` file based on the required credentials (OpenAI, Google, Descope, Database).
4. Run migrations if necessary: `npm run migrate`
5. Start the development server: `npm run dev` (Runs on port 4000)

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Set up your `.env.local` file with the Next.js and Descope configurations.
4. Start the frontend development server: `npm run dev` (Runs on port 3000)

---
*Built with ❤️ to demonstrate the power of Agentic AI in everyday workflows.*
