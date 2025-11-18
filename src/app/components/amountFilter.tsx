"use client";

import { FilterType } from "@/lib/frontend/filterProductsByAmount";

interface AmountFilterProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
}

export const AmountFilter = ({ filter, setFilter }: AmountFilterProps) => {
  const filters: { label: string; value: FilterType }[] = [
    { label: "Todos", value: "all" },
    { label: "Positivos", value: "greater" },
    { label: "Zerados", value: "equal" },
    { label: "Negativos", value: "less" },
  ];

  return (
    <div className="flex gap-2 mb-3" role="tablist" aria-label="Filtro de quantidade">
      {filters.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => setFilter(value)}
          aria-pressed={filter === value}
          className={`px-3 py-1 rounded-full cursor-pointer transition duration-150 transform ${
            filter === value
              ? "bg-blue-600 text-white shadow-md scale-100"
              : "bg-white text-gray-700 border border-gray-200 hover:shadow-sm hover:-translate-y-0.5"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
