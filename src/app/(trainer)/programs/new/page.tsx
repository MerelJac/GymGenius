import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default function NewProgramPage() {
  async function createProgram(formData: FormData) {
    "use server"

    const program = await prisma.program.create({
      data: {
        name: String(formData.get("name")),
        trainerId: "TODO_FROM_SESSION",
      },
    })

    redirect(`/programs/${program.id}`)
  }

  return (
    <form action={createProgram}>
      <h1>Create Program</h1>
      <input name="name" placeholder="Program name" />
      <button type="submit">Create</button>
    </form>
  )
}
