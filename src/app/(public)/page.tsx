// src/app/(public)/page.tsx

import Link from "next/link";

export default function PublicLandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold mb-6  text-black">
            Smarter training. Better results.
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Dialed Fitness helps trainers and clients plan workouts, track progress,
            and stay accountable — all in one simple platform.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/signup"
              className="px-6 py-3 rounded bg-black text-white hover:bg-gray-800"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded border hover:bg-white"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20 bg-white">
        <div className="grid md:grid-cols-3 gap-10">
          <Feature
            title="Workout Programming"
            description="Create, assign, and manage structured training programs with ease."
          />
          <Feature
            title="Progress Tracking"
            description="Log workouts, monitor progress, and stay consistent over time."
          />
          <Feature
            title="Trainer & Client Tools"
            description="Built for both coaches and athletes, with clear communication and insights."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold mb-4">
            Start training smarter today
          </h2>
          <p className="text-gray-300 mb-6">
            Join Dialed Fitness and take control of your training experience.
          </p>
          <Link
            href="/signup"
            className="inline-block px-6 py-3 rounded bg-white text-black hover:bg-gray-200"
          >
            Create an account
          </Link>
        </div>
      </section>
    </>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
