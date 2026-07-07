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
    <div 
      className="flex flex-wrap items-center gap-2 w-full sm:w-auto" 
      role="tablist" 
      aria-label="Filtro de quantidade"
    >
      {filters.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => setFilter(value)}
          aria-pressed={filter === value}
          className={`flex-1 sm:flex-none px-3 py-2 sm:py-1.5 text-xs sm:text-sm font-medium rounded-full cursor-pointer transition-all duration-200 ${
            filter === value
              ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-1"
              : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};