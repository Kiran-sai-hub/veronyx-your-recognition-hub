import { Mic, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Recognition = {
  lang: string;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

const speechLang: Record<string, string> = { en: "en-IN", hi: "hi-IN", ta: "ta-IN" };

/**
 * Voice input (checklist §5.3 B, P3). Uses the browser's speech recognition where available;
 * otherwise a demo transcription is inserted so the flow can still be shown. The text always
 * lands in the input for the person to check before sending.
 */
export function VoiceInputButton({
  onTranscript,
  language = "en",
  demoText,
  className,
  disabled = false,
}: {
  onTranscript: (text: string) => void;
  language?: string;
  demoText: string;
  className?: string | undefined;
  disabled?: boolean;
}) {
  const [listening, setListening] = useState(false);
  const recognition = useRef<Recognition | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      recognition.current?.stop();
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const start = () => {
    const w = window as unknown as {
      SpeechRecognition?: new () => Recognition;
      webkitSpeechRecognition?: new () => Recognition;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    setListening(true);
    if (Ctor) {
      try {
        const r = new Ctor();
        r.lang = speechLang[language] ?? "en-IN";
        r.interimResults = false;
        let heard = false;
        r.onresult = (e) => {
          const text = e.results[0]?.[0]?.transcript;
          if (text) {
            heard = true;
            onTranscript(text);
          }
        };
        // No microphone or no speech within 6 s: fall back to the demo transcription.
        timer.current = window.setTimeout(() => {
          if (heard) return;
          r.stop();
          onTranscript(demoText);
          setListening(false);
        }, 6000);
        r.onerror = () => {
          if (timer.current) window.clearTimeout(timer.current);
          heard = true;
          onTranscript(demoText);
        };
        r.onend = () => setListening(false);
        recognition.current = r;
        r.start();
        return;
      } catch {
        // Fall through to the demo transcription.
      }
    }
    timer.current = window.setTimeout(() => {
      onTranscript(demoText);
      setListening(false);
    }, 1800);
  };

  const stop = () => {
    recognition.current?.stop();
    if (timer.current) window.clearTimeout(timer.current);
    setListening(false);
  };

  return (
    <>
      <Button
        type="button"
        size="icon"
        variant={listening ? "destructive" : "ghost"}
        className={cn(listening && "animate-pulse", className)}
        disabled={disabled}
        aria-pressed={listening}
        aria-label={listening ? "Stop listening" : "Speak your request"}
        title={listening ? "Listening… tap to stop" : "Voice input"}
        onClick={listening ? stop : start}
      >
        {listening ? <Square /> : <Mic />}
      </Button>
      <span className="sr-only" aria-live="polite">
        {listening ? "Listening" : ""}
      </span>
    </>
  );
}
