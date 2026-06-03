# Base44 Full Layer Prompt — Arahi AI

Copy and paste this prompt into Base44 to recreate and improve the Arahi AI ambient focus and behavioral organizer as a deployable web app.

---

## Prompt

Build a polished, production-ready web app called **Arahi AI**.

Arahi AI is an **ambient focus and behavioral organizer** that helps users move from scattered thoughts to calm action. The experience should feel like: **tap, speak, breathe, and flow into the next right step**.

The app should be mobile-first, premium, calm, and emotionally supportive. It should not feel like a generic task manager. It should feel like a voice-first AI focus companion for people who need help capturing thoughts, regulating attention, and turning mental clutter into visible cues.

## Core Product Identity

- Product name: **Arahi AI**
- Tagline: **Tap. Speak. Flow through the next right action.**
- Category: Ambient focus, voice capture, behavioral organizer, flow assistant
- Primary user action: **Start with one thought**
- Secondary action: **Open focus mode**
- Visual mood: dark premium, calming gradients, glass panels, breathing orb, soft cyan/mint/violet accents
- Tone: gentle, clear, grounded, supportive, not clinical

## Main User Journey

The user lands on the app and immediately understands they can:

1. Capture a thought by typing or speaking.
2. Convert that thought into a visible next-step task.
3. Start a timed focus session.
4. Play ambient sound while focusing.
5. Complete, delete, or reset behavioral cues.
6. Return later and see their task board preserved.

## Required Pages / Sections

Create a single-page app with anchored sections:

### 1. Hero Section

Include:

- Top navigation with Arahi AI logo/brand.
- Links: **Capture**, **Flow**, **Organize**.
- Eyebrow: **Ambient focus & behavioral organizer**.
- Main headline: **Tap. Speak. Flow through the next right action.**
- Supporting paragraph explaining that Arahi AI turns scattered thoughts into visible cues, gentle focus sessions, and behavioral routines.
- Primary CTA: **Start with one thought** linking to capture section.
- Secondary CTA: **Open focus mode** linking to flow section.
- Trust bullets: **Voice-first**, **Local-first**, **PWA-ready**.

Add a premium mobile-phone preview card on the right side on desktop and below on mobile. The preview should include:

- A breathing glowing orb.
- Current cue / next task.
- Progress percentage.
- Focus timer.
- Animated progress bar.

### 2. Quick Capture Section

Build a glass-style panel titled **Get the thought out of your head.**

Include:

- Textarea with placeholder text like: `Speak or type: I need to send the draft, prep for the call, and remember to eat lunch...`
- Microphone toggle button.
- Button: **Add as next step**.
- Button: **Clear**.
- Status/notice area for messages.

Behavior:

- If browser speech recognition is available, allow voice capture and transcribe into the textarea.
- If speech recognition is unavailable, show a friendly message and allow typed capture.
- If the user tries to add an empty task, show a helpful message.
- When a task is added, infer a context and energy level, clear the textarea, and add the task to the top of the task list.

Suggested context inference:

- Text includes email/reply → Communication
- Text includes call/meeting → Meeting prep
- Text includes eat/water/walk → Body care
- Text includes clean/organize → Environment cue
- Otherwise → Next action

Suggested energy inference:

- Text includes call/write/build/prep → high
- Text includes email/clean/organize → medium
- Otherwise → low

### 3. Focus Mode Section

Build a glass-style panel titled **Start an ambient container.**

Include:

- Large timer display.
- Three selectable focus sessions:
  - **Calm start** — 10 min — soft rain
  - **Flow sprint** — 25 min — brown noise
  - **Nervous-system reset** — 5 min — forest hum
- Button: **Begin** / **Pause** depending on timer state.
- Button: **Reset**.
- Ambient sound buttons:
  - **soft rain**
  - **brown noise**
  - **forest hum**

Behavior:

- Selecting a session sets the timer length and stops the timer.
- Begin starts countdown.
- Pause pauses countdown.
- Reset restores selected session length.
- When the timer finishes, show a message: **Flow session complete. Take a breath, then choose the next small step.**
- Ambient sound should start only after user interaction. If actual audio generation is difficult in Base44, create interactive sound-mode buttons with clear active states and structure the code so real sound can be added later.

