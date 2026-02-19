"use client";

import { useState, useEffect } from "react";
import { ComparedProduct } from "./types/comparedTypes";
import { RenderProductList } from "./components/renderProductList";
import { PeriodSelector } from "./components/PeriodSelector";
import Link from "next/link";
import { getLoggedUser, LoggedUser } from "@/lib/getUser";
import { useRouter } from "next/navigation";

export default function Home() {
  const [productList, setProductList] = useState("");
  const [newProducts, setNewProducts] = useState<ComparedProduct[]>([]);
  const [existingProducts, setExistingProducts] = useState<ComparedProduct[]>(
    [],
  );
  const [removedProducts, setRemovedProducts] = useState<ComparedProduct[]>([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [filteredNew, setFilteredNew] = useState<ComparedProduct[]>([]);
  const [filteredExisting, setFilteredExisting] = useState<ComparedProduct[]>(
    [],
  );
  const [filteredRemoved, setFilteredRemoved] = useState<ComparedProduct[]>([]);

  const [previousState, setPreviousState] = useState<{
    newProducts: ComparedProduct[];
    existingProducts: ComparedProduct[];
    removedProducts: ComparedProduct[];
  } | null>(null);

  const [confirmRollbackOpen, setConfirmRollbackOpen] = useState(false);
  const [dailyMode, setDailyMode] = useState(false);
  const [day1, setDay1] = useState("");
  const [day2, setDay2] = useState("");

  const router = useRouter();

  // Logout
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  };

  // Salvar estado atual para rollback
  const saveCurrentState = () => {
    setPreviousState({
      newProducts: [...newProducts],
      existingProducts: [...existingProducts],
      removedProducts: [...removedProducts],
    });
  };

  // Restaurar estado anterior
  const rollback = () => {
    if (!previousState) return;
    setNewProducts(previousState.newProducts);
    setExistingProducts(previousState.existingProducts);
    setRemovedProducts(previousState.removedProducts);
    setPreviousState(null);
  };

  // Buscar produtos existentes
  const fetchExistingProducts = async (store: string) => {
    try {
      const response = await fetch(`/api/products/existing?store=${store}`);
      const data = await response.json();

      if (data.success) {
        saveCurrentState();
        setExistingProducts(data.existingProducts || []);
        setNewProducts(data.newProducts || []);
        setRemovedProducts(data.removedProducts || []);
      } else {
        setError(data.error || "Erro ao carregar produtos existentes");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Início do componente: verificar login
  useEffect(() => {
    const init = async () => {
      const user: LoggedUser | null = await getLoggedUser();
      if (!user) {
        router.push("/login");
        return;
      }
      console.log("👤 Usuário logado:", user);
      console.log("🔍 Carregando produtos existentes para a store:", user.store);
      await fetchExistingProducts(user.store);
    };
    init();
  }, [router]);

  // Atualizar lista de produtos
  const updateList = async () => {
    setIsProcessing(true);
    setError("");

    try {
      const user: LoggedUser | null = await getLoggedUser();
      if (!user) {
        router.push("/login");
        return;
      }

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
          body: JSON.stringify({ day1, day2, store: user.store }),
        });

        const data = await response.json();
        if (data.success) {
          setNewProducts(data.newProducts || []);
          setExistingProducts(data.maintainedProducts || []);
          setRemovedProducts(data.removedProducts || []);
        } else {
          setError(data.error || "Erro desconhecido");
        }
      } else {
        if (productList.trim().length === 0) {
          setNewProducts([]);
          setRemovedProducts([]);
          await fetchExistingProducts(user.store);
          return;
        }

        const response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ store: user.store, productList }),
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
      {/* Modal rollback */}
      {confirmRollbackOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
              Confirmar Rollback?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Isso irá restaurar o estado anterior da lista de produtos.
            </p>
            <div className="flex justify-between gap-3">
              <button
                onClick={() => setConfirmRollbackOpen(false)}
                className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  rollback();
                  setConfirmRollbackOpen(false);
                }}
                className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header e Logout */}
      <article className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 border border-gray-100 relative">
        <header className="mb-4 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900">
            Product Manager
          </h1>
          <p className="text-sm text-slate-600">
            Cole a lista ou use comparações diárias
          </p>
        </header>

        <div className="flex justify-center mb-4">
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 cursor-pointer bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg shadow transition-colors duration-200"
          >
            Logout
          </button>
        </div>

        <form>
          <fieldset className="flex items-center justify-center mb-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={dailyMode}
                onChange={(e) => setDailyMode(e.target.checked)}
                className="h-5 w-5 accent-blue-600"
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
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setProductList("")}
                className="w-full cursor-pointer py-3 mb-3 text-white bg-green-600 hover:bg-green-700 rounded-lg"
              >
                Clean
              </button>
              <textarea
                className="w-full h-44 p-4 border border-gray-200 rounded-lg"
                placeholder="Cole a lista atualizada de produtos..."
                value={productList}
                onChange={(e) => setProductList(e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <Link
              href="/snapshots"
              className="flex-1 py-3 text-center bg-indigo-600 text-white rounded-lg"
            >
              Ver Snapshots
            </Link>
            <Link
              href="/snapshots/compare"
              className="flex-1 py-3 text-center bg-blue-600 text-white rounded-lg"
            >
              Comparar com Snapshot
            </Link>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={updateList}
              disabled={isProcessing}
              className={`flex-1 py-3 cursor-pointer text-white rounded-lg ${
                isProcessing ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isProcessing ? "Carregando..." : "Update List"}
            </button>
            <button
              type="button"
              onClick={() => previousState && setConfirmRollbackOpen(true)}
              disabled={!previousState}
              className={`flex-1 py-3 rounded-lg text-white ${
                previousState
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-gray-300"
              }`}
            >
              Rollback
            </button>
          </div>
        </form>

        {error && (
          <p className="mt-4 text-red-600 text-center font-medium">{error}</p>
        )}
      </article>

      {/* Seção de comparação */}
      <section className="mt-8 w-full max-w-3xl">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6 text-center">
          Product Comparison
        </h2>
        <div className="flex flex-col space-y-6 p-6 rounded-2xl shadow-sm border border-gray-100 bg-white">
          <div className="flex justify-between bg-gray-50 p-4 rounded-lg">
            <p>Total Products:</p>
            <span>
              {filteredNew.length +
                filteredExisting.length}
            </span>
          </div>

          <RenderProductList
            title="New"
            products={newProducts}
            onFiltered={setFilteredNew}
          />
          <RenderProductList
            title="Existing"
            products={existingProducts}
            onFiltered={setFilteredExisting}
          />
          <RenderProductList
            title="Removed"
            products={removedProducts}
            onFiltered={setFilteredRemoved}
          />
        </div>
      </section>
    </main>
  );
}
