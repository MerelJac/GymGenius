// "use client";

// import { ClientHeader } from "../components/clients/ClientHeader";

// // src/app/(client)/layout.tsx
// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="min-h-screen bg-black overflow-x-hidden
// ">
//       <ClientHeader />

//       <main className="p-6  mx-auto bg-black">{children}</main>
//     </div>
//   );
// }


// app/(client)/layout.tsx  — server component, no "use client"
import { ClientHeader } from "@/app/components/clients/ClientHeader";
import { ClientAvatar } from "@/app/components/clients/ClientAvatar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const clientId = session?.user?.id;

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/*
        ClientHeader is "use client" but never imports ClientAvatar.
        ClientAvatar is a server component passed as children —
        Next.js serialises it on the server before sending to the client,
        so Prisma never touches the browser bundle.
      */}

      <ClientHeader clientId={clientId}>
        <Link href={`/profile`} className="client-avatar">
          <ClientAvatar />
        </Link>
      </ClientHeader>
     <main className="p-6  mx-auto bg-black">{children}</main>
    </div>
  );
}

