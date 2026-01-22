import { prisma } from "@/lib/prisma"
import { Program } from "@/types/program"

export default async function ProgramsPage() {
  const programs = await prisma.program.findMany()

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Programs</h1>
        <a href="/programs/new">New Program</a>
      </div>

      <ul>
        {programs.map((p: Program) => (
          <li key={p.id} className="border p-3">
            <a href={`/programs/${p.id}`}>{p.name}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
