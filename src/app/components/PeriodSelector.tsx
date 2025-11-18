
interface PeriodSelectorProps {
  day1: string;
  day2: string;
  setDay1: (value: string) => void;
  setDay2: (value: string) => void;
}

export const PeriodSelector = ({day1, day2, setDay1, setDay2}: PeriodSelectorProps) => {
  return (
    <div className="flex flex-col space-y-4 mb-4">
              <label>
                <span className="sr-only">Data do dia anterior</span>
                <input
                  type="date"
                  value={day1}
                  onChange={(e) => setDay1(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </label>
              <label>
                <span className="sr-only">Data do dia atual</span>
                <input
                  type="date"
                  value={day2}
                  onChange={(e) => setDay2(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </label>
            </div>
  );
} 