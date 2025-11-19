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
  const filteredProducts = useMemo(
    () => filterProductsByAmount(products, filter),
    [products, filter]
  );

  useEffect(() => {
    if (onFiltered) {
      onFiltered(filteredProducts);
    }
  }, [filteredProducts, onFiltered]);
  return (
    <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-gray-800">
          {title}{" "}
          <span className="text-sm text-gray-500 font-medium">
            ({filteredProducts.length})
          </span>
        </h3>

        <div className="ml-4">
          <AmountFilter filter={filter} setFilter={setFilter} />
        </div>
      </div>

      <div className="mt-3 overflow-y-auto max-h-60 space-y-2">
        {filteredProducts.length > 0 ? (
          <ul className="space-y-2">
            {filteredProducts.map(({ name, code, amount, entryDate }) => {
              const isNegative =
                typeof amount === "string" && amount.trim().startsWith("-");
              const isZero =
                typeof amount === "string" && amount.trim() === "0";

              return (
                <li
                  key={code}
                  className="flex items-center justify-between p-3 rounded-lg hover:shadow-sm hover:-translate-y-0.5 transition transform bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md flex items-center justify-center bg-gradient-to-br from-white to-gray-50 border border-gray-100">
                      <span className="text-xs font-mono text-gray-600">
                        {code}
                      </span>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDuration(entryDate)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isNegative
                          ? "bg-red-50 text-red-700 border border-red-100"
                          : isZero
                          ? "bg-yellow-50 text-yellow-700 border border-yellow-100"
                          : "bg-green-50 text-green-700 border border-green-100"
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
          <p className="text-gray-500">
            No {title.toLowerCase()} products found
          </p>
        )}
      </div>
    </div>
  );
};
