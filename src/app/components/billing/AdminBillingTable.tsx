// src/components/billing/AdminBillingTable.tsx
"use client";
import { useState, useMemo } from "react";
import { AdminBillingRow } from "./AdminBillingRow";

type SubscriptionStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "GRANDFATHERED";

interface UserBillingData {
  id: string;
  email: string;
  role: string;
  name: string | null;
  subscription: {
    id: string;
    status: SubscriptionStatus;
    plan: string;
    grandfathered: boolean;
    trialEndsAt: string | null;
    currentPeriodEnd: string | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
  } | null;
}

const STATUS_FILTERS = ["ALL", "TRIALING", "ACTIVE", "PAST_DUE", "CANCELED", "GRANDFATHERED", "NO_SUB"];
const ROLE_FILTERS = ["ALL", "TRAINER", "CLIENT"];

export function AdminBillingTable({ users }: { users: UserBillingData[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [toast, setToast] = useState<{ message: string; ok: boolean } | null>(null);

  const showToast = (message: string, ok: boolean) => {
    setToast({ message, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !search ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.name ?? "").toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "NO_SUB" && !u.subscription) ||
        u.subscription?.status === statusFilter;

      const matchRole = roleFilter === "ALL" || u.role === roleFilter;

      return matchSearch && matchStatus && matchRole;
    });
  }, [users, search, statusFilter, roleFilter]);

  // Summary counts
  const counts = useMemo(() => ({
    active: users.filter((u) => u.subscription?.status === "ACTIVE").length,
    trialing: users.filter((u) => u.subscription?.status === "TRIALING").length,
    canceled: users.filter((u) => u.subscription?.status === "CANCELED").length,
    grandfathered: users.filter((u) => u.subscription?.grandfathered).length,
    pastDue: users.filter((u) => u.subscription?.status === "PAST_DUE").length,
  }), [users]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Active", value: counts.active, color: "text-green-700 bg-green-50 border-green-200" },
          { label: "Trialing", value: counts.trialing, color: "text-yellow-700 bg-yellow-50 border-yellow-200" },
          { label: "Past Due", value: counts.pastDue, color: "text-orange-700 bg-orange-50 border-orange-200" },
          { label: "Canceled", value: counts.canceled, color: "text-red-700 bg-red-50 border-red-200" },
          { label: "Grandfathered", value: counts.grandfathered, color: "text-blue-700 bg-blue-50 border-blue-200" },
        ].map((c) => (
          <div key={c.label} className={`rounded-xl border px-4 py-3 ${c.color}`}>
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-xs font-medium mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-surface2 rounded-xl px-4 py-2 text-sm bg-surface flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-mint/30"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-surface2 rounded-xl px-3 py-2 text-sm bg-surface"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>{s === "ALL" ? "All Statuses" : s}</option>
          ))}
        </select>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-surface2 rounded-xl px-3 py-2 text-sm bg-surface"
        >
          {ROLE_FILTERS.map((r) => (
            <option key={r} value={r}>{r === "ALL" ? "All Roles" : r}</option>
          ))}
        </select>

        <span className="text-xs text-muted ml-auto">
          {filtered.length} of {users.length} users
        </span>
      </div>

      {/* Table */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted text-center py-12">No users match your filters</p>
        ) : (
          filtered.map((user) => (
            <AdminBillingRow
              key={user.id}
              user={user}
              onAction={showToast}
            />
          ))
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-4 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-3 transition-all ${toast.ok ? "bg-green-600" : "bg-red-600"}`}>
          <span>{toast.ok ? "✅" : "❌"}</span>
          {toast.message}
        </div>
      )}
    </div>
  );
}