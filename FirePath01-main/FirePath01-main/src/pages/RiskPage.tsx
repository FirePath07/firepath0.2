import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { getLatestNAV } from '../services/mutualFunds';
import { calculateStepUpSIP, checkFeasibility, calculateCorpus, calculateSIP } from '../utils/simulation';
import { X, Calculator, IndianRupee, TrendingUp } from 'lucide-react';

interface MutualFund {
  name: string;
  category: string;
  expense_ratio: number;
  min_investment: number;
  rating: number;
  schemeCode?: string;
  currentNAV?: number;
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

  // Simulation State
  const [showModal, setShowModal] = useState(false);
  const [simulationProfile, setSimulationProfile] = useState<RiskProfileData | null>(null);

  // Calculate defaults
  const userExpenses = user?.financialData?.monthlyExpenses || 0;
  const userIncome = user?.financialData?.monthlyIncome || 0;
  const defaultFIRENumber = userExpenses * 12 * 25; // Rule of 25
  const currentAge = user?.financialData?.age || 25;
  const retirementAge = user?.financialData?.targetRetirementAge || 60;
  const defaultYears = Math.max(1, retirementAge - currentAge);

  const [targetAmount, setTargetAmount] = useState<number>(defaultFIRENumber || 10000000);
  const [years, setYears] = useState<number>(defaultYears);

  // Update defaults when modal opens or user data loads
  useEffect(() => {
    if (user) {
      setTargetAmount(defaultFIRENumber || 10000000);
      setYears(defaultYears);
    }
  }, [user, defaultFIRENumber, defaultYears]);

  const [simResult, setSimResult] = useState<{
    monthlySIP: number;
    flatSIP: number;
    feasible: boolean;
    gap: number;
    alternateCorpus?: number; // What they can achieve with max surplus
  } | null>(null);
  const [fundNAVs, setFundNAVs] = useState<Record<string, number>>({});
  const [loadingNAVs, setLoadingNAVs] = useState(false);

  // Fetch NAVs when a profile is selected for simulation
  const fetchNAVsForProfile = async (profile: RiskProfileData) => {
    setLoadingNAVs(true);
    const newNAVs: Record<string, number> = {};

    for (const fund of profile.funds) {
      if (fund.schemeCode) {
        // Check if we already have it to avoid spamming API
        if (!fundNAVs[fund.schemeCode]) {
          const nav = await getLatestNAV(fund.schemeCode);
          newNAVs[fund.schemeCode] = nav;
        }
      }
    }

    setFundNAVs(prev => ({ ...prev, ...newNAVs }));
    setLoadingNAVs(false);
  };

  const handleSimulate = (profile: RiskProfileData) => {
    setSimulationProfile(profile);
    setShowModal(true);
    fetchNAVsForProfile(profile);
  };

  useEffect(() => {
    if (simulationProfile) {
      const { initialMonthlyInvestment } = calculateStepUpSIP(targetAmount, years, simulationProfile.expectedReturn, 10);
      const flatSIP = calculateSIP(targetAmount, years, simulationProfile.expectedReturn);

      const monthlySurplus = (userIncome) - (userExpenses);
      const { feasible, gap } = checkFeasibility(initialMonthlyInvestment, monthlySurplus);

      let alternateCorpus;
      if (!feasible && monthlySurplus > 0) {
        // Calculate what they CAN achieve with their max surplus
        alternateCorpus = calculateCorpus(monthlySurplus, years, simulationProfile.expectedReturn);
      }

      setSimResult({
        monthlySIP: initialMonthlyInvestment,
        flatSIP,
        feasible,
        gap,
        alternateCorpus,
      });
    }
  }, [targetAmount, years, simulationProfile, user, userIncome, userExpenses]);

