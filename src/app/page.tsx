"use client";

import { useState, useEffect } from "react";
import { ComparedProduct } from "./types/comparedTypes";
import { RenderProductList } from "./components/renderProductList";
import { PeriodSelector } from "./components/PeriodSelector";
import Link from "next/link";

export default function Home() {
  const [productList, setProductList] = useState("");
  const [newProducts, setNewProducts] = useState<ComparedProduct[]>([]);
  const [existingProducts, setExistingProducts] = useState<ComparedProduct[]>(
    []
  );
  const [removedProducts, setRemovedProducts] = useState<ComparedProduct[]>([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Estado de rollback
  const [previousState, setPreviousState] = useState<{
    newProducts: ComparedProduct[];
    existingProducts: ComparedProduct[];
    removedProducts: ComparedProduct[];
  } | null>(null);

  // Modal de confirmação
  const [confirmRollbackOpen, setConfirmRollbackOpen] = useState(false);

  // Modo diário
  const [dailyMode, setDailyMode] = useState(false);
  const [day1, setDay1] = useState("");
  const [day2, setDay2] = useState("");

  // Salva o estado atual para rollback
  const saveCurrentState = () => {
    setPreviousState({
      newProducts: [...newProducts],
      existingProducts: [...existingProducts],
      removedProducts: [...removedProducts],
    });
  };

  // Rollback (Undo)
  const rollback = () => {
    if (!previousState) return;

    setNewProducts(previousState.newProducts);
    setExistingProducts(previousState.existingProducts);
    setRemovedProducts(previousState.removedProducts);
    setPreviousState(null);
  };

  // Busca padrão
  const fetchExistingProducts = async () => {
    try {
      const response = await fetch("/api/products/existing", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      await fetch("/api/products/history", { method: "GET" });

      const data = await response.json();
      if (data.success) {
        saveCurrentState();
        setExistingProducts(data.existingProducts || []);
        setNewProducts(data.newProducts || []);
        setRemovedProducts(data.removedProducts || []);
      } else {
        setError(data.error || "Error loading existing products");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchExistingProducts();
  }, []);

  const updateList = async () => {
    setIsProcessing(true);
    setError("");

    try {
      saveCurrentState();

      if (dailyMode) {
        if (!day1 || !day2) {
          setError("Por favor, selecione as duas datas.");
          setIsProcessing(false);
          return;
        }

        const response = await fetch("/api/products/daily", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ day1, day2 }),
        });

        const data = await response.json();

        if (data.success) {
          setNewProducts(data.newProducts || []);
          setExistingProducts(data.existingProducts || []);
          setRemovedProducts(data.removedProducts || []);
        } else {
          setError(data.error || "Erro desconhecido");
        }
      } else {
        if (productList.trim().length === 0) {
          setNewProducts([]);
          setRemovedProducts([]);
          await fetchExistingProducts();
          return;
        }

        const response = await fetch("/api/products/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productList }),
        });

        const data = await response.json();

        if (data.success) {
          setNewProducts(data.newProducts || []);
          setExistingProducts(data.existingProducts || []);
          setRemovedProducts(data.removedProducts || []);
        } else {
          setError(data.error || "Erro desconhecido");
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-8">
      {/* MODAL DE CONFIRMAÇÃO */}
      {confirmRollbackOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-200 scale-100">
            <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
              Confirmar Rollback?
            </h3>

            <p className="text-gray-600 text-center mb-6">
              Isso irá restaurar o estado anterior da lista de produtos.
            </p>

            <div className="flex justify-between gap-3">
              <button
                onClick={() => setConfirmRollbackOpen(false)}
                className="flex-1 cursor-pointer py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  rollback();
                  setConfirmRollbackOpen(false);
                }}
                className="flex-1 cursor-pointer py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold shadow-md transition"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <article className="w-full max-w-3xl bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-100">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-1">
            Product Manager
          </h1>
          <p className="text-sm text-slate-600">
            Cole a lista ou use comparações diárias — visual moderno e interativo.
          </p>
        </header>

        <form>
          <fieldset className="flex items-center justify-center mb-4">
            <label className="flex items-center space-x-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dailyMode}
                onChange={(e) => setDailyMode(e.target.checked)}
                className="h-5 w-5 rounded accent-blue-600"
              />
              <span className="text-slate-800 font-medium">
                Habilitar comparação diária
              </span>
            </label>
          </fieldset>

          {dailyMode ? (
            <PeriodSelector
              day1={day1}
              day2={day2}
              setDay1={setDay1}
              setDay2={setDay2}
            />
          ) : (
            <div className="w-full block mb-4">
              <div className="flex w-full justify-center mb-3">
                <button
                  type="button"
                  onClick={() => setProductList("")}
                  className="w-1/2 py-3 cursor-pointer text-white font-semibold rounded-lg bg-green-600 hover:bg-green-700 active:scale-95 transition-transform shadow"
                >
                  Clean
                </button>
              </div>

              <textarea
                className="w-full h-44 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-shadow shadow-sm"
                placeholder="Cole a lista atualizada de produtos..."
                value={productList}
                onChange={(e) => setProductList(e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <Link
              href="/snapshots"
              className="flex-1 py-3 text-center bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-shadow shadow"
            >
              Ver Snapshots
            </Link>

            <Link
              href="/snapshots/compare"
              className="flex-1 py-3 text-center bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-shadow shadow"
            >
              Comparar com Snapshot
            </Link>
          </div>

          <div className="flex space-x-3 mt-4">
            <button
              type="button"
              onClick={updateList}
              disabled={isProcessing}
              className={`flex-1 py-3 cursor-pointer text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                isProcessing
                  ? "bg-gray-400 cursor-wait"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isProcessing ? (
                <>
                  <svg
                    className="w-5 h-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Carregando...
                </>
              ) : (
                "Update List"
              )}
            </button>

            {/* Botão que abre o modal */}
            <button
              type="button"
              onClick={() => previousState && setConfirmRollbackOpen(true)}
              disabled={!previousState}
              className={`flex-1 py-3 rounded-lg font-semibold text-white cursor-pointer transition-all flex items-center justify-center gap-2 ${
                previousState
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-gray-300 "
              }`}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M12 5v7l5 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Rollback
            </button>
          </div>
        </form>

        {error && (
          <p className="mt-4 text-red-600 text-center font-medium">{error}</p>
        )}
      </article>

      <section
        className="mt-8 w-full max-w-3xl mx-auto"
        aria-labelledby="comparison-heading"
      >
        <h2
          id="comparison-heading"
          className="text-2xl font-semibold text-slate-800 mb-6 text-center"
        >
          Product Comparison
        </h2>

        <div className="flex flex-col space-y-6 p-6 rounded-2xl shadow-sm border border-gray-100 bg-white">
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="text-gray-700 font-medium">Total Products:</p>
            <span className="text-gray-900 font-semibold">
              {newProducts.length + existingProducts.length}
            </span>
          </div>

          {/* keep using your renderer exactly the same way */}
          {RenderProductList("New", newProducts)}
          {RenderProductList("Existing", existingProducts)}
          {RenderProductList("Removed", removedProducts)}
        </div>
      </section>
    </main>
  );
}
