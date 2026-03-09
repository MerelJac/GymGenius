import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { subscriptionCreatedToAdmin } from "@/lib/email-templates/subscriptionCreatedToAdmin";
import { subscriptionCanceledToClient } from "@/lib/email-templates/subscriptionCanceledToClient";
import { paymentFailedToClient } from "@/lib/email-templates/paymentFailedToClient";

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
    // ✅ Initial purchase — create or activate subscription
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (!userId) {
        console.error("No userId in checkout session metadata");
        break;
      }

      const invoice = await stripe.invoices.retrieve(session.invoice as string);
      const stripeSub = (await stripe.subscriptions.retrieve(
        session.subscription as string,
      )) as Stripe.Subscription;

      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          status: "ACTIVE",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: stripeSub.id,
          stripePriceId: stripeSub.items.data[0]?.price.id,
          currentPeriodEnd: invoice.period_end
            ? new Date(invoice.period_end * 1000)
            : null,
        },
        update: {
          status: "ACTIVE",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: stripeSub.id,
          stripePriceId: stripeSub.items.data[0]?.price.id,
          currentPeriodEnd: invoice.period_end
            ? new Date(invoice.period_end * 1000)
            : null,
        },
      });

      // 📧 Notify admin
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });
      if (user && process.env.ADMIN_EMAIL) {
        await subscriptionCreatedToAdmin(
          process.env.ADMIN_EMAIL,
          user.profile?.firstName ?? user.email,
          user.email,
          stripeSub.items.data[0]?.price.id ?? "Unknown plan",
        );
      }

      break;
    }

    // 🔄 Renewal succeeded — keep currentPeriodEnd fresh
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      // Skip the initial invoice — checkout.session.completed already handled it
      if (invoice.billing_reason === "subscription_create") break;

      await prisma.subscription.updateMany({
        where: { stripeCustomerId: invoice.customer as string },
        data: {
          status: "ACTIVE",
          currentPeriodEnd: invoice.period_end
            ? new Date(invoice.period_end * 1000)
            : null,
        },
      });
      break;
    }

    // ⚠️ Payment failed — mark past due
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await prisma.subscription.updateMany({
        where: { stripeCustomerId: invoice.customer as string },
        data: { status: "PAST_DUE" },
      });

      // 📧 Notify user their payment failed
      const sub = await prisma.subscription.findFirst({
        where: { stripeCustomerId: invoice.customer as string },
        include: { user: { include: { profile: true } } },
      });
      if (sub) {
        await paymentFailedToClient(
          sub.user.email,
          sub.user.profile?.firstName ?? "there",
        );
      }

      break;
    }

    // 🔄 Plan change, trial ending, etc.
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeCustomerId: sub.customer as string },
        data: {
          stripeSubscriptionId: sub.id,
          stripePriceId: sub.items.data[0]?.price.id,
          status:
            sub.status === "active"
              ? "ACTIVE"
              : sub.status === "past_due"
                ? "PAST_DUE"
                : sub.status === "trialing"
                  ? "TRIALING"
                  : "CANCELED",
        },
      });

      break;
    }

    // ❌ Cancelled or expired
    case "customer.subscription.deleted": {
      const stripeSub = event.data.object as Stripe.Subscription;

      await prisma.subscription.updateMany({
        where: { stripeCustomerId: stripeSub.customer as string },
        data: { status: "CANCELED" },
      });

      // 📧 Notify user their subscription was canceled
      const sub = await prisma.subscription.findFirst({
        where: { stripeCustomerId: stripeSub.customer as string },
        include: { user: { include: { profile: true } } },
      });
      if (sub) {
        await subscriptionCanceledToClient(
          sub.user.email,
          sub.user.profile?.firstName ?? "there",
        );
      }

      break;
    }

    // 🕐 User opened checkout but never paid
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Checkout session expired:", session.id);
      // No DB change needed unless you want to log it
      break;
    }
  }

  return NextResponse.json({ received: true });
}
