import { prisma } from "@/lib/prisma";
import ProgramsPageClient from "@/app/components/programs/ProgramClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function ProgramsPage() {
    const session = await getServerSession(authOptions);
    if (!session) {
      redirect("/");
    }
  const programs = await prisma.program.findMany({
    orderBy: { createdAt: "desc" },
    where: {
      trainerId: session.user.id
    }
  });

  return <ProgramsPageClient initialPrograms={programs} />;
}
