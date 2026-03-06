// lib/billing/createSubscription.ts
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function createInitialSubscription(userId: string, role: Role) {
  if (role === "ADMIN") return; // admins skip billing entirely

  // 👇 this check is missing from your current version
  const existing = await prisma.subscription.findUnique({ where: { userId } });
  if (existing) return;

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  await prisma.subscription.create({
    data: {
      userId,
      status: "TRIALING",
      plan: role === "TRAINER" ? "TRAINER_MONTHLY" : "CLIENT_MONTHLY",
      trialEndsAt,
    },
  });
}
