// app/components/SnapshotSelector.tsx
"use client";
import React from "react";
import { SnapshotCard } from "@/app/components/SnapshotCard";

export function SnapshotSelector({
  snapshots,
  onPick,
  selected,
}: {
  snapshots: { id: string; createdAt: string }[];
  onPick: (id: string, side: "left" | "right") => void;
  selected: { left?: string; right?: string };
}) {
  return (
    <div className="space-y-2">
      {snapshots.map((s) => (
        <div key={s.id} className="flex items-center gap-3">
          <div className="flex-1">
            <div className="p-3 border rounded-lg bg-white flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">{new Date(s.createdAt).toLocaleString()}</div>
                <div className="text-xs text-gray-400">id: {s.id}</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPick(s.id, "left")}
                  className={`text-sm px-3 py-1 rounded ${selected.left === s.id ? "bg-yellow-500 text-white" : "bg-white border"}`}
                >
                  Left
                </button>

                <button
                  onClick={() => onPick(s.id, "right")}
                  className={`text-sm px-3 py-1 rounded ${selected.right === s.id ? "bg-yellow-500 text-white" : "bg-white border"}`}
                >
                  Right
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
