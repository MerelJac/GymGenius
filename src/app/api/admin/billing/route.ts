// src/app/api/admin/billing/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action, userId } = await req.json();

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  switch (action) {
    case "grandfather": {
      await prisma.subscription.update({
        where: { userId },
        data: { grandfathered: true, status: "GRANDFATHERED" },
      });
      return NextResponse.json({ success: true, message: "User grandfathered" });
    }

    case "ungrandfather": {
      await prisma.subscription.update({
        where: { userId },
        data: { grandfathered: false, status: "CANCELED" },
      });
      return NextResponse.json({ success: true, message: "Grandfathered status removed" });
    }

    case "extend_trial": {
      const { days } = await req.json().catch(() => ({ days: 7 }));
      const base = subscription.trialEndsAt && subscription.trialEndsAt > new Date()
        ? subscription.trialEndsAt
        : new Date();
      const newEnd = new Date(base);
      newEnd.setDate(newEnd.getDate() + (days ?? 7));
      await prisma.subscription.update({
        where: { userId },
        data: {
          trialEndsAt: newEnd,
          status: "TRIALING",
        },
      });
      return NextResponse.json({ success: true, message: `Trial extended by ${days} days` });
    }

    case "cancel": {
      await prisma.subscription.update({
        where: { userId },
        data: { status: "CANCELED" },
      });
      return NextResponse.json({ success: true, message: "Subscription canceled" });
    }

    case "activate": {
      await prisma.subscription.update({
        where: { userId },
        data: { status: "ACTIVE" },
      });
      return NextResponse.json({ success: true, message: "Subscription activated" });
    }

    case "create": {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14);
      await prisma.subscription.create({
        data: {
          userId,
          status: "TRIALING",
          plan: "CLIENT_MONTHLY",
          trialEndsAt,
        },
      });
      return NextResponse.json({ success: true, message: "Subscription created" });
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}