# BLOCK — AI Sales Admin

> Stop typing CRM notes. BLOCK them.

BLOCK is a production-ready, mobile-first AI sales admin command center. Paste notes or record voice after any meeting → instantly get CRM updates, follow-up emails, MEDDICC/BANT analysis, deal health scores, and a time-blocked action plan.

## Tech Stack

- **Framework**: Next.js 14 App Router (TypeScript)
- **Database/Auth**: Supabase (PostgreSQL + RLS)
- **AI**: Anthropic Claude (`claude-sonnet-4-20250514`)
- **Voice**: OpenAI Whisper API
- **Email**: Gmail API (OAuth2)
- **Deployment**: Vercel
- **PWA**: Installable on iOS and Android

## Setup

### 1. Prerequisites

- Node.js 18+
- Supabase account
- Anthropic API key
- OpenAI API key (for voice)
- Google Cloud project (for Gmail)

### 2. Install

```bash
npm install
cp .env.local.example .env.local
```

### 3. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor → New Query
3. Paste and run the contents of `supabase/migrations/001_initial_schema.sql`
4. Copy your project URL and anon key from Settings → API

### 4. Environment Variables

Fill in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail/callback

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Google OAuth Setup (Gmail)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the Gmail API and Google OAuth API
4. Create OAuth 2.0 credentials (Web application type)
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/gmail/callback` (development)
   - `https://your-app.vercel.app/api/gmail/callback` (production)

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Production Deployment (Vercel)

```bash
npx vercel
vercel --prod
```

After deployment, update:
- `NEXT_PUBLIC_APP_URL` → your production URL
- `GOOGLE_REDIRECT_URI` → `https://your-app.vercel.app/api/gmail/callback`
- Add the production redirect URI in Google Cloud Console

## Acceptance Test

1. Sign up and sign in
2. Navigate to BLOCK IT
3. Paste meeting notes → click BLOCK IT
4. Verify AI output: CRM notes, follow-up email, health score, tasks
5. Check My Day → tasks and time blocks appear
6. Check Pipeline → opportunity created
7. Connect Gmail in Settings
8. Send a follow-up email
9. Export CRM notes (Salesforce, HubSpot, etc.)
10. Chat with AI Director

## Features

| Feature | Description |
|---------|-------------|
| BLOCK IT | Paste notes → instant CRM output |
| Voice Mode | Web Speech API + Whisper fallback |
| Drive Mode | Fullscreen one-handed recording |
| MEDDICC/BANT/SPICED | Auto framework analysis |
| Health Score | 0-100 deal health ring visualization |
| Follow-up Email | Auto-generated, editable, Gmail-ready |
| My Day | AI time-blocked daily schedule |
| AI Director | Streaming sales coaching |
| Pipeline | Deal pipeline with health scores |
| PWA | Installable on iOS and Android |

## Troubleshooting

**"ANTHROPIC_API_KEY is not configured"** — Set `ANTHROPIC_API_KEY` in `.env.local`

**"OPENAI_API_KEY is not configured"** — Set `OPENAI_API_KEY` for voice transcription

**Gmail "not connected"** — Complete Gmail OAuth in Settings and verify redirect URI matches

**Auth redirect loop** — Check Supabase URL and anon key are correct

**Build fails** — Run `npm run lint` to check for TypeScript errors
