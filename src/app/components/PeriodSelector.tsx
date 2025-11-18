"use client";

interface PeriodSelectorProps {
  day1: string;
  day2: string;
  setDay1: (value: string) => void;
  setDay2: (value: string) => void;
}

export const PeriodSelector = ({ day1, day2, setDay1, setDay2 }: PeriodSelectorProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <label className="flex-1">
        <span className="text-sm text-gray-600 mb-1 block">Data anterior</span>
        <div className="relative">
          <input
            type="date"
            value={day1}
            onChange={(e) => setDay1(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          />
          <span className="absolute right-3 top-3 text-gray-400 text-sm">📅</span>
        </div>
      </label>

      <label className="flex-1">
        <span className="text-sm text-gray-600 mb-1 block">Data atual</span>
        <div className="relative">
          <input
            type="date"
            value={day2}
            onChange={(e) => setDay2(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          />
          <span className="absolute right-3 top-3 text-gray-400 text-sm">📅</span>
        </div>
      </label>
    </div>
  );
};
