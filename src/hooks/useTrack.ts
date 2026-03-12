"use client";
import { usePathname } from "next/navigation";
import { useCallback } from "react";

export function useTrack() {
  const path = usePathname();

  return useCallback((event: string, props?: Record<string, unknown>) => {
    const payload = JSON.stringify({ event, path, props });
    // sendBeacon = fire and forget, never blocks rendering
    navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
  }, [path]);
}