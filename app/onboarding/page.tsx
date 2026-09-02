"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight,
  Bell,
  LandPlot,
  Loader2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { api } from "@/lib/api";
import { formErrorBanner } from "@/lib/form-errors";
import { setStoredUser } from "@/lib/storage";
import { formatPhone, isValidIndianPhone, sanitizePersonName } from "@/lib/utils";

const features = [
  {
    icon: Users,
    label: "Track leads",
    description: "Capture buyer inquiries in seconds",
  },
  {
    icon: LandPlot,
    label: "List properties",
    description: "Keep all your listings in one place",
  },
  {
    icon: Bell,
    label: "Daily follow-ups",
    description: "Never miss a callback again",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const updateName = (value: string) => {
    setName(sanitizePersonName(value));
    if (error) setError("");
  };

  const updatePhone = (value: string) => {
    setPhone(formatPhone(value).slice(0, 10));
    setPhoneError("");
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPhoneError("");
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!phone.trim()) {
      setPhoneError("Phone number is required");
      return;
    }
    if (!isValidIndianPhone(phone)) {
      setPhoneError("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      const user = await api.identify(name.trim(), phone.trim());
      setStoredUser(user.id, {
        name: user.name,
        phone: user.phone,
        profilePictureUrl: user.profilePictureUrl,
      });
      router.replace("/today");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 hidden h-72 w-72 rounded-full bg-primary/10 blur-3xl md:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-16 hidden h-56 w-56 rounded-full bg-secondary-tint blur-3xl md:block"
      />

      {/* Mobile hero */}
      <header className="relative bg-primary px-6 pb-20 pt-[max(2.75rem,env(safe-area-inset-top))] text-center shadow-lg shadow-primary/20 md:hidden">
        <div className="mx-auto mb-5 inline-flex rounded-[22px] bg-white/15 p-2 ring-1 ring-white/25">
          <Image
            src="/icons/icon-192.png"
            alt="Prime Brokers"
            width={88}
            height={88}
            className="rounded-[18px]"
            priority
          />
        </div>
        <h1 className="font-serif text-[1.85rem] leading-tight text-primary-foreground">
          Prime Brokers
        </h1>
        <p className="mx-auto mt-2 max-w-[240px] text-[13.5px] leading-relaxed text-primary-foreground/75">
          Leads, properties & follow-ups — fast.
        </p>
      </header>

      <div className="relative mx-auto flex w-full max-w-5xl flex-col md:min-h-screen md:flex-row md:items-center md:justify-center md:gap-12 md:px-10 md:py-12 lg:gap-20">
        {/* Desktop hero */}
        <section className="hidden md:block md:flex-1">
          <div className="mb-8 flex items-center gap-4">
            <div className="relative shrink-0 rounded-2xl bg-surface p-1.5 shadow-lg shadow-primary/15 ring-1 ring-border">
              <Image
                src="/icons/icon-192.png"
                alt="Prime Brokers"
                width={72}
                height={72}
                className="rounded-xl"
                priority
              />
            </div>
            <div>
              <h1 className="font-serif text-3xl leading-tight text-primary">
                Prime Brokers
              </h1>
              <p className="mt-1 text-sm text-muted">
                Leads, properties & follow-ups — fast.
              </p>
            </div>
          </div>

          <p className="mb-6 max-w-sm text-base leading-relaxed text-foreground/80">
            Your pocket CRM built for real-estate brokers. Set up in under a
            minute — no password needed.
          </p>

          <ul className="space-y-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <li
                  key={feature.label}
                  className="flex items-start gap-3 rounded-2xl border border-border/80 bg-surface/70 px-4 py-3.5 backdrop-blur-sm"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary-tint text-secondary">
                    <Icon size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      {feature.label}
                    </p>
                    <p className="mt-0.5 text-[13px] text-muted">
                      {feature.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Form */}
        <section className="relative -mt-14 w-full px-5 pb-[max(2rem,env(safe-area-inset-bottom))] md:mt-0 md:max-w-sm md:shrink-0 md:px-0 md:pb-0 lg:max-w-md">
          <form
            onSubmit={handleSubmit}
            className="rounded-[28px] border border-border bg-surface p-6 shadow-xl shadow-black/5 md:rounded-3xl md:p-7 md:shadow-primary/5"
          >
            <div className="mb-6">
              <h2 className="font-serif text-[1.35rem] text-primary md:text-xl">
                Welcome, Broker
              </h2>
              <p className="mt-1.5 text-[13.5px] text-muted md:text-sm">
                Enter your details once to get started.
              </p>
            </div>

            {error && <p className={`mb-4 ${formErrorBanner}`}>{error}</p>}

            <div className="space-y-4">
              <Field
                label="Your name"
                value={name}
                onChange={updateName}
                placeholder="Rajesh Kumar"
                autoComplete="name"
              />
              <PhoneField
                label="Phone number"
                value={phone}
                onChange={updatePhone}
                error={phoneError}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:scale-[0.98] disabled:opacity-50 md:py-3.5 md:text-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Get Started
                  <ArrowRight size={18} strokeWidth={2.5} />
                </>
              )}
            </button>

            <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11.5px] text-muted md:text-xs">
              <ShieldCheck size={14} className="shrink-0 text-ok" />
              No password · Your data stays on your device
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}

function PhoneField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </label>
      <input
        type="tel"
        inputMode="numeric"
        value={value}
        maxLength={10}
        placeholder="9876543210"
        autoComplete="tel"
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-base text-primary outline-none transition-colors placeholder:text-muted/60 focus:border-primary focus:bg-surface md:py-3 md:text-sm"
      />
      {error ? (
        <p className="mt-1.5 text-[12px] text-red-600">{error}</p>
      ) : (
        value &&
        value.length !== 10 && (
          <p className="mt-1.5 text-[11px] text-muted">
            Enter 10-digit mobile number
          </p>
        )
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-base text-primary outline-none transition-colors placeholder:text-muted/60 focus:border-primary focus:bg-surface md:py-3 md:text-sm"
      />
    </div>
  );
}
