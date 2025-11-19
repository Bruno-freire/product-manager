// app/components/SnapshotCard.tsx
"use client";
import Link from "next/link";
import React from "react";

export function SnapshotCard({ id, createdAt, onSelect }: { id: string; createdAt: string; onSelect?: (id: string) => void; }) {
  const date = new Date(createdAt);
  const label = date.toLocaleString(); // date + time with minutes

  return (
    <div className="p-3 border rounded-lg bg-white flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-600">{label}</div>
        <div className="text-xs text-gray-400">id: {id}</div>
      </div>

      <div className="flex items-center gap-2">
        <Link href={`/snapshots/${id}`}>
          <p className="text-sm px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded">Ver</p>
        </Link>

        <button onClick={() => onSelect?.(id)} className="text-sm px-3 py-1 cursor-pointer bg-green-500 hover:bg-green-600 text-white rounded">
          Selecionar
        </button>
      </div>
    </div>
  );
}
