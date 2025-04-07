"use client";

import { FilterType } from "@/lib/frontend/filterProductsByAmount";

interface AmountFilterProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
}

export const AmountFilter = ({ filter, setFilter }: AmountFilterProps) => {
  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "> 0", value: "greater" },
    { label: "= 0", value: "equal" },
    { label: "< 0", value: "less" },
  ];

  return (
    <div className="flex gap-2 mb-2">
      {filters.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => setFilter(value)}
          className={`px-2 py-1 rounded cursor-pointer transition ${
            filter === value ? "bg-blue-500 text-white" : "bg-white text-gray-700 border border-gray-300"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
