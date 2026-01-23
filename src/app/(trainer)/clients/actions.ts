"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createClient(email: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.user.create({
    data: {
      email,
      role: "CLIENT",
      trainerId: session.user.id,
      password: "TEMP", // replace later with invite / reset flow
    },
  });

  revalidatePath("/trainer/clients");
}
