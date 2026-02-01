// app/(trainer)/profile/components/ResendInviteButton.tsx
"use client";

import { sendWelcomeEmail } from "@/lib/email-templates/welcomeEmail";
import { Mail } from "lucide-react";

import { useTransition } from "react";

export function ResendInviteButton({ email }: { email: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(() => sendWelcomeEmail(email))
      }
      className="ml-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
      title="Resend email"
    >
      <Mail size={16} />
    </button>
  );
}
