// src/app/(trainer)/profile/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateTrainerProfile(
  firstName: string,
  lastName: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: { firstName, lastName },
    create: {
      userId: session.user.id,
      firstName,
      lastName,
    },
  });

  revalidatePath("/trainer/profile");
}