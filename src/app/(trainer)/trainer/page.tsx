export default function TrainerDashboard() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Trainer Dashboard</h1>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="border p-4">Today’s Workouts</div>
        <div className="border p-4">Missed Workouts</div>
        <div className="border p-4">Unread Messages</div>
      </div>
    </div>
  )
}
