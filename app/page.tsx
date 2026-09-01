"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUserId } from "@/lib/storage";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const userId = getStoredUserId();
    router.replace(userId ? "/today" : "/onboarding");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
    </div>
  );
}
