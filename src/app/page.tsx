"use client";

import { useState, useEffect } from "react";
import { ComparedProduct } from "./types/comparedTypes";
import { RenderProductList } from "./components/renderProductList";
import { PeriodSelector } from "./components/PeriodSelector";

export default function Home() {
  const [productList, setProductList] = useState("");
  const [newProducts, setNewProducts] = useState<ComparedProduct[]>([]);
  const [existingProducts, setExistingProducts] = useState<ComparedProduct[]>([]);
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
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-400 to-blue-600 p-6 relative">
      
      {/* MODAL DE CONFIRMAÇÃO */}
      {confirmRollbackOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm animate-fade-in">
            <h3 className="text-xl font-bold text-gray-800 text-center mb-4">
              Confirmar Rollback?
            </h3>

            <p className="text-gray-700 text-center mb-6">
              Isso irá restaurar o estado anterior da lista de produtos.
            </p>

            <div className="flex justify-between gap-3">
              <button
                onClick={() => setConfirmRollbackOpen(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  rollback();
                  setConfirmRollbackOpen(false);
                }}
                className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <article className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-8 max-w-2xl w-full">
        <header>
          <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">
            Product Manager
          </h1>
        </header>

        <form>
          <fieldset className="flex items-center justify-center mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={dailyMode}
                onChange={(e) => setDailyMode(e.target.checked)}
                className="h-5 w-5"
              />
              <span className="text-gray-800 font-medium">
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
              <div className="flex w-full justify-center mb-2 ">
                <button
                  type="button"
                  onClick={() => setProductList("")}
                  className="w-1/2 py-3 cursor-pointer text-white font-semibold rounded-lg bg-green-500 hover:bg-green-600 active:scale-95 transition-all"
                >
                  Clear
                </button>
              </div>

              <textarea
                className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Cole a lista atualizada de produtos..."
                value={productList}
                onChange={(e) => setProductList(e.target.value)}
              />
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={updateList}
              disabled={isProcessing}
              className={`flex-1 py-3 text-white font-semibold rounded-lg transition-colors ${
                isProcessing
                  ? "bg-gray-500 cursor-wait"
                  : "bg-green-500 hover:bg-green-600 cursor-pointer"
              }`}
            >
              {isProcessing ? "Carregando..." : "Update List"}
            </button>

            {/* Botão que abre o modal */}
            <button
              type="button"
              onClick={() => previousState && setConfirmRollbackOpen(true)}
              disabled={!previousState}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                previousState
                  ? "bg-yellow-500 hover:bg-yellow-600 cursor-pointer"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Rollback
            </button>
          </div>
        </form>

        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
      </article>

      <section
        className="mt-8 w-full max-w-2xl mx-auto"
        aria-labelledby="comparison-heading"
      >
        <h2
          id="comparison-heading"
          className="text-2xl font-semibold text-gray-800 mb-6 text-center"
        >
          Product Comparison
        </h2>

        <div className="flex flex-col space-y-6 p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-gray-700 font-medium">Total Products:</p>
            <span className="text-gray-900 font-semibold">
              {newProducts.length + existingProducts.length}
            </span>
          </div>

          {RenderProductList("New", newProducts)}
          {RenderProductList("Existing", existingProducts)}
          {RenderProductList("Removed", removedProducts)}
        </div>
      </section>
    </main>
  );
}