  // Mutual Fund Data with Real Scheme Codes
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
          name: 'SBI Liquid Fund',
          category: 'Liquid Fund',
          expense_ratio: 0.19,
          min_investment: 500,
          rating: 5,
          schemeCode: '119800'
        },
        {
          name: 'SBI Gold Fund',
          category: 'Gold',
          expense_ratio: 0.10,
          min_investment: 5000,
          rating: 4,
          schemeCode: '119788'
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
          expense_ratio: 0.18,
          min_investment: 500,
          rating: 5,
          schemeCode: '120716'
        },
        {
          name: 'SBI Gold Fund',
          category: 'Gold',
          expense_ratio: 0.10,
          min_investment: 5000,
          rating: 4,
          schemeCode: '119788'
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
          expense_ratio: 0.64,
          min_investment: 5000,
          rating: 5,
          schemeCode: '120828'
        },
        {
          name: 'Parag Parikh Flexi Cap Fund',
          category: 'Flexi Cap',
          expense_ratio: 0.59,
          min_investment: 1000,
          rating: 5,
          schemeCode: '122639'
        },
        {
          name: 'UTI Nifty 50 Index Fund',
          category: 'Large Cap',
          expense_ratio: 0.18,
          min_investment: 500,
          rating: 5,
          schemeCode: '120716'
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navigation showFullNav={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          {/* Header */}
          <div className="p-6 md:p-8 bg-emerald-50 dark:bg-emerald-900/30 border-b border-emerald-100 dark:border-emerald-800/50">
            <h2 className="text-3xl font-bold text-emerald-900 dark:text-emerald-400 flex items-center gap-2">
              📈 Choose Your Risk Profile
            </h2>
            <p className="text-emerald-700 dark:text-emerald-300 mt-2">
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
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{prof.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{prof.description}</p>
                    <div style={{ color: colorMap[prof.color as keyof typeof colorMap] }} className="text-lg font-bold mb-4">
                      {prof.expectedReturn}%+ Annual Return
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSimulate(prof);
                      }}
                      className="w-full py-2 px-4 bg-white border-2 border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-emerald-500 hover:text-emerald-700 transition flex items-center justify-center gap-2"
                    >
                      <Calculator size={16} />
                      Simulate Investment
                    </button>
                  </button>
                );
              })}
            </div>

            {/* Selected Profile Details & Advice */}
            <div className="space-y-6">
              {/* Asset Allocation */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-8 border border-gray-200 dark:border-gray-600">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{profile.name} Portfolio Details</h3>

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
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-8 border border-blue-200 dark:border-blue-800">
                <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-400 mb-4">💡 Investment Advice</h3>
                <p className="text-blue-800 dark:text-blue-300 text-lg leading-relaxed whitespace-pre-line">{profile.advice}</p>
              </div>

              {/* Recommended Mutual Funds */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="bg-gray-100 dark:bg-gray-800/80 p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">📊 Recommended Mutual Funds</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Top-rated funds suitable for your {profile.name} risk profile</p>
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

      {/* Simulation Modal */}
      {showModal && simulationProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Calculator className="text-emerald-600" />
                  Investment Simulation
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Plan your goal with the <span className="font-semibold text-emerald-700">{simulationProfile.name}</span> portfolio
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition font-bold text-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Horizon (Years)</label>
                  <div className="relative">
                    <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      value={years}
                      onChange={(e) => setYears(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition font-bold text-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Results */}
              {simResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strategy 1: Step-up SIP */}
                    <div className={`p-5 rounded-xl border-2 ${simResult.feasible ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'} transition-colors relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                        Recommended
                      </div>
                      <p className="text-sm font-bold text-gray-700 mb-1">Step-up SIP (10% Annual)</p>
                      <h4 className={`text-2xl font-bold ${simResult.feasible ? 'text-emerald-700' : 'text-red-700'}`}>
                        ₹{simResult.monthlySIP.toLocaleString()}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">Start small, increase by 10% every year.</p>
                    </div>

                    {/* Strategy 2: Flat SIP */}
                    <div className="p-5 rounded-xl border-2 border-gray-200 bg-white">
                      <p className="text-sm font-bold text-gray-700 mb-1">Standard SIP (Fixed)</p>
                      <h4 className="text-2xl font-bold text-gray-800">
                        ₹{simResult.flatSIP.toLocaleString()}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">Fixed monthly amount for {years} years.</p>
                    </div>
                  </div>

                  {/* Feasibility Check */}
                  <div className={`p-4 rounded-lg flex items-start gap-3 ${simResult.feasible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className="text-xl">{simResult.feasible ? '✅' : '⚠️'}</div>
                    <div>
                      <p className="font-bold text-sm">
                        {simResult.feasible ? 'Goal is Achievable!' : 'Goal requires more savings'}
                      </p>
                      {!simResult.feasible && (
                        <p className="text-sm mt-1">
                          Gap: <span className="font-bold">₹{simResult.gap.toLocaleString()}</span>.
                          Try the Step-up strategy or extend your timeline.
                        </p>
                      )}
                      {!simResult.feasible && simResult.alternateCorpus && (
                        <div className="mt-2 text-sm bg-white/50 p-2 rounded border border-red-200">
                          💡 With current surplus ({((user?.financialData?.monthlyIncome || 0) - (user?.financialData?.monthlyExpenses || 0)).toLocaleString()}), you can reach <span className="font-bold">₹{simResult.alternateCorpus.toLocaleString()}</span>.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200/50">
                    <p className="text-xs text-gray-500">
                      Assumption: Returns @ {simulationProfile.expectedReturn}% p.a. Step-up Strategy assumes 10% annual increase in investment.
                    </p>
                  </div>
                </div>
              )}

              {/* Funds & Live NAV */}
              <div>
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Fund Portfolio & Live NAV
                </h4>
                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                  {loadingNAVs ? (
                    <div className="p-8 text-center text-gray-500">Fetching live market data...</div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {simulationProfile.funds.map((fund, idx) => (
                        <div key={idx} className="p-4 flex justify-between items-center hover:bg-gray-100 transition">
                          <div>
                            <p className="font-bold text-gray-900">{fund.name}</p>
                            <p className="text-xs text-gray-500">{fund.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Current NAV</p>
                            <p className="font-mono font-bold text-emerald-700">
                              {fund.schemeCode && fundNAVs[fund.schemeCode]
                                ? `₹${fundNAVs[fund.schemeCode]}`
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition"
              >
                Close Simulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
