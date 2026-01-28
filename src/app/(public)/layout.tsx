// src/app/(public)/layout.tsx

import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo / Brand */}
          <Link href="/" className="text-lg font-semibold text-black">
            GymGenius
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/login"
              className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-50"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      {/* Optional footer */}
      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-6 py-6 text-sm text-gray-500 flex justify-between">
          <span>© {new Date().getFullYear()} Gym Genius</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-gray-700">
              Terms & Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
