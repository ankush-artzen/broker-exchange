"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { PropertyFormData } from "@/lib/types";
import { Loader2, Plus, X } from "lucide-react";
import { api } from "@/lib/api";

const emptyProperty: PropertyFormData = {
  title: "",
  location: "",
  price: "",
  configuration: "",
  area: "",
  availability: "available",
  notes: "",
  photoUrls: [],
};

interface Props {
  initial?: Partial<PropertyFormData>;
  onSubmit: (data: PropertyFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function PropertyForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save Property",
}: Props) {
  const [form, setForm] = useState<PropertyFormData>({
    ...emptyProperty,
    ...initial,
    photoUrls: initial?.photoUrls ?? [],
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof PropertyFormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handlePhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    try {
      const { urls } = await api.uploadPhotos(Array.from(files));
      setForm((f) => ({ ...f, photoUrls: [...f.photoUrls, ...urls] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setForm((f) => ({
      ...f,
      photoUrls: f.photoUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim() || !form.location.trim() || !form.price.trim()) {
      setError("Title, location, and price are required");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <Field label="Title *" value={form.title} onChange={(v) => update("title", v)} />
      <Field label="Location *" value={form.location} onChange={(v) => update("location", v)} />
      <Field label="Price *" value={form.price} onChange={(v) => update("price", v)} placeholder="₹50L, ₹1.2Cr..." />
      <Field label="Configuration" value={form.configuration ?? ""} onChange={(v) => update("configuration", v)} placeholder="2BHK, 3BHK..." />
      <Field label="Area" value={form.area ?? ""} onChange={(v) => update("area", v)} placeholder="1200 sq ft" />
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Availability</label>
        <select
          value={form.availability ?? "available"}
          onChange={(e) => update("availability", e.target.value)}
          className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Photos</label>
        <div className="flex flex-wrap gap-2">
          {form.photoUrls.map((url, i) => (
            <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg">
              <Image src={url} alt="" fill className="object-cover" sizes="80px" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute right-0.5 top-0.5 rounded-full bg-black/60 px-1.5 text-xs text-white"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 text-2xl text-zinc-400"
          >
            {uploading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <Plus size={24} />
            )}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handlePhotos(e.target.files)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Notes</label>
        <textarea
          value={form.notes ?? ""}
          onChange={(e) => update("notes", e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-zinc-200 py-3 font-medium text-zinc-700">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || uploading}
          className="flex-1 rounded-xl bg-emerald-600 py-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-700">{label}</label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
    </div>
  );
}
