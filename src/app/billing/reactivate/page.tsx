// app/billing/reactivate/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReactivatePage() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/billing/reactivate", { method: "POST" })
      .then((res) => res.json())
      .then(({ url }) => {
        if (url) router.push(url);
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="animate-spin text-4xl">⏳</div>
        <p className="text-gray-600 font-medium">Redirecting to checkout...</p>
      </div>
    </div>
  );
}