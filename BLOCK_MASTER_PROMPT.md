# BUILD BLOCK — AI SALES ADMIN
## Production Build Master Prompt

Build a production-ready mobile-first SaaS web app called **BLOCK**.

Tagline: **Stop typing CRM notes. BLOCK them.**

BLOCK is an AI-powered sales admin command center for Account Executives, Account Managers, CSMs, BDRs, SDRs, Territory Managers, National Account Managers, and field sales reps.

The core promise: after a meeting, sales call, field visit, demo, discovery call, or customer check-in, the user pastes notes or records voice and clicks **BLOCK IT**. The app instantly returns CRM-ready updates, follow-up email, next steps, MEDDICC/BANT analysis, deal health score, buying signals, objections, and a time-blocked action plan.

---

## 1. Important Build Rule

Do **not** build the old Vite MVP. The old Vite React version was only a prototype.

Build this as a production app using:

- Next.js App Router
- TypeScript
- Supabase Auth
- Supabase PostgreSQL
- Supabase Row Level Security
- Anthropic Claude for AI sales outputs
- OpenAI Whisper for voice transcription
- Gmail OAuth for user-approved follow-up email sending
- Vercel deployment
- PWA installability
- Mobile-first dark premium UI

Start with:

```bash
npx create-next-app@latest block-app
```

Recommended setup answers:

```txt
TypeScript: Yes
ESLint: Yes
Tailwind: No
src directory: No
App Router: Yes
Import alias: Yes
```

Use global CSS with CSS variables. Do not use Tailwind unless explicitly added.

---

## 2. Product Identity

Product name: **BLOCK**

Tagline: **Stop typing CRM notes. BLOCK them.**

Primary CTA: **BLOCK IT**

Positioning: BLOCK compresses sales admin work into one AI cockpit. It turns messy notes, call transcripts, and voice recordings into structured CRM updates, follow-up emails, deal coaching, and daily action plans.

The app should feel like: **Salesforce admin work got compressed into one premium AI command center.**

---

## 3. Tech Stack

Use the following stack:

- Framework: Next.js 14+ App Router
- Language: TypeScript
- Database/Auth: Supabase
- Database: PostgreSQL
- Security: Supabase Row Level Security by `user_id`
- AI: Anthropic Claude via `@anthropic-ai/sdk`
- Voice transcription: OpenAI Whisper via `openai`
- Email: Gmail API through OAuth
- Deployment: Vercel
- Styling: `app/globals.css` with CSS variables
- PWA: `public/manifest.json`, app metadata, mobile installability

Install packages:

```bash
npm install @supabase/supabase-js @supabase/ssr @anthropic-ai/sdk openai googleapis
```

Optional packages for file parsing:

```bash
npm install mammoth pdf-parse
```

Use `mammoth` for `.docx` parsing and `pdf-parse` for PDF text extraction if file upload parsing is implemented.

---

## 4. Required Project Structure

Create this exact structure:

```txt
block-app/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx
│   ├── auth/page.tsx
│   ├── dashboard/page.tsx
│   ├── block-it/page.tsx
│   ├── myday/page.tsx
│   ├── pipeline/page.tsx
│   ├── director/page.tsx
│   ├── settings/page.tsx
│   └── api/
│       ├── block-it/route.ts
│       ├── day-plan/route.ts
│       ├── agent/route.ts
│       ├── transcribe/route.ts
│       ├── export/route.ts
│       └── gmail/
│           ├── connect/route.ts
│           ├── callback/route.ts
│           └── send/route.ts
├── components/
│   ├── BottomNav.tsx
│   ├── Toast.tsx
│   ├── DriveMode.tsx
│   ├── BlockItWorkspace.tsx
│   ├── VoiceRecorder.tsx
│   ├── CRMOutput.tsx
│   ├── ExportSheet.tsx
│   ├── AgentChat.tsx
│   ├── TimeBlockList.tsx
│   ├── OpportunityList.tsx
│   └── TaskList.tsx
├── lib/
│   ├── supabase.ts
│   ├── ai.ts
│   └── utils.ts
├── types/database.ts
├── supabase/migrations/001_initial_schema.sql
├── public/
│   ├── manifest.json
│   ├── icon-192.png
│   └── icon-512.png
├── .env.local.example
├── next.config.js
├── tsconfig.json
├── vercel.json
└── README.md
```

---

## 5. Environment Variables

Create `.env.local.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
NEXT_PUBLIC_APP_URL=
```

Do not include real secrets. If a required key is missing, show a clear user-facing or developer-facing error. Do not fake a working integration.

