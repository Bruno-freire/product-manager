"use client";
import { formatDuration } from "../../lib/utils";
import { ComparedProduct } from "../types/comparedTypes";

export const renderProductList = (
  title: string,
  products: ComparedProduct[]
) => (
  <div className="bg-gray-100 p-4 rounded-lg w-1/3 ">
    <h3 className="font-bold text-gray-700">{title}</h3>
    <div className="overflow-y-auto max-h-60">
      {products.length > 0 ? (
        <ul className="space-y-2">
          {products.map(({ id, productName, code, duration }) => (
            <li key={id} className="text-gray-600">
              {productName} (Code: {code}) – {formatDuration(duration)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No {title.toLowerCase()} products</p>
      )}
    </div>
  </div>
);
