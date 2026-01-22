// src/app/trainer/layout.tsx
import Link from "next/link"

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r p-4">
        <h2 className="font-bold mb-6">GymGenius</h2>

        <nav className="space-y-2 flex flex-col">
          <Link href="/">Dashboard</Link>
          <Link href="/clients">Clients</Link>
          <Link href="/exercises">Exercse Library</Link>
          <Link href="/programs">Programs</Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  )
}
