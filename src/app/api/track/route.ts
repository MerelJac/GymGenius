import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { event, path, props } = await req.json();

  // non-blocking — don't await, just fire
  prisma.analyticsEvent.create({
    data: {
      userId: session?.user?.id ?? null,
      event,
      path,
      props: props ?? undefined,
    },
  }).catch(() => {}); // silently swallow errors, never block the user

  return new Response(null, { status: 204 });
}