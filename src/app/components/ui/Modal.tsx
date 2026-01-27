"use client";

import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-x-0 top-10 mx-auto max-w-lg bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          {title && <h2 className="font-semibold text-lg">{title}</h2>}
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
