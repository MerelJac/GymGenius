// src/app/(admin)/admin/billing/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminBillingTable } from "@/app/components/billing/AdminBillingTable";

export default async function AdminBillingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({
    where: { role: { not: "ADMIN" } },
    include: {
      subscription: true,
      profile: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = users.map((u) => ({
    id: u.id,
    email: u.email ?? "",
    role: u.role,
    name: u.profile
      ? `${u.profile.firstName ?? ""} ${u.profile.lastName ?? ""}`.trim()
      : null,
    subscription: u.subscription
      ? {
          id: u.subscription.id,
          status: u.subscription.status,
          plan: u.subscription.plan,
          grandfathered: u.subscription.grandfathered,
          trialEndsAt: u.subscription.trialEndsAt?.toISOString() ?? null,
          currentPeriodEnd: u.subscription.currentPeriodEnd?.toISOString() ?? null,
          stripeCustomerId: u.subscription.stripeCustomerId,
          stripeSubscriptionId: u.subscription.stripeSubscriptionId,
        }
      : null,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <div className="greeting">
        <h1>Billing Management</h1>
        <p className="text-sm text-gray-500">
          Manage subscriptions, trials, and access for all users
        </p>
      </div>
      <AdminBillingTable users={serialized} />
    </div>
  );
}