"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoutButton } from "../Logout";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  ClipboardList,
  User2,
  Menu,
  X,
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
  const [open, setOpen] = useState(false);

  function NavLinks({ onClick }: { onClick?: () => void }) {
    return (
      <>
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClick}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition
                ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 h-14 bg-white border-b z-40 flex items-center px-4">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="ml-3 font-semibold">GymGenius</div>
      </header>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed z-50 inset-y-0 left-0 w-64 bg-white border-r flex flex-col
          transform transition-transform duration-200
          md:static md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Brand */}
        <div className="px-6 py-5 border-b flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900">
              GymGenius
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Trainer Dashboard</p>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <NavLinks onClick={() => setOpen(false)} />
        </nav>

        {/* Footer */}
        <div className="px-4 py-6 space-y-1 border-t">
          <Link
            href="/trainer/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <User2 size={16} />
            Profile
          </Link>

          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 pt-20 md:pt-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
