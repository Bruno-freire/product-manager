// app/snapshots/compare/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { SnapshotSelector } from "@/app/components/SnapshotSelector";
import { RenderProductList } from "@/app/components/renderProductList";
import Link from "next/link";

export default function SnapshotsComparePage() {
  const [page, setPage] = useState(1);
  const [snapshots, setSnapshots] = useState<
    { id: string; createdAt: string }[]
  >([]);
  const [selected, setSelected] = useState<{ left?: string; right?: string }>(
    {}
  );
  const [comparison, setComparison] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchList = async (p = page) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/snapshots/list?page=${p}`);
      const data = await res.json();
      if (data.success) {
        setSnapshots(data.snapshots || []);
        setTotal(data.total || 0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const onPick = (id: string, side: "left" | "right") => {
    setSelected((s) => ({ ...s, [side]: id }));
  };

  const doCompare = async () => {
    if (!selected.left || !selected.right)
      return alert("Selecione ambos os snapshots (left e right)");
    setLoading(true);
    try {
      const res = await fetch("/api/snapshots/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leftId: selected.left,
          rightId: selected.right,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setComparison(data);
      } else {
        alert(data.error || "Erro na comparação");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 bg-gradient-to-r from-slate-100 to-slate-200">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Link href="/snapshots">
            <p className="px-3 py-2 rounded bg-gray-800 text-white">
              Voltar Snapshots
            </p>
          </Link>

          <div className="text-sm text-gray-600">
            Selecione dois snapshots para comparar
          </div>
        </div>

        <div className="grid grid-cols-[1fr_2fr] gap-4 min-h-[400px]">
          {/* Left column: selector */}
          <div className="col-span-1 bg-white p-4 rounded shadow max-h-[60vh] overflow-auto">
            <h3 className="font-semibold mb-3">Left</h3>
            <SnapshotSelector
              snapshots={snapshots}
              onPick={onPick}
              selected={selected}
            />
          </div>

          {/* Center column: result */}
          <div className="col-span-1 bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-3">Resultado</h3>
            <div className="flex gap-2 mb-3">
              <button
                onClick={doCompare}
                className="px-3 py-2 cursor-pointer bg-green-600 text-white rounded"
              >
                Comparar
              </button>
              <button
                onClick={() => {
                  setSelected({});
                  setComparison(null);
                }}
                className="px-3 py-2 cursor-pointer bg-gray-200 rounded"
              >
                Limpar
              </button>
            </div>

            {loading && <div>Carregando...</div>}

            {!comparison ? (
              <div className="text-sm text-gray-500">
                Aqui aparecerá o resultado da comparação
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  Left: {new Date(comparison.left.createdAt).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  Right: {new Date(comparison.right.createdAt).toLocaleString()}
                </div>

                <div className="space-y-3">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">
                        New ({comparison.newProducts.length})
                      </h4>
                      <RenderProductList
                        title="New"
                        products={comparison.newProducts}
                      />
                    </div>

                    <div>
                      <h4 className="font-medium">
                        Existing ({comparison.existingProducts.length})
                      </h4>
                      <RenderProductList
                        title="New"
                        products={comparison.existingProducts}
                      />
                    </div>

                    <div>
                      <h4 className="font-medium">
                        Removed ({comparison.removedProducts.length})
                      </h4>
                      <RenderProductList
                        title="New"
                        products={comparison.removedProducts}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <div className="text-sm text-gray-600">Página {page}</div>
          <div className="space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 bg-white border rounded"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 bg-white border rounded"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
