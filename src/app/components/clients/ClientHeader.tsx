"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";
export function ClientHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`sticky top-0 z-40 bg-white transition-shadow ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Link
            href="/client"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 transition"
          >
            <h2 className="text-lg font-semibold text-gray-900">GymGenius</h2>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-6">
          <Link
            href="/profile"
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
          >
            {/* Avatar */}
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">
              <UserRound size={16} />
            </div>
          </Link>
        </nav>
      </div>
    </header>
  );
}
