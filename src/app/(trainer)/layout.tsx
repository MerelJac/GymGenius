export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r p-4">
        <h2 className="font-bold mb-4">GymGenius</h2>

        <nav className="space-y-2">
          <a href="/trainer">Dashboard</a>
          <a href="/trainer/clients">Clients</a>
          <a href="/trainer/exercises">Exercise Library</a>
          <a href="/trainer/programs">Programs</a>
        </nav>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
