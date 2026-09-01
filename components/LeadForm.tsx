"use client";

import { useEffect, useState } from "react";
import type { LeadFormData } from "@/lib/types";

const emptyLead: LeadFormData = {
  name: "",
  phone: "",
  requirement: "",
  location: "",
  budget: "",
  source: "",
  notes: "",
  followUpDate: "",
};

interface Props {
  initial?: Partial<LeadFormData>;
  onSubmit: (data: LeadFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  variant?: "default" | "add";
}

export function LeadForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save lead",
  variant = "default",
}: Props) {
  const [form, setForm] = useState<LeadFormData>(() => ({
    ...emptyLead,
    ...initial,
    followUpDate: initial?.followUpDate?.split("T")[0] ?? "",
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      ...emptyLead,
      ...initial,
      followUpDate: initial?.followUpDate?.split("T")[0] ?? "",
    });
  }, [initial]);

  const update = (field: keyof LeadFormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Name and phone are required");
      return;
    }

    let followUpDate: string | null = form.followUpDate || null;
    if (followUpDate && Number.isNaN(Date.parse(followUpDate))) {
      followUpDate = null;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...form,
        followUpDate,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const isAdd = variant === "add";

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {error && (
        <p className="rounded-lg bg-overdue-tint px-3 py-2 text-sm text-overdue">
          {error}
        </p>
      )}

      <Field
        label={isAdd ? "Name" : "Name *"}
        value={form.name}
        onChange={(v) => update("name", v)}
        placeholder={isAdd ? "Full name" : undefined}
        variant={variant}
      />

      {isAdd ? (
        <div className="flex gap-2.5">
          <Field
            label="Phone"
            value={form.phone}
            onChange={(v) => update("phone", v)}
            type="tel"
            placeholder="10-digit number"
            variant={variant}
            className="flex-1"
          />
          <Field
            label="Budget"
            value={form.budget ?? ""}
            onChange={(v) => update("budget", v)}
            placeholder="e.g. 80L - 1Cr"
            variant={variant}
            className="flex-1"
          />
        </div>
      ) : (
        <>
          <Field
            label="Phone *"
            value={form.phone}
            onChange={(v) => update("phone", v)}
            type="tel"
            variant={variant}
          />
          <Field
            label="Requirement"
            value={form.requirement ?? ""}
            onChange={(v) => update("requirement", v)}
            placeholder="2BHK, shop, plot..."
            variant={variant}
          />
          <Field
            label="Location"
            value={form.location ?? ""}
            onChange={(v) => update("location", v)}
            variant={variant}
          />
          <Field
            label="Budget"
            value={form.budget ?? ""}
            onChange={(v) => update("budget", v)}
            variant={variant}
          />
          <Field
            label="Source"
            value={form.source ?? ""}
            onChange={(v) => update("source", v)}
            placeholder="Referral, portal..."
            variant={variant}
          />
        </>
      )}

      {isAdd && (
        <div className="flex gap-2.5">
          <Field
            label="Requirement"
            value={form.requirement ?? ""}
            onChange={(v) => update("requirement", v)}
            placeholder="e.g. 3 BHK"
            variant={variant}
            className="flex-1"
          />
          <Field
            label="Location"
            value={form.location ?? ""}
            onChange={(v) => update("location", v)}
            placeholder="e.g. Sector 66"
            variant={variant}
            className="flex-1"
          />
        </div>
      )}

      <Field
        label={isAdd ? "Next follow-up" : "Follow-up date"}
        value={form.followUpDate ?? ""}
        onChange={(v) => update("followUpDate", v)}
        type={isAdd ? "text" : "date"}
        placeholder={isAdd ? "e.g. Tomorrow, 10:30 AM" : undefined}
        variant={variant}
      />

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-muted">
          Notes
        </label>
        <textarea
          value={form.notes ?? ""}
          onChange={(e) => update("notes", e.target.value)}
          rows={isAdd ? 2 : 3}
          placeholder={isAdd ? "Anything else worth remembering" : undefined}
          className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm text-primary outline-none focus:border-primary"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        {loading ? "Saving..." : submitLabel}
      </button>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2 text-sm text-muted"
        >
          Cancel
        </button>
      )}
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  variant = "default",
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  variant?: "default" | "add";
  className?: string;
}) {
  const inputClass =
    variant === "add"
      ? "w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm text-primary outline-none focus:border-primary"
      : "w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

  const labelClass =
    variant === "add"
      ? "mb-1.5 block text-xs font-semibold text-muted"
      : "mb-1 block text-sm font-medium text-zinc-700";

  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </div>
  );
}
