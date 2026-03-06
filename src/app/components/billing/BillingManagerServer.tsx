// src/components/billing/BillingManagerServer.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BillingManager } from "./BillingManager";
import { BillingPlan, BillingStatus } from "@prisma/client";

export async function BillingManagerServer() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  // Admins don't see billing
  if (session.user.role === "ADMIN") return null;

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!subscription) return null;

  return (
    <BillingManager
      status={subscription.status as BillingStatus}
      plan={subscription.plan as BillingPlan}
      trialEndsAt={subscription.trialEndsAt?.toISOString() ?? null}
      currentPeriodEnd={subscription.currentPeriodEnd?.toISOString() ?? null}
      grandfathered={subscription.grandfathered}
    />
  );
}
