"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { setStoredUser } from "@/lib/storage";
import Image from "next/image";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !phone.trim()) {
      setError("Please enter your name and phone");
      return;
    }
    setLoading(true);
    try {
      const user = await api.identify(name.trim(), phone.trim());
      setStoredUser(user.id, user.name);
      router.replace("/today");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50 to-white px-6 py-12">
      <div className="mx-auto w-full max-w-md flex-1">
        <div className="mb-10 text-center">
          <Image
            src="/icons/icon-192.png"
            alt="Prime Brokers"
            width={100}
            height={100}
            className="mx-auto mb-4 rounded-2xl shadow-lg"
            priority
          />
          <h1 className="text-2xl font-bold text-zinc-900">Prime Brokers</h1>
          <p className="mt-2 text-zinc-600">
            Manage leads, properties & follow-ups — fast.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Welcome, Broker</h2>
          <p className="text-sm text-zinc-500">
            Enter your details once. No password needed.
          </p>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Your name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rajesh Kumar"
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Phone number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="9876543210"
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 py-3.5 text-base font-semibold text-white shadow-sm disabled:opacity-50"
          >
            {loading ? "Setting up..." : "Get Started"}
          </button>
        </form>
      </div>
    </div>
  );
}
