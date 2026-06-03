import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Brain,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Headphones,
  Mic,
  Moon,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  TimerReset,
  Trash2,
  Volume2,
  Waves,
  Zap,
} from 'lucide-react';
import './styles.css';

type Task = {
  id: string;
  title: string;
  context: string;
  energy: 'low' | 'medium' | 'high';
  done: boolean;
  createdAt: string;
};

type Session = {
  id: string;
  label: string;
  minutes: number;
  sound: SoundKey;
};

type SoundKey = 'rain' | 'brown' | 'forest';

const starterTasks: Task[] = [
  {
    id: '1',
    title: 'Capture the one thing that would make today feel lighter',
    context: 'Morning reset',
    energy: 'low',
    done: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Protect a 25-minute no-notification focus block',
    context: 'Deep work',
    energy: 'high',
    done: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Choose a two-minute transition ritual before the next task',
    context: 'Behavior cue',
    energy: 'medium',
    done: false,
    createdAt: new Date().toISOString(),
  },
];

const sessions: Session[] = [
  { id: 'calm', label: 'Calm start', minutes: 10, sound: 'rain' },
  { id: 'flow', label: 'Flow sprint', minutes: 25, sound: 'brown' },
  { id: 'reset', label: 'Nervous-system reset', minutes: 5, sound: 'forest' },
];

const soundLabels: Record<SoundKey, string> = {
  rain: 'soft rain',
  brown: 'brown noise',
  forest: 'forest hum',
};

const storageKey = 'arahi-ai-state-v1';

