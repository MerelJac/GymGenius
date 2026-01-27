import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TrainerStats } from "./components/TrainerStats";
import { TrainerAccountSection } from "./components/TrainerAccountSection";
import InviteTrainer from "./components/InviteTrainer";

export default async function TrainerProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notFound();

  const trainer = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      clients: {
        include: {
          profile: true,
          scheduledWorkouts: {
            select: { status: true },
          },
        },
      },
    },
  });

  if (!trainer) return notFound();

  const invitedTrainers = await prisma.user.findMany({
    where: {
      trainerId: trainer.id, // 👈 users invited by me
      role: "TRAINER",
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900">Trainer Profile</h1>
        <p className="text-sm text-gray-500">
          Your account details and clients
        </p>
        {trainer.role === "ADMIN" && (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 border border-green-300">
            ADMIN & TRAINER
          </span>
        )}
      </div>

      {/* Stats */}
      <TrainerStats trainer={trainer} />

      {/* Trainer info */}

      <TrainerAccountSection
        firstName={trainer.profile?.firstName}
        lastName={trainer.profile?.lastName}
        email={trainer.email}
      />
      {/* Clients */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Clients</h2>
        </div>

        {trainer.clients.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No clients assigned yet.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {trainer.clients.map((client) => (
              <li
                key={client.id}
                className="py-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {client.profile?.firstName ?? "Unnamed"}{" "}
                    {client.profile?.lastName ?? "Client"}
                  </div>
                  <div className="text-xs text-gray-500">{client.email}</div>
                </div>

                <Link
                  href={`/clients/${client.id}`}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Plan & Billing */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-900">Plan & Billing</h3>

        <div className="text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Current Plan</span>
            <span className="font-medium">Trainer (Beta)</span>
          </div>

          <div className="flex justify-between">
            <span>Status</span>
            <span className="text-green-600 font-medium">Active</span>
          </div>
        </div>

        <div className="pt-3 text-sm text-gray-500 italic">
          Billing controls coming soon.
        </div>
      </section>

      {/* Invite Trainer */}
      {trainer.role === "ADMIN" && (
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900">Invite Trainers</h3>

          <InviteTrainer />
          {invitedTrainers.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              No trainers invited yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {invitedTrainers.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-2"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {t.email}
                    </span>
                    <span className="text-xs text-gray-500">
                      Invited {new Date(t.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {t.password ? (
                    <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                      Pending
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Danger Zone */}
      <section className="border border-red-200 bg-red-50 rounded-xl p-6 space-y-3">
        <h3 className="font-semibold text-red-700">Danger Zone</h3>

        <p className="text-sm text-red-600">These actions are irreversible.</p>

        <button
          disabled
          className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm opacity-50 cursor-not-allowed"
        >
          Delete Trainer Account (Coming Soon)
        </button>
      </section>
    </div>
  );
}
