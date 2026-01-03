Since the **AAIAHC** is a religious administrative body, they likely need systems that handle document management, religious inquiries (Fatwas), community services, and internal approvals.

To impress them, you should build a **"Smart Administrative & Fatwa Research Portal."** This project covers every single technical requirement mentioned in their job description.

---

# Product Requirements Document (PRD): Al-Huda Knowledge & Workflow Portal

**Project Version:** 1.0  
**Developer:** [Your Name]  
**Stack:** Turborepo, Next.js 15, Nest.js, Prisma, Inngest, Vercel AI SDK.

---

## 1. Executive Summary
The **Al-Huda Portal** is an internal tool designed to help Council members manage religious documents and automate administrative workflows using AI. It allows users to upload documents, ask an AI assistant questions based on those documents (RAG), and trigger automated approval workflows.

## 2. User Roles
*   **Admin:** Full access to system logs, AI cost management, and user permissions.
*   **Researcher:** Can upload documents and use the AI RAG system to find information.
*   **Officer:** Handles workflow tasks (approving or rejecting applications).

---

## 3. Functional Requirements

### 3.1 AI & Research Module (The "RAG" Pipeline)
*   **Feature:** Users can chat with an AI trained on specific Council PDF documents.
*   **Technical Requirements:**
    *   **Streaming UI:** Use Vercel AI SDK to stream responses (RSC).
    *   **Vector Search:** Simulate or implement a search logic where the AI "finds" relevant text chunks before answering.
    *   **Memory:** AI must remember the context of the current conversation.
    *   **Tool Calling:** The AI should be able to call a function (e.g., `get_prayer_times` or `get_document_status`).

### 3.2 Workflow Automation (Inngest)
*   **Feature:** Document Processing Workflow.
*   **Scenario:** When a "Researcher" uploads a document:
    1.  **Step 1:** The system triggers a background job (Inngest) to scan the file.
    2.  **Step 2:** An AI summary is generated automatically.
    3.  **Step 3:** A notification is sent to the "Admin" via WebSockets.
    4.  **Step 4:** Wait for 30 seconds (simulating manual review) then mark as "Processed."

### 3.3 Dashboard & Real-time Features
*   **Feature:** Real-time activity feed.
*   **Technical Requirements:**
    *   Use **WebSockets** (or SSE) to show a "Live Log" of what the AI is doing.
    *   Dashboard charts (using **Recharts**) showing the number of queries handled per day.

### 3.4 User Management (RBAC)
*   **Feature:** Secure Login.
*   **Technical Requirements:**
    *   Role-based Authorization (Protecting `/admin` routes).
    *   Zod validation for login/signup forms.

---

## 4. Technical Architecture (The "Exam Prep" Setup)

### 4.1 Monorepo Structure (Turborepo)
*   `/apps/web`: Next.js 15, Tailwind, ShadCN.
*   `/apps/server`: Nest.js (REST API, WebSockets).
*   `/packages/database`: Prisma schema + client.
*   `/packages/shared-types`: Zod schemas used by both Frontend and Backend.

### 4.2 Database Schema (Prisma)
```prisma
model User {
  id    String @id @default(uuid())
  role  Role   @default(USER)
  logs  ActionLog[]
}

model Document {
  id        String @id @default(uuid())
  title     String
  content   String
  status    String // PENDING, PROCESSED, FAILED
}

model ChatMessage {
  id      String @id @default(uuid())
  role    String // 'user' or 'assistant'
  content String
}
```

---

## 5. Development Milestones (Your "Live Coding" Strategy)

If they ask you to code from scratch, follow these steps in order:

1.  **Phase 1 (Infrastructure):** Initialize the Turborepo and link Prisma to a local PostgreSQL/Docker container.
2.  **Phase 2 (Backend API):** Create a Nest.js module for `Documents`. Build a POST endpoint to "upload" text.
3.  **Phase 3 (Workflow):** Set up an Inngest function that listens for `document.uploaded` and updates the DB status.
4.  **Phase 4 (AI Integration):** Create a route in Nest.js that uses `streamText` from Vercel AI SDK to talk to OpenAI/Anthropic.
5.  **Phase 5 (Frontend):** Build a simple Next.js page with a sidebar. Use **TanStack Query** to fetch the document list and a Chat component for the AI.

---

## 6. KPI / Success Metrics for the Exam
To prove you meet their "Mid-Level" criteria, you must demonstrate:
*   **Type Safety:** No `any` keywords in your TypeScript code.
*   **Error Handling:** Try/Catch blocks and proper API error responses.
*   **Loading States:** Use ShadCN Skeletons and Next.js `loading.tsx` files.
*   **Testing:** Mention how you would write a Vitest for the AI logic.

---

### Suggested "Sample Data" for the Exam:
If asked to test the AI, use a topic like **"AAIAHC Guidelines for Ramadan 2025"** or **"Internal Council Policy on Digital Transformation."** This shows you are thinking about the employer's specific context.

**Do you want me to provide a starter code snippet for the AI Streaming part or the Inngest Workflow part?**