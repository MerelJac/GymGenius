"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const WAIVER_VERSION = "v1.0";

export async function signWaiver() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  console.log("user signing waiver");
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: {
      waiverSignedAt: true,
      waiverVersion: true,
    },
  });

  // Already signed this version → do not overwrite date
  if (profile?.waiverSignedAt && profile.waiverVersion === WAIVER_VERSION) {
    redirect("/dashboard");
  }

  console.log("user signing waiver");
  await prisma.profile.update({
    where: { userId: session.user.id },
    data: {
      waiverSignedAt: new Date(),
      waiverVersion: WAIVER_VERSION,
    },
  });

  redirect("/dashboard");
}