---

## 6. Database Schema

Create `supabase/migrations/001_initial_schema.sql`.

Required tables: `profiles`, `opportunities`, `tasks`, `time_blocks`, `ai_outputs`, `voice_notes`, and `agent_conversations`.

Every table must include `user_id` except `profiles`, which must still link each profile to the authenticated user.

Enable Row Level Security on every table. Every select, insert, update, and delete policy must enforce `auth.uid() = user_id`.

Create a trigger that automatically creates a `profiles` row when a user signs up.

All API inserts must include `user_id: user.id`.

---

## 7. Required Pages

Create these pages:

- `/` landing page
- `/auth` Supabase sign up/sign in page
- `/dashboard` sales cockpit
- `/block-it` core BLOCK IT workspace
- `/myday` time blocking and tasks
- `/pipeline` deal pipeline
- `/director` streaming AI Sales Director chat
- `/settings` profile, defaults, Gmail connection, sign out

Protected pages must redirect unauthenticated users to `/auth`.

---

## 8. BLOCK IT Workspace

This is the core page.

Inputs:

- Notes/transcript textarea
- Voice recording
- Optional file upload
- CRM selector: Salesforce, HubSpot, Dynamics, Zoho, Pipedrive, Custom
- Framework selector: MEDDICC, BANT, SPICED, Sandler, Challenger
- AI mode selector: Human, AI Gen, Director, Export

Primary button: **BLOCK IT**

On submit, call `POST /api/block-it`.

Render output cards:

- Executive summary
- CRM-ready notes
- Follow-up email
- Health score
- Pain points
- Buying signals
- Objections
- Framework analysis
- Next best action
- AI Director coaching when director mode is selected
- Auto-created tasks

---

## 9. Required Components

Create:

- `BottomNav.tsx`
- `Toast.tsx`
- `DriveMode.tsx`
- `VoiceRecorder.tsx`
- `BlockItWorkspace.tsx`
- `CRMOutput.tsx`
- `ExportSheet.tsx`
- `AgentChat.tsx`
- `TimeBlockList.tsx`
- `OpportunityList.tsx`
- `TaskList.tsx`

---

## 10. API Routes

Create:

- `POST /api/block-it`
- `POST /api/day-plan`
- `POST /api/agent` with SSE streaming and `export const runtime = "edge"`
- `POST /api/transcribe` with `export const runtime = "nodejs"`
- `POST /api/export`
- `GET /api/gmail/connect`
- `GET /api/gmail/callback`
- `POST /api/gmail/send`

No fake connection state. No hardcoded fake success. No unauthorized sending.

---

## 11. BLOCK IT Output Contract

The AI output must always match this shape:

```ts
type BlockItOutput = {
  executive_summary: string
  crm_notes: string
  follow_up_email: {
    subject: string
    body: string
  }
  next_best_action: string
  pain_points: string[]
  buying_signals: string[]
  objections: string[]
  framework_analysis: Record<string, unknown>
  health_score: number
  deal_stage: string
  stage_progress: number
  tasks: Array<{
    title: string
    due_date: string
    priority: "low" | "medium" | "high"
  }>
  director_coaching?: string
}
```

Health score rules:

- Green: 70–100
- Amber: 45–69
- Red: 0–44

Stage progress must be 0–100.

---

## 12. AI Prompting Rules

Create `lib/ai.ts`.

Include prompt builders for:

- BLOCK IT
- Day Plan
- AI Sales Director
- Export formatting

Claude must return structured JSON for BLOCK IT.

The BLOCK IT prompt should tell Claude:

> You are an elite sales operations assistant. Convert messy sales notes into CRM-ready sales intelligence. Return only valid JSON matching the required schema.

The AI should extract company, contact, deal stage, pain points, buying signals, objections, next steps, tasks, follow-up email, selected framework analysis, deal health score, and CRM notes.

AI Director should act like a practical revenue coach. No generic motivational fluff. Give specific, deal-relevant coaching.

---

## 13. Gmail, Voice, and Export Requirements

Gmail must be user-authorized through OAuth. Settings must show either **Connect Gmail** or **Connected as user@email.com**.

Generated follow-up email section must include editable recipient, editable subject, editable body, Gmail send button, and copy button.

Voice recording must support Web Speech API live transcript, MediaRecorder fallback, Whisper transcription, Drive Mode fullscreen capture, and transcript handoff to BLOCK IT.

Exports must support Salesforce TXT, HubSpot TXT, Dynamics TXT, Zoho TXT, Pipedrive TXT, Universal CSV, JSON, and Copy Notes.

