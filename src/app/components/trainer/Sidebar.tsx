"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "../Logout";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  ClipboardList,
  User2,
} from "lucide-react";

const navItems = [
  { href: "/trainer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/exercises", label: "Exercise Library", icon: Dumbbell },
  { href: "/programs", label: "Programs", icon: ClipboardList },
];

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-50 max-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        {/* Brand */}
        <div className="px-6 py-5 border-b">
          <h1 className="text-lg font-bold tracking-tight text-gray-900">
            GymGenius
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Trainer Dashboard</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition
        ${
          active
            ? "bg-blue-50 text-blue-700"
            : "text-gray-700 hover:bg-gray-100"
        }
        `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col px-4 py-6 space-y-1">
          <Link
            key={"/trainer/profile"}
            href={"/trainer/profile"}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition
        text-gray-700 hover:bg-gray-100
        
        "
          >
            <User2 size={16} />
            Profile
          </Link>
          {/* Footer */}
          <div className="px-4 py-4 border-t">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
