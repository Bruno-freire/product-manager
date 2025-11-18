// app/snapshots/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { SnapshotCard } from "@/app/components/SnapshotCard";
import { Pagination } from "@/app/components/Pagination";
import Link from "next/link";

export default function SnapshotsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [snapshots, setSnapshots] = useState<{ id: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPage = async (p = page) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/snapshots/list?page=${p}`);
      const data = await res.json();
      if (data.success) {
        setSnapshots(data.snapshots || []);
        setPage(data.page || p);
        setPerPage(data.perPage || 20);
        setTotal(data.total || 0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <main className="min-h-screen p-6 bg-gradient-to-r from-slate-100 to-slate-200">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Snapshots</h1>
          <p className="text-gray-600">Histórico de snapshots — seleciona dois para comparar.</p>
        </header>

        <div className="mb-4 flex justify-between items-center">
          <Link href="/">
            <p className="px-3 py-2 bg-gray-800 text-white rounded">Voltar Home</p>
          </Link>

          <Link href="/snapshots/compare">
            <p className="px-3 py-2 bg-blue-600 text-white rounded">Ir para Comparar</p>
          </Link>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="p-6 bg-white rounded shadow text-center">Carregando...</div>
          ) : snapshots.length === 0 ? (
            <div className="p-6 bg-white rounded shadow text-center">Nenhum snapshot encontrado</div>
          ) : (
            snapshots.map((s) => <SnapshotCard key={s.id} id={s.id} createdAt={s.createdAt} onSelect={() => {}} />)
          )}
        </div>

        <Pagination page={page} perPage={perPage} total={total} onChange={(p) => setPage(p)} />
      </div>
    </main>
  );
}
