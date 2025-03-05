"use client";

import { useState, useEffect } from "react";
import { ComparedProduct } from "./types/comparedTypes";
import { renderProductList } from "./components/renderProductList";

export default function Home() {
  const [productList, setProductList] = useState("");
  const [newProducts, setNewProducts] = useState<ComparedProduct[]>([]);
  const [existingProducts, setExistingProducts] = useState<ComparedProduct[]>([]);
  const [removedProducts, setRemovedProducts] = useState<ComparedProduct[]>([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Função para buscar produtos existentes
  const fetchExistingProducts = async () => {
    try {
      const response = await fetch("/api/products/existing", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.success) {
        setExistingProducts(data.existingProducts || []);
      } else {
        setError(data.error || "Error loading existing products");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Carrega produtos existentes quando o componente monta
  useEffect(() => {
    fetchExistingProducts();
  }, []);

  const updateList = async () => {
    setIsProcessing(true);
    setError("");
    try {
      if (productList.trim().length === 0) {
        setNewProducts([]);
        setRemovedProducts([]);
        await fetchExistingProducts();
        return;
      } else {
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
          setError(data.error || "Unknown error");
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-400 to-blue-600 p-6">
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">
          Product Manager
        </h1>

        <textarea
          className="w-full h-40 p-4 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="Paste the updated product list..."
          value={productList}
          onChange={(e) => setProductList(e.target.value)}
        />

        <button
          onClick={updateList}
          disabled={isProcessing}
          className={`w-full py-3 text-white font-semibold rounded-lg transition-colors ${
            isProcessing
              ? "bg-gray-500 cursor-wait"
              : "bg-green-500 hover:bg-green-600 cursor-pointer"
          }`}
        >
          {isProcessing ? "Carregando..." : "Update List"}
        </button>

        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
      </div>

      <section className="mt-8 w-full max-w-2xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Product Comparison
        </h2>
        <div className="flex flex-col space-y-6">
          {renderProductList("New", newProducts)}
          {renderProductList("Existing", existingProducts)}
          {renderProductList("Removed", removedProducts)}
        </div>
      </section>
    </main>
  );
}
