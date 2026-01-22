import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import TrainerDashboard from "../components/dashboard/TrainerDashboard"
import ClientDashboard from "../components/dashboard/ClientDashboard"
import Page404 from "../components/Page404"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) redirect("/login")

    console.log('ROLE', session.user?.role)
  if (session.user?.role === "TRAINER") {
    return <TrainerDashboard />
  } else if (session.user?.role === "CLIENT") {
  return <ClientDashboard />
  } else {
    return <Page404/>
  }


}
