// src/app/trainer/page.tsx
export default function TrainerHomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Today</h1>

      <section>
        <h2 className="font-medium mb-2">Today’s Workouts</h2>
        {/* list of clients + workout status */}
      </section>

      <section>
        <h2 className="font-medium mb-2">Missed Workouts</h2>
      </section>

      <section>
        <h2 className="font-medium mb-2">Recently Completed</h2>
      </section>
    </div>
  )
}