function App() {
  const [tasks, setTasks] = useState<Task[]>(starterTasks);
  const [capture, setCapture] = useState('');
  const [selectedSession, setSelectedSession] = useState(sessions[1]);
  const [secondsLeft, setSecondsLeft] = useState(selectedSession.minutes * 60);
  const [running, setRunning] = useState(false);
  const [listening, setListening] = useState(false);
  const [activeSound, setActiveSound] = useState<SoundKey | null>(null);
  const [notice, setNotice] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const noiseRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved) as { tasks?: Task[] };
      if (parsed.tasks?.length) setTasks(parsed.tasks);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ tasks }));
  }, [tasks]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setRunning(false);
          setNotice('Flow session complete. Take a breath, then choose the next small step.');
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    setSecondsLeft(selectedSession.minutes * 60);
    setRunning(false);
  }, [selectedSession]);

  const completed = tasks.filter((task) => task.done).length;
  const nextTask = useMemo(() => tasks.find((task) => !task.done), [tasks]);
  const progress = Math.round((completed / Math.max(tasks.length, 1)) * 100);
  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');

  const addTask = () => {
    const title = capture.trim();
    if (!title) {
      setNotice('Type or speak a thought first. Arahi will turn it into a visible next step.');
      return;
    }
    setTasks((current) => [
      {
        id: crypto.randomUUID(),
        title,
        context: inferContext(title),
        energy: inferEnergy(title),
        done: false,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setCapture('');
    setNotice('Captured. Your thought is now a concrete action.');
  };

  const startSpeech = () => {
    const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setNotice('Speech recognition is not available in this browser. You can still type your thought.');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join(' ');
      setCapture(transcript);
    };
    recognition.onerror = (event) => {
      setNotice(`Voice capture paused: ${event.error}.`);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
    setNotice('Listening. Speak naturally; Arahi will keep the capture visible.');
  };

  const toggleTask = (id: string) => {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  };

  const deleteTask = (id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id));
  };

  const resetDay = () => {
    setTasks(starterTasks.map((task) => ({ ...task, id: crypto.randomUUID(), done: false, createdAt: new Date().toISOString() })));
    setNotice('Day reset with a gentle starter plan.');
  };

  const startAudio = async (sound: SoundKey) => {
    stopAudio();
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.gain.value = 0.035;
    gain.connect(ctx.destination);
    audioRef.current = ctx;
    gainRef.current = gain;

    if (sound === 'brown' || sound === 'rain') {
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < data.length; i += 1) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = sound === 'brown' ? last * 3.5 : white * 0.35 + last;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gain);
      source.start();
      noiseRef.current = source;
    } else {
      const oscillator = ctx.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = 174;
      oscillator.connect(gain);
      oscillator.start();
      oscillatorRef.current = oscillator;
    }
    setActiveSound(sound);
  };

  const stopAudio = () => {
    oscillatorRef.current?.stop();
    noiseRef.current?.stop();
    audioRef.current?.close();
    oscillatorRef.current = null;
    noiseRef.current = null;
    audioRef.current = null;
    gainRef.current = null;
    setActiveSound(null);
  };

  return (
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <nav className="nav">
          <a className="brand" href="#top" aria-label="Arahi AI home">
            <span className="brandMark"><Waves size={18} /></span>
            Arahi AI
          </a>
          <div className="navLinks">
            <a href="#capture">Capture</a>
            <a href="#flow">Flow</a>
            <a href="#organize">Organize</a>
          </div>
        </nav>

        <div className="heroGrid" id="top">
          <div className="heroCopy">
            <div className="eyebrow"><Sparkles size={16} /> Ambient focus & behavioral organizer</div>
            <h1 id="hero-title">Tap. Speak. Flow through the next right action.</h1>
            <p>
              Arahi AI turns scattered thoughts into visible cues, gentle focus sessions, and behavioral routines that reduce friction before your day gets noisy.
            </p>
            <div className="heroActions">
              <a className="primaryButton" href="#capture">Start with one thought <ChevronRight size={18} /></a>
              <a className="secondaryButton" href="#flow">Open focus mode</a>
            </div>
            <div className="trustRow">
              <span><CheckCircle2 size={16} /> Voice-first</span>
              <span><CheckCircle2 size={16} /> Local-first demo</span>
              <span><CheckCircle2 size={16} /> PWA-ready</span>
            </div>
          </div>

          <div className="phoneShell" aria-label="Arahi AI app preview">
            <div className="phoneTop"><span /> <strong>Now</strong> <Moon size={16} /></div>
            <div className="orb"><Brain size={44} /></div>
            <p className="phoneLabel">Current cue</p>
            <h2>{nextTask?.title ?? 'All clear. Choose a recovery ritual.'}</h2>
            <div className="miniStats">
              <span>{progress}% complete</span>
              <span>{minutes}:{seconds}</span>
            </div>
            <div className="breathBar"><span style={{ width: `${Math.max(progress, 16)}%` }} /></div>
          </div>
        </div>
      </section>

      <section className="workspace" id="capture">
        <div className="panel capturePanel">
          <div className="sectionHeader">
            <div>
              <span className="kicker"><Mic size={16} /> Quick capture</span>
              <h2>Get the thought out of your head.</h2>
            </div>
            <button className={`iconButton ${listening ? 'active' : ''}`} onClick={startSpeech} aria-label="Toggle voice capture">
              {listening ? <Pause size={20} /> : <Mic size={20} />}
            </button>
          </div>
          <textarea
            value={capture}
            onChange={(event) => setCapture(event.target.value)}
            placeholder="Speak or type: I need to send the draft, prep for the call, and remember to eat lunch..."
          />
          <div className="buttonRow">
            <button className="primaryButton" onClick={addTask}><Plus size={18} /> Add as next step</button>
            <button className="ghostButton" onClick={() => setCapture('')}>Clear</button>
          </div>
          {notice && <p className="notice">{notice}</p>}
        </div>

        <div className="panel" id="flow">
          <div className="sectionHeader">
            <div>
              <span className="kicker"><Clock3 size={16} /> Focus mode</span>
              <h2>Start an ambient container.</h2>
            </div>
            <div className="timer">{minutes}:{seconds}</div>
          </div>
          <div className="sessionGrid">
            {sessions.map((session) => (
              <button
                key={session.id}
                className={selectedSession.id === session.id ? 'session active' : 'session'}
                onClick={() => setSelectedSession(session)}
              >
                <strong>{session.label}</strong>
                <span>{session.minutes} min · {soundLabels[session.sound]}</span>
              </button>
            ))}
          </div>
          <div className="buttonRow">
            <button className="primaryButton" onClick={() => setRunning((value) => !value)}>
              {running ? <Pause size={18} /> : <Play size={18} />} {running ? 'Pause' : 'Begin'}
            </button>
            <button className="secondaryButton" onClick={() => setSecondsLeft(selectedSession.minutes * 60)}><TimerReset size={18} /> Reset</button>
          </div>
          <div className="soundControls">
            {(['rain', 'brown', 'forest'] as SoundKey[]).map((sound) => (
              <button key={sound} className={activeSound === sound ? 'sound active' : 'sound'} onClick={() => (activeSound === sound ? stopAudio() : startAudio(sound))}>
                <Volume2 size={16} /> {soundLabels[sound]}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="organizer" id="organize">
        <div className="sectionHeader wide">
          <div>
            <span className="kicker"><Target size={16} /> Behavioral plan</span>
            <h2>Visible cues beat invisible intentions.</h2>
          </div>
          <button className="ghostButton" onClick={resetDay}><RefreshCw size={16} /> Reset demo day</button>
        </div>

        <div className="taskBoard">
          {tasks.map((task) => (
            <article className={`taskCard ${task.done ? 'done' : ''}`} key={task.id}>
              <button className="check" onClick={() => toggleTask(task.id)} aria-label={`Mark ${task.title} complete`}>
                <CheckCircle2 size={22} />
              </button>
              <div>
                <h3>{task.title}</h3>
                <p>{task.context} · {task.energy} energy</p>
              </div>
              <button className="delete" onClick={() => deleteTask(task.id)} aria-label={`Delete ${task.title}`}><Trash2 size={18} /></button>
            </article>
          ))}
        </div>
      </section>

      <section className="features">
        <Feature icon={<Zap />} title="One-tap momentum" text="Capture thoughts the moment they appear and convert them into tiny, doable next steps." />
        <Feature icon={<Headphones />} title="Ambient sound engine" text="Built-in rain, brown noise, and forest hum create a sensory container for focus." />
        <Feature icon={<CalendarCheck />} title="Behavioral cues" text="Each task is labeled by context and energy so your plan matches how your brain actually feels." />
      </section>
    </main>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <article className="featureCard">
      <div className="featureIcon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function inferEnergy(value: string): Task['energy'] {
  const lower = value.toLowerCase();
  if (lower.includes('call') || lower.includes('write') || lower.includes('build') || lower.includes('prep')) return 'high';
  if (lower.includes('email') || lower.includes('clean') || lower.includes('organize')) return 'medium';
  return 'low';
}

function inferContext(value: string) {
  const lower = value.toLowerCase();
  if (lower.includes('email') || lower.includes('reply')) return 'Communication';
  if (lower.includes('call') || lower.includes('meeting')) return 'Meeting prep';
  if (lower.includes('eat') || lower.includes('water') || lower.includes('walk')) return 'Body care';
  if (lower.includes('clean') || lower.includes('organize')) return 'Environment cue';
  return 'Next action';
}

createRoot(document.getElementById('root')!).render(<App />);
