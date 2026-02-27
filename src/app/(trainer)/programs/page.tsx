import { prisma } from "@/lib/prisma";
import ProgramsPageClient from "@/app/components/programs/ProgramClient";
export const dynamic = "force-dynamic";
export default async function ProgramsPage() {
  const programs = await prisma.program.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <ProgramsPageClient initialPrograms={programs} />;
}
