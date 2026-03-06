// lib/billing/access.ts
import { prisma } from "@/lib/prisma";

export async function getUserAccess(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) return { hasAccess: false, reason: "no_user" };

  // Admins always have access
  if (user.role === "ADMIN") return { hasAccess: true, reason: "admin" };

  const sub = user.subscription;

  if (!sub) return { hasAccess: false, reason: "no_subscription" };

  // Grandfathered users always have access
  if (sub.grandfathered) return { hasAccess: true, reason: "grandfathered" };

  // Active subscription
  if (sub.status === "ACTIVE") return { hasAccess: true, reason: "active" };

  // Trial still valid
  if (sub.status === "TRIALING" && sub.trialEndsAt && sub.trialEndsAt > new Date()) {
    return { hasAccess: true, reason: "trial", trialEndsAt: sub.trialEndsAt };
  }

  // Trial expired or canceled
  return { hasAccess: false, reason: sub.status };
}