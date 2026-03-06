// src/components/billing/UpgradeButton.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function UpgradeButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpgrade = async () => {
    setLoading(true);
    const res = await fetch("/api/billing/checkout", { method: "POST" });
    const { url } = await res.json();
    if (url) router.push(url);
    else setLoading(false);
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="shrink-0 text-xs font-semibold bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
    >
      {loading ? "Redirecting…" : "Upgrade"}
    </button>
  );
}