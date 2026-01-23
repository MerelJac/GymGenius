import Link from "next/link"

// src/app/(client)/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white p-4 flex flex-row justify-between items-center">
        <h2 className="font-semibold">GymGenius</h2>
        <Link href={"/profile"}>Profile</Link>
      </header>
      <main className="p-6 max-w-6xl mx-auto">{children}</main>
    </div>
  )
}
