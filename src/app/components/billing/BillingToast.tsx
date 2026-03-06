// src/components/billing/BillingToast.tsx
"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export function BillingToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const billing = searchParams.get("billing");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!billing) return;
    setVisible(true);
    router.replace("/dashboard"); // clean URL immediately
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, [billing]);

  if (!visible || !billing) return null;

  const isReactivated = billing === "reactivated";

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-50 flex items-center gap-3
        px-5 py-4 rounded-xl shadow-xl
        transition-all duration-500
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        ${isReactivated ? "bg-green-600" : "bg-blue-600"}
        text-white
      `}
    >
      <span className="text-2xl">{isReactivated ? "🎉" : "✅"}</span>
      <div>
        <p className="font-semibold text-sm">
          {isReactivated ? "Welcome back!" : "You're all set!"}
        </p>
        <p className="text-xs opacity-80 mt-0.5">
          {isReactivated
            ? "Your subscription has been reactivated."
            : "Your subscription is now active."}
        </p>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="ml-2 opacity-60 hover:opacity-100 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}