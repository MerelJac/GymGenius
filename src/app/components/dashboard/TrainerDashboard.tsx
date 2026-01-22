// src/components/dashboards/TrainerDashboard.tsx
export default function TrainerDashboard() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Trainer Dashboard</h1>

      <div className="rounded border p-4">
        <p>Manage clients</p>
      </div>

      <div className="rounded border p-4">
        <p>Create / edit workouts</p>
      </div>

      <div className="rounded border p-4">
        <p>View client progress</p>
      </div>
    </div>
  )
}
