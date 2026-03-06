// src/components/billing/BillingManager.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type BillingStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "GRANDFATHERED";
type BillingPlan = "FREE" | "TRAINER_MONTHLY" | "CLIENT_MONTHLY";

interface BillingManagerProps {
  status: BillingStatus;
  plan: BillingPlan;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  grandfathered: boolean;
}

const PLAN_LABELS: Record<BillingPlan, string> = {
  FREE: "Free",
  TRAINER_MONTHLY: "Trainer — Monthly",
  CLIENT_MONTHLY: "Client — Monthly",
};

const STATUS_CONFIG: Record<BillingStatus, { label: string; color: string; bg: string; border: string }> = {
  TRIALING:      { label: "Free Trial",    color: "text-yellow-700", bg: "bg-yellow-50",  border: "border-yellow-200" },
  ACTIVE:        { label: "Active",        color: "text-green-700",  bg: "bg-green-50",   border: "border-green-200"  },
  PAST_DUE:      { label: "Past Due",      color: "text-orange-700", bg: "bg-orange-50",  border: "border-orange-200" },
  CANCELED:      { label: "Canceled",      color: "text-red-700",    bg: "bg-red-50",     border: "border-red-200"    },
  GRANDFATHERED: { label: "Complimentary", color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200"   },
};

export function BillingManager({
  status,
  plan,
  trialEndsAt,
  currentPeriodEnd,
  grandfathered,
}: BillingManagerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const cfg = STATUS_CONFIG[status];

  const daysLeftInTrial = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000))
    : null;

  const handleUpgrade = async () => {
    setLoading(true);
    const res = await fetch("/api/billing/checkout", { method: "POST" });
    const { url } = await res.json();
    if (url) router.push(url);
    else setLoading(false);
  };

  const handleReactivate = async () => {
    setLoading(true);
    const res = await fetch("/api/billing/reactivate", { method: "POST" });
    const { url } = await res.json();
    if (url) router.push(url);
    else setLoading(false);
  };

  const handleManage = async () => {
    setLoading(true);
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const { url } = await res.json();
    if (url) router.push(url);
    else setLoading(false);
  };

  return (
    <section className="trainer-card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="section-title">Billing</h2>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
          {cfg.label}
        </span>
      </div>

      {/* Plan + dates */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface border border-surface2 rounded-xl px-4 py-3">
          <p className="text-xs text-muted mb-1">Plan</p>
          <p className="font-semibold text-sm">{PLAN_LABELS[plan]}</p>
        </div>

        {status === "TRIALING" && daysLeftInTrial !== null && (
          <div className="bg-surface border border-surface2 rounded-xl px-4 py-3">
            <p className="text-xs text-muted mb-1">Trial ends</p>
            <p className="font-semibold text-sm">
              {daysLeftInTrial === 0 ? "Today" : `${daysLeftInTrial} day${daysLeftInTrial !== 1 ? "s" : ""} left`}
            </p>
          </div>
        )}

        {status === "ACTIVE" && currentPeriodEnd && (
          <div className="bg-surface border border-surface2 rounded-xl px-4 py-3">
            <p className="text-xs text-muted mb-1">Renews</p>
            <p className="font-semibold text-sm">
              {new Date(currentPeriodEnd).toLocaleDateString()}
            </p>
          </div>
        )}

        {status === "PAST_DUE" && (
          <div className="bg-surface border border-orange-200 rounded-xl px-4 py-3">
            <p className="text-xs text-orange-600 mb-1">Action needed</p>
            <p className="font-semibold text-sm text-orange-700">Payment failed</p>
          </div>
        )}

        {grandfathered && (
          <div className="bg-surface border border-surface2 rounded-xl px-4 py-3">
            <p className="text-xs text-muted mb-1">Access</p>
            <p className="font-semibold text-sm">🎁 Free forever</p>
          </div>
        )}
      </div>

      {/* CTA */}
      {!grandfathered && (
        <div className="pt-1">
          {(status === "TRIALING" || status === "PAST_DUE") && (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="btn-primary w-full justify-center text-xs"
            >
              {loading ? "Redirecting…" : "Upgrade & Stay Dialed."}
              {!loading && <span className="btn-arrow">→</span>}
            </button>
          )}

          {status === "CANCELED" && (
            <button
              onClick={handleReactivate}
              disabled={loading}
              className="btn-primary w-full justify-center"
            >
              {loading ? "Redirecting…" : "Reactivate Subscription"}
              {!loading && <span className="btn-arrow">→</span>}
            </button>
          )}

          {status === "ACTIVE" && (
            <button
              onClick={handleManage}
              disabled={loading}
              className="w-full text-sm font-medium text-muted border border-surface2 rounded-xl px-4 py-3 hover:bg-surface transition-colors"
            >
              {loading ? "Opening portal…" : "Manage or cancel subscription"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}