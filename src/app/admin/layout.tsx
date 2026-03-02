// src/app/trainer/layout.tsx
import { getServerSession } from "next-auth";
import SidebarLayout from "../components/trainer/Sidebar";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

// SAME AS TRAINER LAYOUT
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);
  
      if (!session) {
        redirect("/login");
      }

  return <SidebarLayout role={session.user.role}>{children}</SidebarLayout>;
}
