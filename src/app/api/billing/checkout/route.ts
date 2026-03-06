// app/api/billing/checkout/route.ts
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const priceId = user.role === "TRAINER"
    ? process.env.STRIPE_TRAINER_PRICE_ID!
    : process.env.STRIPE_CLIENT_PRICE_ID!;

  // Create or reuse Stripe customer
  let customerId = user.subscription?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email! });
    customerId = customer.id;
    await prisma.subscription.update({
      where: { userId: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?billing=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/billing`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}