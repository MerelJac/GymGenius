// components/billing/BillingSuccessToast.tsx
"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export function BillingSuccessToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const billing = searchParams.get("billing");

  useEffect(() => {
    if (billing === "success" || billing === "reactivated") {
      // Remove the query param from URL cleanly
      router.replace("/dashboard");
    }
  }, [billing]);

  if (!billing) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-green-600 text-white px-5 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in">
      <span className="text-xl">🎉</span>
      <div>
        <p className="font-semibold text-sm">You&apos;re all set!</p>
        <p className="text-xs text-green-100">
          {billing === "reactivated" ? "Subscription reactivated." : "Subscription activated."}
        </p>
      </div>
    </div>
  );
}