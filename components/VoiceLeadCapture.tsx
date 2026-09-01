"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { LeadFormData, ParsedLead, SpeechLanguage } from "@/lib/types";
import { api } from "@/lib/api";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { LeadForm } from "./LeadForm";
import { Mic, X } from "lucide-react";
import { Modal } from "./Modal";
import { cn } from "@/lib/utils";

const languages: { code: SpeechLanguage; label: string }[] = [
  { code: "en-IN", label: "English" },
  { code: "hi-IN", label: "हिंदी" },
  { code: "pa-IN", label: "ਪੰਜਾਬੀ" },
];

const VOICE_HINT_KEY = "prime-brokers-voice-hint-seen";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: LeadFormData) => Promise<void>;
}

export function VoiceLeadCapture({ open, onClose, onSave }: Props) {
  const router = useRouter();
  const [language, setLanguage] = useState<SpeechLanguage>("hi-IN");
  const [showTypeFallback, setShowTypeFallback] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [formInitial, setFormInitial] = useState<Partial<LeadFormData>>({});
  const [formKey, setFormKey] = useState(0);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState("");
  const [showVoiceHint, setShowVoiceHint] = useState(false);
  const [parseStatus, setParseStatus] = useState("Tap and describe the lead");

  const { transcript, listening, supported, start, stop, setTranscript } =
    useSpeechRecognition(language);

  useEffect(() => {
    if (open) {
      setShowVoiceHint(!localStorage.getItem(VOICE_HINT_KEY));
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      stop();
      setShowTypeFallback(false);
      setTypedText("");
      setFormInitial({});
      setFormKey((k) => k + 1);
      setError("");
      setTranscript("");
      setParseStatus("Tap and describe the lead");
    }
  }, [open, stop, setTranscript]);

  const fillForm = (data: Partial<LeadFormData>) => {
    setFormInitial((prev) => ({ ...prev, ...data }));
    setFormKey((k) => k + 1);
  };

  const handleParse = async () => {
    const text = showTypeFallback ? typedText : transcript;
    if (!text.trim()) {
      setError("Please speak or type something first");
      return;
    }
    setParsing(true);
    setError("");
    stop();
    setParseStatus("Understanding…");
    try {
      const result: ParsedLead = await api.parseLead(text, language);
      fillForm({
        name: result.name ?? "",
        phone: result.phone ?? "",
        requirement: result.requirement ?? "",
        location: result.location ?? "",
        budget: result.budget ?? "",
        notes: result.notes ?? "",
        followUpDate: result.followUpDate ?? "",
      });
      setParseStatus("Filled from what you said — check before saving.");
      localStorage.setItem(VOICE_HINT_KEY, "1");
      setShowVoiceHint(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI parsing failed");
      fillForm({ notes: text });
      setParseStatus("Couldn't parse automatically — notes filled.");
    } finally {
      setParsing(false);
    }
  };

  const switchToProperty = () => {
    onClose();
    sessionStorage.setItem("quick-add", "property");
    router.push("/properties");
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="relative space-y-4 pb-2">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-0 top-0 rounded-full p-1.5 text-muted"
        >
          <X size={20} />
        </button>

        <div className="pr-8">
          <h2 className="font-serif text-xl font-medium text-primary">
            Add a lead
          </h2>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
            Under 15 seconds — just speak, in your own language.{" "}
            <button
              type="button"
              onClick={switchToProperty}
              className="text-secondary-dark underline"
            >
              Add a property instead
            </button>
          </p>
        </div>

        {showVoiceHint && (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-[#bfe0d2] bg-[#eaf3ef] px-3 py-2.5 text-xs leading-relaxed text-ok">
            <span>
              New: tap the mic and just speak — Hindi, Punjabi or English all
              work.
            </span>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem(VOICE_HINT_KEY, "1");
                setShowVoiceHint(false);
              }}
              className="shrink-0 font-bold text-ok"
            >
              Got it
            </button>
          </div>
        )}

        <div className="rounded-[18px] bg-secondary-tint px-4 py-5 text-center">
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {languages.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLanguage(l.code)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
                  language === l.code
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-[#e4d3b4] bg-surface text-muted",
                )}
              >
                {l.label}
              </button>
            ))}
          </div>

          {showTypeFallback ? (
            <div className="space-y-3 text-left">
              <textarea
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                rows={3}
                placeholder="e.g. Rahul Sharma, 3BHK Sector 66, budget 80L, call tomorrow 10am"
                className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm text-primary outline-none focus:border-primary"
              />
              <button
                type="button"
                disabled={parsing || !typedText.trim()}
                onClick={handleParse}
                className="rounded-[10px] bg-secondary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
              >
                {parsing ? "Processing..." : "Fill from text"}
              </button>
              {supported && (
                <button
                  type="button"
                  onClick={() => setShowTypeFallback(false)}
                  className="block w-full text-xs text-secondary-dark underline"
                >
                  Use voice instead
                </button>
              )}
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => (listening ? stop() : start())}
                disabled={!supported}
                className={cn(
                  "relative mx-auto flex h-20 w-20 items-center justify-center rounded-full text-primary-foreground shadow-lg transition-colors",
                  listening
                    ? "bg-overdue shadow-overdue/35"
                    : "bg-secondary shadow-secondary/35",
                )}
              >
                {listening && (
                  <span className="absolute inset-[-9px] animate-ping rounded-full border-2 border-overdue opacity-40" />
                )}
                <Mic size={28} strokeWidth={1.75} />
              </button>
              <p className="mt-3.5 text-[13px] font-medium text-primary">
                {listening ? "Listening… tap to stop" : parseStatus}
              </p>
              <p className="mt-1 min-h-[16px] px-1.5 text-xs italic text-[#8a8578]">
                {transcript ||
                  (supported ? "" : "Voice not supported in this browser")}
              </p>
              {supported && transcript && (
                <button
                  type="button"
                  disabled={parsing}
                  onClick={handleParse}
                  className="mt-3 rounded-[10px] bg-secondary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {parsing ? "Processing..." : "Fill from speech"}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  stop();
                  setShowTypeFallback(true);
                }}
                className="mt-3 block w-full text-xs text-secondary-dark underline"
              >
                Type instead
              </button>
            </>
          )}
        </div>

        {error && (
          <p className="rounded-lg bg-overdue-tint px-3 py-2 text-sm text-overdue">
            {error}
          </p>
        )}

        <LeadForm
          key={formKey}
          variant="add"
          initial={formInitial}
          onSubmit={async (data) => {
            await onSave(data);
            onClose();
          }}
          onCancel={onClose}
          submitLabel="Save lead"
        />
      </div>
    </Modal>
  );
}
