// app/api/billing/webhook/route.ts
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Webhook signature failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("Stripe event received:", event.type);

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeCustomerId: sub.customer as string },
        data: {
          stripeSubscriptionId: sub.id,
          stripePriceId: sub.items.data[0].price.id,
          status:
            sub.status === "active"
              ? "ACTIVE"
              : sub.status === "past_due"
                ? "PAST_DUE"
                : sub.status === "trialing"
                  ? "TRIALING"
                  : "CANCELED",
          currentPeriodEnd: sub.items.data[0]?.current_period_end
            ? new Date(sub.items.data[0].current_period_end * 1000)
            : null,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeCustomerId: sub.customer as string },
        data: { status: "CANCELED" },
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await prisma.subscription.updateMany({
        where: { stripeCustomerId: invoice.customer as string },
        data: { status: "PAST_DUE" },
      });
      break;
    }
  }
  return NextResponse.json({ received: true });
}
