"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SpeechLanguage } from "@/lib/types";

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: { transcript: string };
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event?: { error?: string }) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

/** Collapse mobile duplicate finals like "Rahul Rahul Sharma Sharma". */
function dedupeSpeechText(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "";

  const words = normalized.split(" ");
  if (words.length >= 2 && words.length % 2 === 0) {
    const half = words.length / 2;
    const first = words.slice(0, half).join(" ");
    const second = words.slice(half).join(" ");
    if (first.toLowerCase() === second.toLowerCase()) {
      return first;
    }
  }

  const out: string[] = [];
  for (const word of words) {
    const prev = out[out.length - 1];
    if (!prev || prev.toLowerCase() !== word.toLowerCase()) {
      out.push(word);
    }
  }
  return out.join(" ");
}

function joinTranscript(base: string, next: string): string {
  const a = base.trim();
  const b = next.trim();
  if (!a) return b;
  if (!b) return a;
  if (a.toLowerCase().endsWith(b.toLowerCase())) return a;
  if (b.toLowerCase().startsWith(a.toLowerCase())) return b;
  return `${a} ${b}`;
}

export function useSpeechRecognition(language: SpeechLanguage) {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef("");
  const sessionBaseRef = useRef("");
  const listeningRef = useRef(false);
  const stoppingRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const touch = isTouchDevice();
    const recognition = new SpeechRecognition();
    // continuous:true often re-fires the same finals on mobile Chrome/Safari
    recognition.continuous = !touch;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let sessionFinal = "";
      let interim = "";

      // Rebuild from the full results list so re-delivered mobiles finals
      // don't get appended twice via +=.
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const chunk = result[0]?.transcript ?? "";
        if (!chunk) continue;
        if (result.isFinal) {
          sessionFinal += chunk;
        } else {
          interim += chunk;
        }
      }

      sessionFinal = dedupeSpeechText(sessionFinal);
      interim = dedupeSpeechText(interim);

      const committed = joinTranscript(sessionBaseRef.current, sessionFinal);
      finalTranscriptRef.current = committed;
      setTranscript(joinTranscript(committed, interim));
    };

    recognition.onerror = (event) => {
      // "no-speech" / "aborted" are common on mobile; don't treat as hard stop
      // unless the user intentionally stopped.
      if (event?.error === "aborted" || stoppingRef.current) {
        listeningRef.current = false;
        setListening(false);
        return;
      }
      if (event?.error === "no-speech" && listeningRef.current && touch) {
        return;
      }
      listeningRef.current = false;
      setListening(false);
    };

    recognition.onend = () => {
      // Mobile (continuous:false): keep listening by restarting until user stops
      if (listeningRef.current && !stoppingRef.current && touch) {
        sessionBaseRef.current = finalTranscriptRef.current;
        try {
          recognition.start();
          return;
        } catch {
          // already started or not allowed
        }
      }
      listeningRef.current = false;
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      stoppingRef.current = true;
      listeningRef.current = false;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    };
  }, [language]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    stoppingRef.current = false;
    finalTranscriptRef.current = "";
    sessionBaseRef.current = "";
    setTranscript("");
    listeningRef.current = true;
    setListening(true);
    try {
      recognitionRef.current.start();
    } catch {
      listeningRef.current = false;
      setListening(false);
    }
  }, []);

  const stop = useCallback(() => {
    stoppingRef.current = true;
    listeningRef.current = false;
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    setListening(false);
  }, []);

  const clearTranscript = useCallback(() => {
    finalTranscriptRef.current = "";
    sessionBaseRef.current = "";
    setTranscript("");
  }, []);

  return {
    transcript,
    listening,
    supported,
    start,
    stop,
    setTranscript: clearTranscript,
  };
}