---

## 14. Design Direction

Upgrade the frontend with a distinctive, production-grade design.

Avoid generic SaaS UI, plain white cards, generic AI purple gradients, default dashboards, cookie-cutter layouts, and basic template aesthetics.

The design should feel like:

- Luxury tactical
- Dark executive cockpit
- High-performance sales command center
- Premium AI sales operating system
- Mobile-first
- Built for closers

The BLOCK IT button should feel like the main weapon of the app.

Use CSS variables in `app/globals.css`:

```css
:root {
  --bg: #0A0A0F;
  --bg2: #111118;
  --surface: #1E1E2A;
  --surface2: #252535;
  --border: rgba(255,255,255,0.07);
  --border2: rgba(255,255,255,0.12);
  --text: #F0F0F5;
  --text2: #9090A0;
  --text3: #505060;
  --blue: #3B82F6;
  --green: #22C55E;
  --red: #EF4444;
  --amber: #F59E0B;
  --purple: #A855F7;
}
```

Design details:

- Deep black/navy background
- Gunmetal cards
- Thin borders
- Glass panels
- Radial glows
- Subtle grid texture
- Premium shadows
- Status chips
- Large primary action buttons
- Health score ring
- Export bottom sheet
- Bottom nav

Motion:

- Staggered page-load reveals
- Hover lift on desktop
- Press states on mobile
- Pulsing record animation
- Health score ring animation
- Bottom sheet slide-up animation

---

## 15. Mobile and PWA Requirements

Mobile-first.

Requirements:

- Core shell max-width around 430px where appropriate
- No horizontal scroll
- Fixed bottom nav
- Minimum touch target: 44px
- Drive Mode buttons: 60px+
- One-handed use
- PWA installable on iOS and Android

Create:

- `public/manifest.json`
- `public/icon-192.png`
- `public/icon-512.png`

Add app metadata in `app/layout.tsx`.

Manifest should include:

- name: BLOCK — AI Sales Admin
- short_name: BLOCK
- theme_color
- background_color
- display: standalone
- start_url: /

---

## 16. Deployment and README

Create:

- `.env.local.example`
- `vercel.json`
- `README.md`

Deployment instructions:

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Production deployment:

```bash
npx vercel
vercel --prod
```

After deployment, update:

```bash
NEXT_PUBLIC_APP_URL=https://your-production-url.vercel.app
GOOGLE_REDIRECT_URI=https://your-production-url.vercel.app/api/gmail/callback
```

Google Cloud OAuth redirect URI must match:

```txt
https://your-production-url.vercel.app/api/gmail/callback
```

README must include product description, tech stack, setup, Supabase setup, Google OAuth setup, Anthropic setup, OpenAI setup, local development, Vercel deployment, environment variables, acceptance test, and troubleshooting.

---

## 17. Build Order

Build the app in this order:

1. Project setup
2. Config files
3. Supabase schema
4. TypeScript types
5. Lib files
6. Global design system
7. Layout and landing page
8. Auth page
9. App navigation
10. Dashboard
11. BLOCK IT workspace
12. Drive Mode
13. My Day
14. Pipeline
15. AI Sales Director
16. Settings
17. API routes
18. PWA
19. README and deployment

---

## 18. Final Acceptance Test

The app is complete only when:

1. User signs up.
2. User signs in.
3. User opens dashboard.
4. User clicks BLOCK IT.
5. User pastes notes or records voice.
6. AI creates CRM notes.
7. AI creates follow-up email.
8. AI creates framework analysis.
9. AI creates health score.
10. AI creates tasks.
11. Output saves to Supabase.
12. Tasks appear in My Day.
13. Opportunity appears in Pipeline.
14. User connects Gmail.
15. User sends user-approved follow-up email.
16. User exports CRM notes.
17. AI Director streams coaching.
18. App deploys cleanly to Vercel.
19. Mobile layout works cleanly.
20. PWA can be installed.

---

## 19. Final Build Rules

Do not leave placeholder buttons.

Do not fake connected states.

Do not hardcode fake API success.

Do not expose secret keys in client code.

Do not skip Supabase RLS.

Do not allow users to access other users’ data.

Do not use the old Vite MVP.

Use Next.js App Router.

Use TypeScript.

Build the app production-first.

Where credentials are required, write working integration code and show clear missing-key errors.

The final product should feel polished, premium, dark, fast, mobile-first, and built for serious salespeople.

Product name: **BLOCK**

Tagline: **Stop typing CRM notes. BLOCK them.**
