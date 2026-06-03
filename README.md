# Arahi AI — Ambient focus & behavioral organizer

A production-ready, downloadable React/Vite implementation inspired by the referenced Lovable app. Arahi AI is a mobile-first PWA-style experience for voice-first quick capture, ambient focus sessions, and behavioral task organization.

## Features

- Voice or text quick capture using the browser Web Speech API when available.
- Local-first task board with persistent `localStorage` state.
- Focus session timer with 5, 10, and 25 minute modes.
- Built-in ambient sound engine using Web Audio: soft rain, brown noise, and forest hum.
- Behavioral labels that infer task context and energy level from captured thoughts.
- Responsive, premium dark UI and installable web app manifest.

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL printed in your terminal, usually `http://localhost:5173/`.

## Preview production locally

```bash
npm run build
npm run preview
```

Open the preview URL printed in your terminal, usually `http://localhost:4173/`.

## Build for download/deployment

```bash
npm run build
```

The production build is emitted to `dist/` and can be deployed to Vercel, Netlify, Cloudflare Pages, or any static host. See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for step-by-step live deployment instructions.

## Notes

Speech recognition support depends on the user's browser. If unavailable, the app gracefully falls back to typed capture.
