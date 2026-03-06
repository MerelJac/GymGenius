// src/components/billing/AdminBillingRow.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type SubscriptionStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "GRANDFATHERED";

interface UserBillingData {
  id: string;
  email: string;
  role: string;
  name: string | null;
  subscription: {
    status: SubscriptionStatus;
    plan: string;
    grandfathered: boolean;
    trialEndsAt: string | null;
    currentPeriodEnd: string | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
  } | null;
}

const STATUS_STYLES: Record<string, string> = {
  TRIALING:      "text-yellow-700 bg-yellow-50 border-yellow-200",
  ACTIVE:        "text-green-700 bg-green-50 border-green-200",
  PAST_DUE:      "text-orange-700 bg-orange-50 border-orange-200",
  CANCELED:      "text-red-700 bg-red-50 border-red-200",
  GRANDFATHERED: "text-blue-700 bg-blue-50 border-blue-200",
  NO_SUB:        "text-gray-500 bg-gray-50 border-gray-200",
};

export function AdminBillingRow({
  user,
  onAction,
}: {
  user: UserBillingData;
  onAction: (message: string, ok: boolean) => void;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [extendDays, setExtendDays] = useState(7);

  const sub = user.subscription;
  const status = sub?.status ?? "NO_SUB";

  const runAction = async (action: string, extra?: object) => {
    setLoading(action);
    try {
      const res = await fetch("/api/admin/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId: user.id, ...extra }),
      });
      const data = await res.json();
      if (res.ok) {
        onAction(data.message, true);
        router.refresh();
      } else {
        onAction(data.error ?? "Something went wrong", false);
      }
    } catch {
      onAction("Request failed", false);
    } finally {
      setLoading(null);
    }
  };

  const daysLeft = sub?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(sub.trialEndsAt).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div className="bg-surface border border-surface2 rounded-2xl overflow-hidden">
      {/* Row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-surface2/40 transition-colors text-left"
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-mint/10 flex items-center justify-center text-sm font-bold text-mint flex-shrink-0">
          {(user.name || user.email)[0].toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{user.name || user.email}</p>
          {user.name && <p className="text-xs text-muted truncate">{user.email}</p>}
        </div>

        {/* Role badge */}
        <span className="text-xs font-medium text-muted border border-surface2 px-2.5 py-1 rounded-full hidden sm:block">
          {user.role}
        </span>

        {/* Trial days */}
        {status === "TRIALING" && daysLeft !== null && (
          <span className="text-xs text-yellow-600 hidden md:block">
            {daysLeft}d left
          </span>
        )}

        {/* Status */}
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_STYLES[status]}`}>
          {status === "NO_SUB" ? "No Sub" : status}
        </span>

        {/* Expand */}
        <span className="text-muted text-sm ml-1">{expanded ? "▲" : "▼"}</span>
      </button>

      {/* Expanded actions */}
      {expanded && (
        <div className="border-t border-surface2 px-5 py-4 space-y-4 bg-surface2/20">
          {/* Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-muted mb-0.5">Plan</p>
              <p className="font-medium">{sub?.plan ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted mb-0.5">Trial ends</p>
              <p className="font-medium">
                {sub?.trialEndsAt ? new Date(sub.trialEndsAt).toLocaleDateString() : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted mb-0.5">Period end</p>
              <p className="font-medium">
                {sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted mb-0.5">Stripe customer</p>
              <p className="font-medium truncate">{sub?.stripeCustomerId ?? "—"}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {!sub && (
              <ActionButton label="Create Subscription" icon="➕" loading={loading === "create"} onClick={() => runAction("create")} variant="primary" />
            )}

            {sub && !sub.grandfathered && (
              <ActionButton label="Grandfather (free forever)" icon="🎁" loading={loading === "grandfather"} onClick={() => runAction("grandfather")} variant="blue" />
            )}

            {sub?.grandfathered && (
              <ActionButton label="Remove Grandfather" icon="🚫" loading={loading === "ungrandfather"} onClick={() => runAction("ungrandfather")} variant="gray" />
            )}

            {sub && status !== "ACTIVE" && status !== "GRANDFATHERED" && (
              <ActionButton label="Force Activate" icon="✅" loading={loading === "activate"} onClick={() => runAction("activate")} variant="green" />
            )}

            {sub && status === "ACTIVE" && (
              <ActionButton label="Cancel" icon="❌" loading={loading === "cancel"} onClick={() => runAction("cancel")} variant="red" />
            )}

            {/* Extend trial */}
            {sub && (
              <div className="flex items-center gap-2 border border-surface2 rounded-xl px-3 py-2 bg-surface">
                <span className="text-xs text-muted">Extend trial by</span>
                <select
                  value={extendDays}
                  onChange={(e) => setExtendDays(Number(e.target.value))}
                  className="text-xs bg-transparent font-medium"
                >
                  {[3, 7, 14, 30].map((d) => (
                    <option key={d} value={d}>{d} days</option>
                  ))}
                </select>
                <ActionButton
                  label="Extend"
                  icon="⏳"
                  loading={loading === "extend_trial"}
                  onClick={() => runAction("extend_trial", { days: extendDays })}
                  variant="yellow"
                  small
                />
              </div>
            )}

            {/* Stripe Dashboard link */}
            {sub?.stripeCustomerId && (
              <Link
                href={`https://dashboard.stripe.com/customers/${sub.stripeCustomerId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium px-3 py-2 border border-surface2 rounded-xl text-muted hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <span>↗</span> Stripe Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({
  label, icon, loading, onClick, variant, small,
}: {
  label: string;
  icon: string;
  loading: boolean;
  onClick: () => void;
  variant: "primary" | "green" | "red" | "blue" | "yellow" | "gray";
  small?: boolean;
}) {
  const styles: Record<string, string> = {
    primary: "bg-mint text-white hover:bg-mint/90",
    green:   "bg-green-600 text-white hover:bg-green-700",
    red:     "bg-red-500 text-white hover:bg-red-600",
    blue:    "bg-blue-600 text-white hover:bg-blue-700",
    yellow:  "bg-yellow-400 text-yellow-900 hover:bg-yellow-500",
    gray:    "bg-gray-200 text-gray-700 hover:bg-gray-300",
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-1.5 font-semibold rounded-xl transition-colors disabled:opacity-50 ${small ? "text-xs px-2.5 py-1.5" : "text-xs px-3 py-2"} ${styles[variant]}`}
    >
      <span>{icon}</span>
      {loading ? "…" : label}
    </button>
  );
}