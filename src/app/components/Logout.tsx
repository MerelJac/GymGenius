"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-cen gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-500 hover:bg-gray-100"
    >
      <LogOut size={16} color="red"/>
      Log out
    </button>
  );
}
