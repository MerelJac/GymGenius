import Link from "next/link";
import { UpgradeButton } from "../billing/UpgradeButton";

type Access = {
  reason: string;
  trialEndsAt?: string | Date | null;
};

export function getStatusDisplay(status: string) {
  switch (status) {
    case "COMPLETED":
      return { icon: "✅", label: "Done", className: "done", bgClass: "bg-mint/10" };
    case "IN_PROGRESS":
      return { icon: "🔥", label: "In Progress", className: "in-progress", bgClass: "bg-yellow-400/10" };
    case "SKIPPED":
      return { icon: "⏭️", label: "Skipped", className: "skipped", bgClass: "bg-surface2" };
    default:
      return { icon: "⚠️", label: "Missed", className: "missed", bgClass: "bg-danger/10" };
  }
}

export default function BillingStatusNotice({ access }: { access: Access }) {
  if (access.reason === "trial" && access.trialEndsAt) {
    const daysLeft = Math.ceil(
      (new Date(access.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    return (
      <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-lg">⏳</span>
          <div>
            <p className="text-yellow-400 text-sm font-semibold tracking-wide">Free Trial</p>
            <p className="text-white/40 text-xs mt-0.5">
              {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining — upgrade to keep access.
            </p>
          </div>
        </div>
        <UpgradeButton />
      </div>
    );
  }

  if (access.reason === "grandfathered") {
    return (
      <div className="rounded-xl border border-lime-400/20 bg-lime-400/5 px-5 py-4 flex items-center gap-3">
        <span className="text-lg">🎁</span>
        <div>
          <p className="text-lime-400 text-sm font-semibold tracking-wide">Complimentary Access</p>
          <p className="text-white/40 text-xs mt-0.5">Full access, on us — forever.</p>
        </div>
      </div>
    );
  }

  if (access.reason === "CANCELED") {
    return (
      <div className="rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="text-red-400 text-sm font-semibold tracking-wide">Subscription Ended</p>
            <p className="text-white/40 text-xs mt-0.5">Reactivate to regain full access.</p>
          </div>
        </div>
        <Link
          href="/billing/reactivate"
          className="shrink-0 text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/20 px-4 py-2 rounded-lg transition-colors"
        >
          Reactivate
        </Link>
      </div>
    );
  }

  return null;
}