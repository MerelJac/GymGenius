// src/components/dashboards/ClientDashboard.tsx
export default function ClientDashboard() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Client Dashboard</h1>

      <div className="rounded border p-4">
        <p>Today’s workout</p>
      </div>

      <div className="rounded border p-4">
        <p>Progress overview</p>
      </div>

      <div className="rounded border p-4">
        <p>Messages from your trainer</p>
      </div>
    </div>
  )
}
