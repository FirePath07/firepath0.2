import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LearnModal } from './LearnModal';

export const SIPCalculator = () => {
  const [isLearnModalOpen, setIsLearnModalOpen] = useState(false);
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [duration, setDuration] = useState(10); // in years

  const [chartData, setChartData] = useState<Array<{year: number; totalInvestment: number; totalValue: number}>>([]);

  useEffect(() => {
    const data: Array<{year: number; totalInvestment: number; totalValue: number}> = [];
    let totalValue = 0;
    const monthlyReturnRate = expectedReturn / 12 / 100;

    for (let year = 1; year <= duration; year++) {
      for (let month = 1; month <= 12; month++) {
        totalValue = (totalValue + monthlyInvestment) * (1 + monthlyReturnRate);
      }
      data.push({
        year: year,
        totalInvestment: monthlyInvestment * 12 * year,
        totalValue: Math.round(totalValue),
      });
    }
    setChartData(data);
  }, [monthlyInvestment, expectedReturn, duration]);

  const totalInvestment = monthlyInvestment * 12 * duration;
  const totalValue = chartData.length > 0 ? chartData[chartData.length - 1].totalValue : 0;
  const wealthGained = totalValue - totalInvestment;

  return (
    <>
        <LearnModal 
            isOpen={isLearnModalOpen} 
            onClose={() => setIsLearnModalOpen(false)}
            title="What is a SIP?"
            content="A Systematic Investment Plan (SIP) is a way to invest a fixed amount of money in mutual funds at regular intervals (usually monthly). It's a disciplined approach to investing that helps you average out the cost of your investment over time and benefit from the power of compounding. By investing regularly, you buy more units when the market is low and fewer units when it's high, which can lead to better returns in the long run."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Controls */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">SIP Inputs</h2>
                    <button onClick={() => setIsLearnModalOpen(true)} className="font-bold text-emerald-600 hover:underline">Learn</button>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Investment (₹)</label>
                    <input type="number" value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded-lg"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Annual Return (%)</label>
                    <input type="number" value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded-lg"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Investment Duration (Years)</label>
                    <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded-lg"/>
                </div>
            </div>

            {/* Chart and Summary */}
            <div className="lg:col-span-2 space-y-8">
                <div>
                    <h3 className="text-2xl font-bold text-center text-gray-800">Your SIP Projection</h3>
                    <div className="bg-white border border-gray-100 rounded-xl p-4 mt-4 h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }}/>
                            <YAxis tickFormatter={(value) => `₹${value/100000}L`} />
                            <Tooltip formatter={(value) => `₹${(value as number).toLocaleString()}`} labelFormatter={(label) => `Year ${label}`}/>
                            <Line type="monotone" dataKey="totalValue" stroke="#059669" strokeWidth={3} dot={false} name="Total Value"/>
                            <Line type="monotone" dataKey="totalInvestment" stroke="#d97706" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Total Investment"/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-sm text-blue-800 font-semibold uppercase">Total Invested</p>
                        <p className="text-2xl font-bold text-blue-600">₹{totalInvestment.toLocaleString()}</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                        <p className="text-sm text-emerald-800 font-semibold uppercase">Wealth Gained</p>
                        <p className="text-2xl font-bold text-emerald-600">₹{wealthGained.toLocaleString()}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <p className="text-sm text-purple-800 font-semibold uppercase">Total Value</p>
                        <p className="text-2xl font-bold text-purple-600">₹{totalValue.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    </>
  );
};
