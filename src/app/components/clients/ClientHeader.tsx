"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Dumbbell } from "lucide-react";

interface ClientHeaderProps {
  clientId: string;
  children?: React.ReactNode; // slot for <ClientAvatar /> passed from the server
}

export function ClientHeader({ clientId, children }: ClientHeaderProps) {
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
      className={`sticky top-0 z-40 bg-black transition-shadow ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 transition"
          >
            <h2 className="nav-logo">Dialed Fitness</h2>
          </Link>
        </div>


          {/* Nav */}
          <nav className="flex items-center gap-6">
            <Link
              href={`/client/${clientId}/exercises/exercise-list`}
              className="nav-avatar"
            >
              <Dumbbell size={18} />
            </Link>
    
            {children}
          </nav>
   
      </div>
    </header>
  );
}
