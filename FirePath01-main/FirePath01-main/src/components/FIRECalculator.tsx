import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LearnModal } from './LearnModal';

export const FIRECalculator = () => {
  const { user } = useAuth();
  const [isLearnModalOpen, setIsLearnModalOpen] = useState(false);

  // Initialize state with user data or defaults
  const [monthlyExpenses, setMonthlyExpenses] = useState(user?.financialData.monthlyExpenses || 50000);
  const [currentSavings, setCurrentSavings] = useState(user?.financialData.currentSavings || 100000);
  const [monthlySavings, setMonthlySavings] = useState(user?.financialData.monthlyIncome - user?.financialData.monthlyExpenses || 20000);
  const [expectedReturn, setExpectedReturn] = useState(7); // Default 7%
  const [currentAge, setCurrentAge] = useState(user?.financialData.age || 30);

  const [chartData, setChartData] = useState<Array<{year: number; balance: number; fireGoal: number}>>([]);

  const fireNumber = monthlyExpenses * 12 * 25;

  useEffect(() => {
    const data: Array<{year: number; balance: number; fireGoal: number}> = [];
    let balance = currentSavings;
    const yearsToSimulate = 50;

    for (let year = 0; year <= yearsToSimulate; year++) {
      data.push({
        year: currentAge + year,
        balance: Math.round(balance),
        fireGoal: fireNumber
      });
      balance = (balance + (monthlySavings * 12)) * (1 + (expectedReturn / 100));
    }
    setChartData(data);
  }, [currentSavings, monthlySavings, fireNumber, expectedReturn, currentAge]);

  const yearsUntilFire = chartData.findIndex(d => d.balance >= fireNumber);
  const estimatedFireAge = yearsUntilFire >= 0 ? currentAge + yearsUntilFire : null;

  return (
    <>
      <LearnModal 
        isOpen={isLearnModalOpen} 
        onClose={() => setIsLearnModalOpen(false)}
        title="What is FIRE?"
        content="FIRE stands for 'Financial Independence, Retire Early'. It's a movement of people devoted to a program of extreme savings and investment that allows them to retire far earlier than traditional budgets and retirement plans would allow. The core idea is to save a large portion of your income, invest it wisely, and let the power of compound interest work for you."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Controls */}
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">FIRE Inputs</h2>
                <button onClick={() => setIsLearnModalOpen(true)} className="font-bold text-emerald-600 hover:underline">Learn</button>
            </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Expenses (₹)</label>
            <input type="number" value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded-lg"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Savings (₹)</label>
            <input type="number" value={currentSavings} onChange={(e) => setCurrentSavings(Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded-lg"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Savings (₹)</label>
            <input type="number" value={monthlySavings} onChange={(e) => setMonthlySavings(Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded-lg"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Annual Return (%)</label>
            <input type="number" value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded-lg"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Age</label>
            <input type="number" value={currentAge} onChange={(e) => setCurrentAge(Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded-lg"/>
          </div>
        </div>

        {/* Chart and Summary */}
        <div className="lg:col-span-2 space-y-8">
            <div>
                <h3 className="text-2xl font-bold text-center text-gray-800">Your FIRE Projection</h3>
                <div className="bg-white border border-gray-100 rounded-xl p-4 mt-4 h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" label={{ value: 'Age', position: 'insideBottomRight', offset: -5 }}/>
                        <YAxis tickFormatter={(value) => `₹${value/100000}L`} />
                        <Tooltip formatter={(value) => `₹${(value as number).toLocaleString()}`} labelFormatter={(label) => `Age ${label}`}/>
                        <Line type="monotone" dataKey="balance" stroke="#059669" strokeWidth={3} dot={false} name="Portfolio"/>
                        <Line type="monotone" dataKey="fireGoal" stroke="#d97706" strokeDasharray="5 5" strokeWidth={2} dot={false} name="FIRE Goal"/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <p className="text-sm text-amber-800 font-semibold uppercase">Your FIRE Number</p>
                    <p className="text-2xl font-bold text-amber-600">₹{fireNumber.toLocaleString()}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <p className="text-sm text-emerald-800 font-semibold uppercase">Estimated FIRE Age</p>
                    <p className="text-2xl font-bold text-emerald-600">{estimatedFireAge ? estimatedFireAge : 'Beyond 50 years'}</p>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};
