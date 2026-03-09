// app/api/billing/reactivate/route.ts
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    include: { user: true },
  });

  if (!subscription) {
    return NextResponse.json(
      { error: "No subscription found" },
      { status: 404 },
    );
  }

  const priceId =
    subscription.user.role === "TRAINER"
      ? process.env.STRIPE_TRAINER_PRICE_ID!
      : process.env.STRIPE_CLIENT_PRICE_ID!;

  const successUrl = `${process.env.NEXTAUTH_URL}/dashboard?billing=reactivated`;
  const cancelUrl = `${process.env.NEXTAUTH_URL}/billing`;

  try {
    // They have an existing Stripe subscription — try to resume it
    if (subscription.stripeSubscriptionId) {
      const stripeSub = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId,
      );

      if (stripeSub.status !== "canceled") {
        // Past due or paused — just un-cancel it
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: false,
        });
        await prisma.subscription.update({
          where: { userId: session.user.id },
          data: { status: "ACTIVE" },
        });
        console.log("✅ Resumed existing subscription for", session.user.id);
        return NextResponse.json({ url: successUrl });
      }
    }

    // Fully canceled or no sub at all — new checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: subscription.stripeCustomerId ?? undefined,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: session.user.id,
      },
    });

    console.log("🔁 Created new checkout session for", session.user.id);
    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("❌ Reactivation error:", err);
    return NextResponse.json(
      { error: "Failed to reactivate" },
      { status: 500 },
    );
  }
}
