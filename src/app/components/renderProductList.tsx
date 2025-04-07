"use client";
import {
  filterProductsByAmount,
  FilterType,
} from "@/lib/frontend/filterProductsByAmount";
import { formatDuration } from "../../lib/backend/utils";
import { ComparedProduct } from "../types/comparedTypes";
import { useState } from "react";
import { AmountFilter } from "./amountFilter";

export const renderProductList = (
  title: string,
  products: ComparedProduct[]
) => {
  const [filter, setFilter] = useState<FilterType>("all");
  const filteredProducts = filterProductsByAmount(products, filter);
  return (
    <div className="w-full bg-gray-100 p-4 rounded-lg">
      <h3 className="font-bold text-gray-700">
        {title} {filteredProducts.length}
      </h3>

      <AmountFilter filter={filter} setFilter={setFilter} />

      <div className="overflow-y-auto max-h-60">
        {filteredProducts.length > 0 ? (
          <ul className="space-y-2">
            {filteredProducts.map(({ name, code, amount, entryDate }) => (
              <li key={code} className="text-gray-600">
                {code} {name} {amount} {formatDuration(entryDate)}
              </li>
            ))}
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
