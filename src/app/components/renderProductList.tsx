"use client";
import { formatDuration } from "../../lib/utils";
import { ComparedProduct } from "../types/comparedTypes";

export const renderProductList = (
  title: string,
  products: ComparedProduct[]
) => (
  <div className="w-full bg-gray-100 p-4 rounded-lg ">
    <h3 className="font-bold text-gray-700">{title} {products.length}</h3>
    <div className="overflow-y-auto max-h-60">
      {products.length > 0 ? (
        <ul className="space-y-2">
          {products.map(({ id, productName, code, amount, duration }) => (
            <li key={id} className="text-gray-600">
              {code} {productName} {amount} {formatDuration(duration)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No {title.toLowerCase()} products</p>
      )}
    </div>
  </div>
);
