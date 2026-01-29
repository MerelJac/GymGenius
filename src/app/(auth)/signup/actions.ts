"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

type SignupResult = { success: true } | { success: false; error: string };

export async function signupAction(formData: FormData): Promise<SignupResult> {
  const email = String(formData.get("email")).trim().toLowerCase();
  const password = String(formData.get("password"));
  const passwordConfirm = String(formData.get("password-confirm"));

  if (!email || !password || !passwordConfirm) {
    return { success: false, error: "Missing required fields" };
  }

  if (password !== passwordConfirm) {
    return { success: false, error: "Passwords do not match" };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      success: false,
      error: "This email is not authorized to register.",
    };
  }

  if (user.password) {
    return { success: false, error: "Account already exists. Please log in." };
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  return { success: true };
}
