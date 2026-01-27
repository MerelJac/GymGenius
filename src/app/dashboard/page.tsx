// src/app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClientDashboard from "../components/dashboard/ClientDashboard";
import Page404 from "../components/Page404";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  console.log("ROLE", session.user?.role);
  if (session.user?.role === "TRAINER") {
    redirect("/trainer");
  } else if (session.user?.role === "ADMIN") {
    redirect("/trainer");
  } else if (session.user?.role === "CLIENT") {
    return <ClientDashboard />;
  } else {
    return <Page404 />;
  }
}
