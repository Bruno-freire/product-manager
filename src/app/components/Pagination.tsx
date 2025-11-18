// app/components/Pagination.tsx
"use client";
import React from "react";

export function Pagination({
  page,
  perPage,
  total,
  onChange,
}: {
  page: number;
  perPage: number;
  total: number;
  onChange: (p: number) => void;
}) {
  const last = Math.max(1, Math.ceil(total / perPage));
  const prev = () => onChange(Math.max(1, page - 1));
  const next = () => onChange(Math.min(last, page + 1));

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-gray-600">
        Página {page} de {last} — {total} snapshots
      </div>

      <div className="space-x-2">
        <button onClick={prev} disabled={page === 1} className={`px-3 py-1 rounded ${page === 1 ? "bg-gray-200 text-gray-400" : "bg-white border"}`}>
          Prev
        </button>
        <button onClick={next} disabled={page === last} className={`px-3 py-1 rounded ${page === last ? "bg-gray-200 text-gray-400" : "bg-white border"}`}>
          Next
        </button>
      </div>
    </div>
  );
} 