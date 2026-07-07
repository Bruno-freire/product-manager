"use client";

import {
  filterProductsByAmount,
  FilterType,
} from "@/lib/frontend/filterProductsByAmount";
import { formatDuration } from "../../lib/backend/utils";
import { ComparedProduct } from "../types/comparedTypes";
import { useEffect, useMemo, useState } from "react";
import { AmountFilter } from "./amountFilter";

interface RenderProductListProps {
  title: string;
  products: ComparedProduct[];
  onFiltered?: (filtered: ComparedProduct[]) => void;
}

export const RenderProductList = ({
  title,
  products,
  onFiltered,
}: RenderProductListProps) => {
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const amountFilteredProducts = useMemo(
    () => filterProductsByAmount(products, filter),
    [products, filter],
  );

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return amountFilteredProducts;
    }

    return amountFilteredProducts.filter((product) => {
      return (
        product.name.toLowerCase().includes(term) ||
        String(product.code).toLowerCase().includes(term)
      );
    });
  }, [amountFilteredProducts, search]);

  useEffect(() => {
    if (onFiltered) {
      onFiltered(filteredProducts);
    }
  }, [filteredProducts, onFiltered]);

  return (
    <div className="w-full bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-200">
      {/* Header Responsivo */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-lg">
          {title}
          <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-medium border border-gray-200">
            {filteredProducts.length}
          </span>
        </h3>

        {/* Controles de Busca e Filtro */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or code..."
            className="w-full sm:w-64 lg:w-72 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
          />
          <AmountFilter filter={filter} setFilter={setFilter} />
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="overflow-y-auto max-h-[60vh] md:max-h-[280px] space-y-2 pr-1">
        {filteredProducts.length > 0 ? (
          <ul className="space-y-2.5">
            {filteredProducts.map(({ name, code, amount, entryDate }) => {
              const isNegative =
                typeof amount === "string" && amount.trim().startsWith("-");
              const isZero =
                typeof amount === "string" && amount.trim() === "0";

              return (
                <li
                  key={code}
                  className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-gray-50/50 hover:bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-11 h-11 flex-shrink-0 rounded-lg flex items-center justify-center bg-white shadow-sm border border-gray-200">
                      <span className="text-xs font-mono text-gray-600 font-semibold">
                        {code}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div
                        className="text-sm sm:text-base font-semibold text-gray-800 truncate"
                        title={name}
                      >
                        {name}
                      </div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {formatDuration(entryDate)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center flex-shrink-0">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap shadow-sm ${
                        isNegative
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : isZero
                            ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                            : "bg-green-50 text-green-700 border border-green-200"
                      }`}
                    >
                      {amount}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-gray-600 font-medium">
              No {title.toLowerCase()} products found
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};