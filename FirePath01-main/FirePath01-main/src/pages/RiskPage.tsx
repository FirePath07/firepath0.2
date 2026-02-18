import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';

interface MutualFund {
  name: string;
  category: string;
  expense_ratio: number;
  min_investment: number;
  rating: number;
}

interface RiskProfileData {
  name: string;
  description: string;
  allocation: { equity: number; debt: number; gold: number };
  expectedReturn: number;
  color: string;
  risk: string;
  icon: string;
  advice: string;
  funds: MutualFund[];
}

export const RiskPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [selectedRisk, setSelectedRisk] = useState<'safe' | 'medium' | 'risky'>(() => {
    // Priority: 1. State from navigation (e.g. from questionnaire)
    //           2. User's saved profile from context
    //           3. Default to 'medium'
    if (location.state?.riskProfile) return location.state.riskProfile as 'safe' | 'medium' | 'risky';
    if (user?.financialData?.riskProfile) return user.financialData.riskProfile;
    return 'medium';
  });

  // Mock mutual fund data
  const riskProfiles: Record<string, RiskProfileData> = {
    safe: {
      name: 'Safe',
      description: 'Focuses on liquid funds and gold for stability.',
      allocation: { equity: 0, debt: 80, gold: 20 },
      expectedReturn: 7,
      color: 'green',
      risk: 'Low',
      icon: '🛡️',
      advice: 'This portfolio focuses on capital preservation using Liquid Funds and Gold. \n\nAllocation: \n- 80% Debt/Liquid Funds\n- 20% Gold\n- 0% Equity\n\nIdeal for short-term goals or emergency funds.',
      funds: [
        {
          name: 'Nippon India Liquid Fund',
          category: 'Liquid Fund',
          expense_ratio: 0.15,
          min_investment: 500,
          rating: 5
        },
        {
          name: 'SBI Gold ETF',
          category: 'Gold',
          expense_ratio: 0.50,
          min_investment: 1000,
          rating: 4.5
        },
        {
          name: 'HDFC Liquid Fund',
          category: 'Liquid Fund',
          expense_ratio: 0.10,
          min_investment: 500,
          rating: 4.8
        }
      ]
    },
    medium: {
      name: 'Medium',
      description: 'Focuses mainly on index funds with some gold allocation.',
      allocation: { equity: 80, debt: 0, gold: 20 },
      expectedReturn: 12,
      color: 'blue',
      risk: 'Moderate',
      icon: '⚖️',
      advice: 'Balanced growth using Index Funds and Gold. \n\nAllocation:\n- 80% Stocks (Index Funds)\n- 20% Gold\n\nSuitable for long-term wealth creation with moderate volatility.',
      funds: [
        {
          name: 'UTI Nifty 50 Index Fund',
          category: 'Index Fund',
          expense_ratio: 0.20,
          min_investment: 500,
          rating: 5
        },
        {
          name: 'Nippon India ETF Gold BeES',
          category: 'Gold ETF',
          expense_ratio: 0.80,
          min_investment: 1000,
          rating: 4.6
        },
        {
          name: 'HDFC Index Fund - Sensex Plan',
          category: 'Index Fund',
          expense_ratio: 0.20,
          min_investment: 500,
          rating: 4.5
        }
      ]
    },
    risky: {
      name: 'Risky',
      description: 'Focuses entirely on stocks for maximum growth.',
      allocation: { equity: 100, debt: 0, gold: 0 },
      expectedReturn: 15,
      color: 'red',
      risk: 'High',
      icon: '🚀',
      advice: 'Aggressive portfolio 100% invested in Equity. \n\nSplit:\n- 40% Small Cap\n- 40% Flexi Cap\n- 20% Large Cap\n\nHigh risk, high reward. Requires a long-term horizon (7+ years).',
      funds: [
        {
          name: 'Quant Small Cap Fund',
          category: 'Small Cap',
          expense_ratio: 0.60,
          min_investment: 1000,
          rating: 5
        },
        {
          name: 'Parag Parikh Flexi Cap Fund',
          category: 'Flexi Cap',
          expense_ratio: 0.80,
          min_investment: 1000,
          rating: 5
        },
        {
          name: 'HDFC Top 100 Fund',
          category: 'Large Cap',
          expense_ratio: 1.10,
          min_investment: 1000,
          rating: 4.5
        }
      ]
    }
  };

  const profile = riskProfiles[selectedRisk];

  const handleNext = () => {
    navigate('/calculators', {
      state: {
        ...location.state,
        riskProfile: selectedRisk,
        expectedReturn: profile.expectedReturn
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation showFullNav={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="p-6 md:p-8 bg-emerald-50 border-b border-emerald-100">
            <h2 className="text-3xl font-bold text-emerald-900 flex items-center gap-2">
              📈 Choose Your Risk Profile
            </h2>
            <p className="text-emerald-700 mt-2">
              Select the investment risk level that matches your comfort and goals.
            </p>
          </div>

          {/* Risk Profile Selection */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {(['safe', 'medium', 'risky'] as const).map((riskLevel) => {
                const prof = riskProfiles[riskLevel];
                const colorMap = { green: '#10b981', blue: '#3b82f6', red: '#ef4444' };
                const bgColorMap = { green: '#f0fdf4', blue: '#f0f9ff', red: '#fef2f2' };
                return (
                  <button
                    key={riskLevel}
                    onClick={() => setSelectedRisk(riskLevel)}
                    style={selectedRisk === riskLevel ? {
                      borderColor: colorMap[prof.color as keyof typeof colorMap],
                      backgroundColor: bgColorMap[prof.color as keyof typeof bgColorMap],
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    } : {}}
                    className={`p-6 rounded-xl border-2 transition ${selectedRisk === riskLevel ? 'shadow-lg' : 'border-gray-200 bg-white hover:shadow-md'
                      }`}
                  >
                    <div className="text-4xl mb-3">{prof.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{prof.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{prof.description}</p>
                    <div style={{ color: colorMap[prof.color as keyof typeof colorMap] }} className="text-lg font-bold">
                      {prof.expectedReturn}%+ Annual Return
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Profile Details & Advice */}
            <div className="space-y-6">
              {/* Asset Allocation */}
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{profile.name} Portfolio Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  {/* Allocation */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-4">Asset Allocation</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-700">Equity / Stocks</span>
                          <span className="font-bold text-gray-900">{profile.allocation.equity}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${profile.allocation.equity}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-700">Debt / Liquid Funds</span>
                          <span className="font-bold text-gray-900">{profile.allocation.debt}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${profile.allocation.debt}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-700">Gold</span>
                          <span className="font-bold text-gray-900">{profile.allocation.gold}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-amber-400 h-2 rounded-full"
                            style={{ width: `${profile.allocation.gold}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600">Risk Level</p>
                      <p className="text-xl font-bold text-gray-900">{profile.risk}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600">Expected Annual Return</p>
                      <p className="text-xl font-bold text-gray-900">{profile.expectedReturn}%</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600">Best For</p>
                      <p className="text-xl font-bold text-gray-900">
                        {selectedRisk === 'safe' && 'Near Retirees'}
                        {selectedRisk === 'medium' && 'Most Investors'}
                        {selectedRisk === 'risky' && 'Young Investors'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Investment Advice Section */}
              <div className="bg-blue-50 rounded-xl p-8 border border-blue-200">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">💡 Investment Advice</h3>
                <p className="text-blue-800 text-lg leading-relaxed whitespace-pre-line">{profile.advice}</p>
              </div>

              {/* Recommended Mutual Funds */}
              <div className="rounded-xl border border-gray-200">
                <div className="bg-gray-100 p-6 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900">📊 Recommended Mutual Funds</h3>
                  <p className="text-gray-600 mt-2">Top-rated funds suitable for your {profile.name} risk profile</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fund Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Expense Ratio</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Min. Investment</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.funds.map((fund, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{fund.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                              {fund.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{fund.expense_ratio}%</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {fund.min_investment === 0 ? 'No Minimum' : `₹${fund.min_investment.toLocaleString()}`}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-400">★</span>
                              <span className="font-semibold text-gray-900">{fund.rating}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-gray-50 p-6 border-t border-gray-200 text-sm text-gray-600">
                  <p>💬 <strong>Note:</strong> Fund data is based on popular low-cost index funds. For real-time updates, integrate with APIs like Finnhub, Alpha Vantage, or Financial Modeling Prep API.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between p-8 border-t border-gray-200">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition">
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-emerald-700 text-white rounded-lg font-bold hover:bg-emerald-800 transition shadow-lg">
              Next: Calculators
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