### 4. Behavioral Organizer Section

Build a section titled **Visible cues beat invisible intentions.**

Include:

- Reset demo day button.
- Task cards showing:
  - Completion toggle/check icon.
  - Task title.
  - Context.
  - Energy level.
  - Delete action.

Starter tasks:

1. **Capture the one thing that would make today feel lighter** — Morning reset — low energy
2. **Protect a 25-minute no-notification focus block** — Deep work — high energy
3. **Choose a two-minute transition ritual before the next task** — Behavior cue — medium energy

Behavior:

- Completed tasks should visually fade and show a strikethrough.
- Deleting removes the task.
- Reset demo day restores starter tasks.
- Save task state locally so refreshing the page does not erase the board.

### 5. Feature Cards Section

Add three feature cards:

1. **One-tap momentum**
   - Capture thoughts the moment they appear and convert them into tiny, doable next steps.
2. **Ambient sound engine**
   - Rain, brown noise, and forest hum create a sensory container for focus.
3. **Behavioral cues**
   - Each task is labeled by context and energy so the plan matches how the user's brain actually feels.

## Data Model

Use a local-first task model unless Base44 provides a built-in database layer. If a database is available, store tasks per user.

Task fields:

- id
- title
- context
- energy: low | medium | high
- done
- createdAt

Session fields:

- id
- label
- minutes
- sound

## Required Interactions

Implement:

- Add task from capture input.
- Clear capture input.
- Toggle speech listening when supported.
- Toggle task completion.
- Delete task.
- Reset starter task board.
- Select focus session.
- Begin/pause timer.
- Reset timer.
- Toggle active ambient sound state.
- Persist tasks locally or in user database.

## Visual Design Requirements

Use a premium dark UI:

- Background: deep navy/black with radial cyan/violet glows.
- Cards: translucent glass panels with subtle borders and blur.
- Accent colors: mint, cyan, violet, and subtle rose for active recording.
- Typography: bold, tight headline; readable body text.
- Layout: desktop two-column hero, mobile single-column.
- Rounded corners: large, soft, modern.
- Motion: breathing orb animation and gentle hover lifts.
- Accessibility: semantic buttons, labels, visible focus states, readable contrast.

Suggested CSS tokens:

- Background: `#07111f`
- Panel: `rgba(15, 23, 42, 0.78)`
- Text: `#f8fbff`
- Muted: `#9fb0c7`
- Mint: `#78f7d2`
- Cyan: `#67e8f9`
- Violet: `#a78bfa`
- Rose: `#fb7185`

## PWA / Deployment Requirements

Make the app ready to download and deploy:

- Add a web app manifest.
- Use responsive metadata.
- Ensure the app can be deployed as a static site.
- If Base44 offers deployment settings, configure the build output for static hosting.
- Include a clear README or instructions section explaining:
  - How to run locally.
  - How to build.
  - How to deploy live.

## Quality Bar

Do not produce a rough wireframe. Build a finished, premium-feeling app with:

- Working task state.
- Working timer.
- Working or clearly simulated sound controls.
- Working voice fallback.
- Mobile responsive design.
- Deploy-ready output.
- Clean component structure.
- No placeholder lorem ipsum.
- No fake backend claims.

## Nice-to-Have Enhancements

If time allows, add:

- Daily completion percentage.
- Current cue in the phone preview tied to the next unfinished task.
- Toast messages for captured tasks and completed sessions.
- Install app prompt/PWA readiness.
- Light haptic-style animations when adding/completing tasks.
- Export task list as text.
- Optional user authentication if Base44 makes it simple.

## Final Output Expected

Deliver the complete app and include final instructions for the user:

- **Open locally:** run the dev server and open the printed local URL.
- **Preview production:** build and preview the production app.
- **Deploy live:** publish to the platform's static hosting or connect the repo to Vercel/Netlify with output directory `dist` if using Vite.

The finished app should make a user feel: **I can get one thought out, make it visible, and start moving without overwhelm.**
