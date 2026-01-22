// src/app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white p-4">
        <h2 className="font-semibold">GymGenius</h2>
      </header>

      <main className="p-6 max-w-6xl mx-auto">{children}</main>
    </div>
  )
}
