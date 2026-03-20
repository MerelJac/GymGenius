// app/api/clients/[clientId]/exercises/[exerciseId]/logs/route.ts
import { prisma } from "@/lib/prisma";
 
export async function GET(
  _req: Request,
  context: {
    params: Promise<{ clientId: string; exerciseId: string }>;
  }
) {
  const { clientId, exerciseId } = await context.params;
 
  const exerciseLogs = await prisma.exerciseLog.findMany({
    where: {
      exerciseId,
      workoutLog: {
        clientId,
      },
    },
    include: {
      workoutLog: {
        select: { endedAt: true },
      },
    },
    orderBy: {
      workoutLog: { endedAt: "desc" },
    },
  });
 
  return Response.json(exerciseLogs);
}
 