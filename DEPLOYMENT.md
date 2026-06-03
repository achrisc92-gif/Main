# Open, run, and deploy Arahi AI

This app is a Vite static web app. You can run it locally, preview the production build, or deploy the generated `dist/` folder to any static host.

## 1. Open it locally for development

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite, usually:

```txt
http://localhost:5173/
```

## 2. Preview the production build locally

```bash
npm run build
npm run preview
```

Then open the preview URL printed by Vite, usually:

```txt
http://localhost:4173/
```

## 3. Deploy live with Vercel

### Option A: Vercel dashboard

1. Push this repository to GitHub.
2. Go to <https://vercel.com/new>.
3. Import the GitHub repository.
4. Vercel should detect Vite automatically. If asked, use:
   - Install command: `npm install`
   - Build command: `npm run build`
   - Output directory: `dist`
5. Click **Deploy**.

This repo includes `vercel.json` with those settings.

### Option B: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

If prompted for settings, use:

```txt
Framework: Vite
Build Command: npm run build
Output Directory: dist
Development Command: npm run dev
```

## 4. Deploy live with Netlify

### Option A: Netlify dashboard

1. Push this repository to GitHub.
2. Go to <https://app.netlify.com/start>.
3. Import the GitHub repository.
4. Use these settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click **Deploy site**.

This repo includes `netlify.toml` and `public/_redirects` with those settings.

### Option B: Netlify CLI

```bash
npm install -g netlify-cli
netlify login
npm run build
netlify deploy --prod --dir=dist
```

## 5. Download and share as static files

Build the app:

```bash
npm run build
```

Then zip the contents of `dist/`:

```bash
cd dist
zip -r ../arahi-ai-site.zip .
```

Upload `arahi-ai-site.zip` or the unzipped `dist/` contents to any static web host.

## Troubleshooting

- If `npm run dev` works but deployment is blank, confirm the host is publishing `dist`, not the repository root.
- If voice capture does not work, test in Chrome or Edge and allow microphone/speech permissions. The app still works with typed capture when speech recognition is unavailable.
- If ambient sound does not start, click a sound button again. Browsers require user interaction before starting Web Audio.
