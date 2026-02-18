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
    {},
  );
  const [comparison, setComparison] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [filteredNew, setFilteredNew] = useState<any[]>([]);
  const [filteredExisting, setFilteredExisting] = useState<any[]>([]);
  const perPage = 20;
  const hasNext = page * perPage < total;
  const hasPrev = page > 1;

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
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <Link href="/snapshots">
            <p className="px-3 py-2 rounded bg-gray-800 text-white">
              Voltar Snapshots
            </p>
          </Link>
          <div className="text-sm text-gray-600">
            Selecione dois snapshots para comparar
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 min-h-[400px]">
          {/* Left column: selector */}
          <div className="col-span-1 flex flex-col">
            <h3 className="font-semibold mb-3">Snapshots</h3>
            <div className="bg-white p-4 rounded shadow flex-1 overflow-auto max-h-[450px]">
              {snapshots.length === 0 ? (
                <div className="text-gray-400 text-sm text-center py-8">
                  Nenhum snapshot disponível
                </div>
              ) : (
                <SnapshotSelector
                  snapshots={snapshots}
                  onPick={onPick}
                  selected={selected}
                />
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-between mt-4">
              <button
                onClick={() => hasPrev && setPage((p) => p - 1)}
                disabled={!hasPrev}
                className={`px-3 py-1 border rounded ${
                  hasPrev
                    ? "bg-white cursor-pointer"
                    : "bg-gray-200 cursor-not-allowed"
                }`}
              >
                Prev
              </button>

              <div className="text-sm text-gray-600">Página {page}</div>

              <button
                onClick={() => hasNext && setPage((p) => p + 1)}
                disabled={!hasNext}
                className={`px-3 py-1 border rounded ${
                  hasNext
                    ? "bg-white cursor-pointer"
                    : "bg-gray-200 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </div>
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
            ) : comparison.empty ? (
              <div className="text-sm text-gray-500 text-center py-6">
                Nenhum snapshot ou produtos encontrados para esta loja
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  Left: {new Date(comparison.left.createdAt).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  Right: {new Date(comparison.right.createdAt).toLocaleString()}
                </div>

                <div className="w-full flex justify-between items-center bg-gray-50 p-2">
                  <span className="font-medium">Total:</span>
                  <span className="font-semibold">
                    {filteredNew.length + filteredExisting.length}
                  </span>
                </div>

                <div className="space-y-3">
                  <RenderProductList
                    title="New"
                    products={comparison.newProducts}
                    onFiltered={setFilteredNew}
                  />
                  <RenderProductList
                    title="Existing"
                    products={comparison.existingProducts}
                    onFiltered={setFilteredExisting}
                  />
                  <RenderProductList
                    title="Removed"
                    products={comparison.removedProducts}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
