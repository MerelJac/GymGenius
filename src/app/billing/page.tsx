import { getServerSession } from "next-auth";
import { BillingManagerServer } from "../components/billing/BillingManagerServer";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="max-w-lg mx-auto space-y-8 py-12 px-6">
      <div className="greeting">
        <h1>Billing</h1>
        <p className="text-sm text-gray-500">
          Manage your subscription and payment details
        </p>
      </div>
      <BillingManagerServer />
    </div>
  );
}