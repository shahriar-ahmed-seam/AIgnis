// Real browser speech APIs — no external services, no cost.
//   - Voice INPUT  via SpeechRecognition (Chrome/Edge; graceful fallback)
//   - Voice OUTPUT via speechSynthesis (broad support)

/* eslint-disable @typescript-eslint/no-explicit-any */

// ---------- Voice input (SpeechRecognition) ----------

type RecognitionHandlers = {
  onResult: (transcript: string, isFinal: boolean) => void;
  onEnd?: () => void;
  onError?: (err: string) => void;
};

export function isSpeechInputSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export class VoiceInput {
  private rec: any = null;
  private active = false;

  start(handlers: RecognitionHandlers) {
    const Ctor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Ctor) {
      handlers.onError?.("unsupported");
      return;
    }
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;

    rec.onresult = (e: any) => {
      let transcript = "";
      let isFinal = false;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
        if (e.results[i].isFinal) isFinal = true;
      }
      handlers.onResult(transcript, isFinal);
    };
    rec.onend = () => {
      this.active = false;
      handlers.onEnd?.();
    };
    rec.onerror = (e: any) => {
      this.active = false;
      handlers.onError?.(e.error ?? "error");
    };

    this.rec = rec;
    this.active = true;
    try {
      rec.start();
    } catch {
      /* already started */
    }
  }

  stop() {
    if (this.rec && this.active) {
      try {
        this.rec.stop();
      } catch {
        /* ignore */
      }
    }
    this.active = false;
  }

  get listening() {
    return this.active;
  }
}

// ---------- Voice output (speechSynthesis) ----------

export function isSpeechOutputSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let cachedVoice: SpeechSynthesisVoice | null = null;

function pickVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechOutputSupported()) return null;
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  // prefer a crisp English voice
  cachedVoice =
    voices.find((v) => /en-US/i.test(v.lang) && /Google|Natural|Samantha|Aria|Jenny/i.test(v.name)) ||
    voices.find((v) => /en/i.test(v.lang)) ||
    voices[0] ||
    null;
  return cachedVoice;
}

export function speak(text: string, opts?: { rate?: number; pitch?: number; onEnd?: () => void }) {
  if (!isSpeechOutputSupported()) {
    opts?.onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = pickVoice();
  if (v) u.voice = v;
  u.rate = opts?.rate ?? 1.02;
  u.pitch = opts?.pitch ?? 1.0;
  u.onend = () => opts?.onEnd?.();
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (isSpeechOutputSupported()) window.speechSynthesis.cancel();
}

// some browsers populate voices asynchronously
if (isSpeechOutputSupported()) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null;
    pickVoice();
  };
}
