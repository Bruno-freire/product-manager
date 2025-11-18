// app/snapshots/[id]/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RenderProductList } from "@/app/components/renderProductList"; // path to your existing component (adjust)
import Link from "next/link";

export default function SnapshotDetailsPage() {
  const params = useParams() as { id: string };
  const id = params?.id;
  const [snapshot, setSnapshot] = useState<{ id: string; createdAt: string; products: any[] } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/snapshots/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setSnapshot(data.snapshot);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) return <div className="p-6">Snapshot id inválido</div>;

  return (
    <main className="min-h-screen p-6 bg-gradient-to-r from-slate-100 to-slate-200">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex justify-between">
          <Link href="/snapshots">
            <p className="px-3 py-2 bg-gray-800 text-white rounded">Voltar</p>
          </Link>
          <Link href="/snapshots/compare">
            <p className="px-3 py-2 bg-blue-600 text-white rounded">Comparar com outro</p>
          </Link>
        </div>

        {loading ? (
          <div className="p-6 bg-white rounded">Carregando...</div>
        ) : snapshot ? (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Snapshot — {new Date(snapshot.createdAt).toLocaleString()}</h2>
            <div className="grid grid-cols-1 gap-4">
              {/* Reaproveita RenderProductList: New, Existing (here all products are 'existing' since snapshot is a single list) */}
              <div className="w-full">
                <h3 className="font-bold text-gray-700 mb-2">Products ({snapshot.products.length})</h3>
                <div className="max-h-96 overflow-auto">
                  <ul className="space-y-2">
                    {snapshot.products.map((p: any) => (
                      <li key={p.code || JSON.stringify(p)} className="text-gray-600">
                        {p.code} {p.name} {p.amount} {p.entryDate ? new Date(p.entryDate).toLocaleString() : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-white rounded">Snapshot não encontrado</div>
        )}
      </div>
    </main>
  );
}
