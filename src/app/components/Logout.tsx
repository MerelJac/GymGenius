"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-sm text-red-600 hover:underline flex gap-2"
    >
      <LogOut size={16} color="red"/>
      Log out
    </button>
  );
}
