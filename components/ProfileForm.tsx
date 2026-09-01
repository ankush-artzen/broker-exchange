"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { User } from "@/lib/types";
import { api } from "@/lib/api";
import { getStoredUserId, setStoredUser } from "@/lib/storage";
import { Camera, Loader2 } from "lucide-react";
import { UserAvatar } from "./UserAvatar";

interface Props {
  user: User;
  onUpdated: (user: User) => void;
}

export function ProfileForm({ user, onUpdated }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [avatarUrl, setAvatarUrl] = useState(user.profilePictureUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handlePhoto = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const { urls } = await api.uploadPhotos([file]);
      setAvatarUrl(urls[0] ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }

    setSaving(true);
    try {
      const updated = await api.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        profilePictureUrl: avatarUrl || null,
      });

      const userId = getStoredUserId();
      if (userId) {
        setStoredUser(userId, {
          name: updated.name,
          phone: updated.phone,
          profilePictureUrl: updated.profilePictureUrl,
        });
      }

      onUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-overdue-tint px-3 py-2 text-sm text-overdue">
          {error}
        </p>
      )}

      <div className="flex flex-col items-center">
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="relative"
          aria-label="Change profile picture"
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Profile"
              width={96}
              height={96}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <UserAvatar name={name} size={96} />
          )}
          <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-primary text-primary-foreground">
            {uploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Camera size={16} />
            )}
          </span>
        </button>
        <p className="mt-2 text-[12.5px] text-muted">Tap to change photo</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handlePhoto(e.target.files)}
        />
      </div>

      <Field label="Name" value={name} onChange={setName} placeholder="Your name" />
      <Field
        label="Phone"
        value={phone}
        onChange={setPhone}
        type="tel"
        placeholder="9876543210"
      />

      <button
        type="submit"
        disabled={saving || uploading}
        className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm text-primary outline-none focus:border-primary"
      />
    </div>
  );
}
