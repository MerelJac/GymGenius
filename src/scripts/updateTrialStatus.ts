// src/scripts/updateTrialStatus.ts
import { prisma } from "@/lib/prisma";

export async function updateTrialStatus() {
  const now = new Date();

  // Find all trialing subscriptions where trial has expired
  const expiredTrials = await prisma.subscription.findMany({
    where: {
      status: "TRIALING",
      trialEndsAt: { lte: now },
    },
    include: {
      user: true,
    },
  });

  if (expiredTrials.length === 0) {
    console.log("✅ No expired trials found");
    return { expiredCount: 0, userIds: [] };
  }

  // Mark them as canceled
  await prisma.subscription.updateMany({
    where: {
      id: { in: expiredTrials.map((s) => s.id) },
    },
    data: { status: "CANCELED" },
  });

  console.log(`✅ Marked ${expiredTrials.length} trials as CANCELED`);

  return {
    expiredCount: expiredTrials.length,
    userIds: expiredTrials.map((s) => s.userId),
  };
}