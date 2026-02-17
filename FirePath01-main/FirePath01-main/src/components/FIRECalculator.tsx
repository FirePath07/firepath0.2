import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LearnModal } from './LearnModal';
import { formatIndianCurrency } from '../utils/currency';

export const FIRECalculator = () => {
  const { user } = useAuth();
  const [isLearnModalOpen, setIsLearnModalOpen] = useState(false);

  // 1. User Inputs (State) - Only what is needed for TARGETS
  const [monthlyExpenses, setMonthlyExpenses] = useState(user?.financialData.monthlyExpenses || 50000);
  const [currentAge, setCurrentAge] = useState(user?.financialData.age || 25);
  const [retirementAge, setRetirementAge] = useState(user?.financialData.targetRetirementAge || 55);
  const [inflationRate, setInflationRate] = useState(6);
  const [coastFireAge, setCoastFireAge] = useState(45);

  // Constants from user script
  const investmentReturn = 10; // 10% fixed for Coast FIRE calculation

  // 2. Calculations
  const annualExpensesToday = monthlyExpenses * 12;
  const yearsToRetirement = Math.max(0, retirementAge - currentAge);

  // Future Value of Expenses (Expense at Retirement)
  const expenseAtRetirement = annualExpensesToday * Math.pow(1 + (inflationRate / 100), yearsToRetirement);

  // FIRE Targets
  const standardFireTarget = expenseAtRetirement * 25;
  const leanFireTarget = standardFireTarget * 0.60;
  const fatFireTarget = expenseAtRetirement * 50;

  // Coast FIRE Calculation
  // Target needed at 'coastFireAge' to grow to 'standardFireTarget' by 'retirementAge'
  const yearsToGrowCoast = Math.max(0, retirementAge - coastFireAge);
  const coastFireTarget = standardFireTarget / Math.pow(1 + (investmentReturn / 100), yearsToGrowCoast);

  return (
    <>
      <LearnModal
        isOpen={isLearnModalOpen}
        onClose={() => setIsLearnModalOpen(false)}
        title="FIRE Definitions"
        content={
          <div className="space-y-4">
            <p><strong>Standard FIRE:</strong> 25x your annual expenses. Based on the 4% rule, this amount should last indefinitely.</p>
            <p><strong>Lean FIRE:</strong> A minimalist approach. Requires less capital (usually 60% of Standard) but implies a stricter budget.</p>
            <p><strong>Fat FIRE:</strong> A luxurious approach. 50x your annual expenses (200% of Standard) providing a large safety margin.</p>
            <p><strong>Coast FIRE:</strong> The amount you need invested *today* (or by a specific age) so that it grows to your Standard FIRE number by retirement without any further contributions.</p>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Input Controls */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Your Inputs</h2>
            <button onClick={() => setIsLearnModalOpen(true)} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline">Definitions</button>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Age</label>
                <input type="number" value={currentAge} onChange={(e) => setCurrentAge(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Retirement Age</label>
                <input type="number" value={retirementAge} onChange={(e) => setRetirementAge(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Expenses (Today)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input type="number" value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(Number(e.target.value))} className="w-full pl-8 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Annual: {formatIndianCurrency(annualExpensesToday)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inflation Rate (%)</label>
                <input type="number" value={inflationRate} onChange={(e) => setInflationRate(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
              </div>
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Coast FIRE Age
                  <div className="relative inline-block">
                    <span className="cursor-help text-gray-400">?</span>
                    <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-800 text-white text-xs rounded p-2 text-center z-10">
                      Age at which you stop contributing to investments.
                    </div>
                  </div>
                </label>
                <input type="number" value={coastFireAge} onChange={(e) => setCoastFireAge(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Inflation Projection</h4>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-500">Expense Today</p>
                  <p className="font-semibold text-gray-900">{formatIndianCurrency(annualExpensesToday)}</p>
                </div>
                <div className="text-gray-400 mb-1">➜</div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Expense at Age {retirementAge}</p>
                  <p className="font-bold text-purple-700">{formatIndianCurrency(expenseAtRetirement)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results - FIRE Variants */}
        <div className="grid grid-cols-1 gap-4">

          {/* Standard FIRE */}
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-emerald-500 transform transition hover:scale-[1.01]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Standard FIRE Target</p>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{formatIndianCurrency(standardFireTarget)}</h3>
                <p className="text-sm text-gray-500 mt-1">25x annual expenses at retirement</p>
              </div>
              <div className="text-3xl">🔥</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Lean FIRE */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <p className="text-xs font-bold text-gray-500 uppercase">Lean FIRE</p>
              <h3 className="text-xl font-bold text-gray-800 mt-1">{formatIndianCurrency(leanFireTarget)}</h3>
              <p className="text-xs text-gray-400 mt-1">60% of Standard</p>
            </div>

            {/* Fat FIRE */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <p className="text-xs font-bold text-amber-600 uppercase">Fat FIRE</p>
              <h3 className="text-xl font-bold text-gray-800 mt-1">{formatIndianCurrency(fatFireTarget)}</h3>
              <p className="text-xs text-gray-400 mt-1">200% of Standard</p>
            </div>
          </div>

          {/* Coast FIRE */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
              <span className="text-6xl">🌊</span>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-bold text-blue-800 uppercase tracking-widest">Coast FIRE Target</p>
                <div className="group/tooltip relative">
                  <span className="cursor-help text-blue-400">ⓘ</span>
                  <div className="invisible group-hover/tooltip:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded p-3 shadow-xl z-20">
                    This is the amount you need to have invested by age <strong>{coastFireAge}</strong>. If you reach this number, you can stop contributing completely, and your portfolio will still grow to hit your Standard FIRE number ({formatIndianCurrency(standardFireTarget)}) by age {retirementAge}, assuming {investmentReturn}% annual growth.
                  </div>
                </div>
              </div>

              <h3 className="text-3xl font-extrabold text-blue-900 mt-1">{formatIndianCurrency(coastFireTarget)}</h3>
              <p className="text-sm text-blue-700 mt-2">
                Need to save by age <strong>{coastFireAge}</strong>
              </p>
              <div className="mt-3 text-xs text-blue-600/80 bg-blue-100/50 p-2 rounded inline-block">
                Assumes {investmentReturn}% growth from age {coastFireAge} to {retirementAge}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
