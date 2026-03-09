// src/scripts/updateTrialStatus.ts
import { trailEndingSoonEmailToClient } from "@/lib/email-templates/trailEndingSoonEmailToClient";
import { trialEndingEmailToClient } from "@/lib/email-templates/trialEndingEmailToClient";
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
      user: {
        include: {
          profile: true,
        },
      },
    },
  });

  if (expiredTrials.length === 0) {
    console.log("✅ No expired trials found");
    return { expiredCount: 0, userIds: [] };
  }

  // Send emails to clients
  // Admin is CC'd
  for (const sub of expiredTrials) {
    await trialEndingEmailToClient(
      sub.user.email,
      sub.user.profile?.firstName ?? "there",
      sub.trialEndsAt!,
    );
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


export async function sendTrialWarnings() {
  const now = new Date();
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  // Trials ending in the next 3 days that haven't been warned yet
  const soonExpiring = await prisma.subscription.findMany({
    where: {
      status: "TRIALING",
      trialEndsAt: {
        gt: now,      // not expired yet
        lte: in3Days, // but expiring within 3 days
      }
    },
    include: { user: { include: { profile: true } } },
  });

  if (soonExpiring.length === 0) {
    console.log("✅ No upcoming trial expirations to warn about");
    return { warnedCount: 0 };
  }

  for (const sub of soonExpiring) {
    await trailEndingSoonEmailToClient(
      sub.user.email,
      sub.user.profile?.firstName ?? "there",
      sub.trialEndsAt!,
    );

  }

  console.log(`✅ Sent trial warnings to ${soonExpiring.length} users`);
  return { warnedCount: soonExpiring.length };
}
