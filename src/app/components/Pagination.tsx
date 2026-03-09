// app/components/Pagination.tsx
import Link from "next/link";

export function Pagination({ page, totalPages, basePath }: { page: number; totalPages: number; basePath: string }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6 text-sm">
      {page > 1 ? (
        <Link href={`${basePath}?page=${page - 1}`} className="text-orange-500 hover:underline">← Previous</Link>
      ) : <span />}
      <span className="text-muted">Page {page} of {totalPages}</span>
      {page < totalPages ? (
        <Link href={`${basePath}?page=${page + 1}`} className="text-orange-500 hover:underline">Next →</Link>
      ) : <span />}
    </div>
  );
}