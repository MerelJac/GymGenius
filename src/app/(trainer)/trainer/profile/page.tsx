import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TrainerStats } from "./components/TrainerStats";
import { TrainerAccountSection } from "./components/TrainerAccountSection";
import InviteTrainer from "./components/InviteTrainer";
import { ResendInviteButton } from "@/app/components/ResendEmailButton";
import { BillingManagerServer } from "@/app/components/billing/BillingManagerServer";

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
        <h1 className="nav-logo">Trainer Profile</h1>
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
        phone={trainer.profile?.phone}
      />
      {/* Clients */}
      <section className="border border-gray-200 rounded-xl shadow-sm p-6 gradient-bg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="nav-logo">Clients</h1>
        </div>

        {trainer.clients.length === 0 ? (
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            No clients assigned yet.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {trainer.clients.map((client) => (
              <li
                key={client.id}
                className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 
        hover:bg-surface2/50 hover:pl-6 transition-all duration-150 group
        border-l-2 border-l-transparent hover:border-l-lime-green/50"
              >
                <div>
                  <div className="font-syne font-bold text-sm text-foreground truncate group-hover:text-lime-green transition-colors">
                    {client.profile?.firstName ?? "Unnamed"}{" "}
                    {client.profile?.lastName ?? "Client"}
                  </div>
                  <div className="text-xs text-gray-500">{client.email}</div>
                </div>

                <Link
                  href={`/clients/${client.id}`}
                  className="px-4 py-2 rounded-xl bg-surface2 border border-white/10 text-foreground text-xs font-semibold hover:border-lime-green/30 hover:text-lime-green transition-all active:scale-[0.97]"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Plan & Billing */}
      <section className="gradient-bg border border-surface2 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-surface2">
          <h3 className="font-syne font-bold text-base text-foreground">
            Plan & Billing
          </h3>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Current Plan</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-lime-green/10 text-lime-green">
              Trainer (Beta)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Status</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#3dffa0]/10 text-[#3dffa0]">
              Active
            </span>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-surface2 bg-surface2/30">
          <p className="text-xs text-muted italic">
            Billing controls coming soon.
          </p>
        </div>
      </section>

      {/* Invite Trainer */}
      {trainer.role === "ADMIN" && (
        <section className="gradient-bg border border-surface2 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-surface2">
            <h3 className="font-syne font-bold text-base text-foreground">
              Invite Trainers
            </h3>
          </div>

          <div className="px-5 py-4 space-y-4">
            <InviteTrainer />
            {invitedTrainers.length === 0 ? (
              <p className="text-xs text-muted italic">
                No trainers invited yet.
              </p>
            ) : (
              <ul className="divide-y divide-surface2">
                {invitedTrainers.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between px-1 py-3 hover:bg-surface2/50 transition-all duration-150 group"
                  >
                    <div className="flex flex-col">
                      <span className="font-syne font-bold text-sm text-foreground group-hover:text-lime-green transition-colors">
                        {t.email}
                      </span>
                      <span className="text-xs text-muted">
                        Invited {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <ResendInviteButton email={t.email} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      <BillingManagerServer />
      {/* Danger Zone */}
      <div className="border border-danger/20 bg-danger/5 rounded-2xl p-5 space-y-3">
        <h2 className="text-[10px] font-semibold tracking-widest uppercase text-danger">
          Danger Zone
        </h2>

        <p className="text-sm text-muted">These actions are irreversible.</p>

        <button
          disabled
          className="inline-flex items-center gap-2 rounded-xl bg-danger/10 border border-danger/20 px-4 py-2.5 text-sm font-semibold text-danger hover:bg-danger/20 transition active:scale-[0.98] disabled:opacity-50"
        >
          Delete Trainer Account (Coming Soon)
        </button>
      </div>
    </div>
  );
}
