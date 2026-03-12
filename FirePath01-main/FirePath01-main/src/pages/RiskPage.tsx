import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { FundIcon } from '../components/FundIcon';
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
    const raw = location.state?.riskProfile || user?.financialData?.riskProfile;
    if (typeof raw === 'string') {
      if (raw.toLowerCase().includes('safe') || raw.includes('Capital Stability')) return 'safe';
      if (raw.toLowerCase().includes('risky') || raw.includes('High Growth')) return 'risky';
    }
    return 'medium';
  });

  // Simulation State
  const [showModal, setShowModal] = useState(false);
  const [simulationProfile, setSimulationProfile] = useState<RiskProfileData | null>(null);

  // Calculate defaults accurately
  const userExpenses = user?.financialData?.monthlyExpenses || 0;
  const userIncome = user?.financialData?.monthlyIncome || 0;
  const currentAge = user?.financialData?.age || 25;
  const retirementAge = user?.financialData?.targetRetirementAge || 60;
  const inflationRate = (user?.financialData?.inflationRate || 6) / 100;
  const defaultYears = Math.max(1, retirementAge - currentAge);

  const futureAnnualExpenses = (userExpenses * 12) * Math.pow(1 + inflationRate, defaultYears);
  
  // Use selectedFireAmount if available, otherwise calculate traditional inflated 25x
  const defaultFIRENumber = user?.financialData?.selectedFireAmount && user?.financialData?.selectedFireAmount > 0 
      ? user.financialData.selectedFireAmount 
      : futureAnnualExpenses * 25;

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
      name: 'Capital Stability Strategy',
      description: 'Focuses on steady growth via corporate bonds and low risk assets.',
      allocation: { equity: 0, debt: 100, gold: 0 },
      expectedReturn: 8.5,
      color: 'emerald',
      risk: 'Low',
      icon: '🛡️',
      advice: 'This portfolio focuses on capital preservation using select Corporate Bond Funds. \n\nAllocation: \n- 100% Debt/Liquid Funds\n- 0% Gold\n- 0% Equity\n\nExpected annual return around 8.5% based on a conservative portfolio focused on debt instruments and gold.',
      funds: [
        {
          name: 'ICICI Prudential Corporate Bond Fund',
          category: 'Corporate Bond',
          expense_ratio: 0.28,
          min_investment: 100,
          rating: 5,
        },
        {
          name: 'HDFC Corporate Bond Fund',
          category: 'Corporate Bond',
          expense_ratio: 0.32,
          min_investment: 100,
          rating: 4,
        },
        {
          name: 'Kotak Corporate Bond Fund',
          category: 'Corporate Bond',
          expense_ratio: 0.30,
          min_investment: 1000,
          rating: 4,
        }
      ]
    },
    medium: {
      name: 'Balanced Growth Strategy',
      description: 'Focuses mainly on index funds, flexi-cap, and gold allocation.',
      allocation: { equity: 80, debt: 0, gold: 20 },
      expectedReturn: 12,
      color: 'blue',
      risk: 'Moderate',
      icon: '⚖️',
      advice: 'Balanced growth using Index Funds, Flexi-cap, and Gold. \n\nAllocation:\n- 80% Stocks\n- 20% Gold\n\nSuitable for long-term wealth creation with moderate volatility.',
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
          name: 'Parag Parikh Flexi Cap Fund',
          category: 'Flexi Cap',
          expense_ratio: 0.59,
          min_investment: 1000,
          rating: 5,
          schemeCode: '122639'
        },
        {
          name: 'Nippon India ETF Gold BeES',
          category: 'Gold',
          expense_ratio: 0.79,
          min_investment: 500,
          rating: 4,
        }
      ]
    },
    risky: {
      name: 'High Growth Strategy',
      description: 'Focuses aggressively on stocks for maximum wealth acceleration.',
      allocation: { equity: 100, debt: 0, gold: 0 },
      expectedReturn: 16,
      color: 'red',
      risk: 'High',
      icon: '🚀',
      advice: 'Aggressive portfolio 100% invested in Equity. \n\nSplit:\n- Focused Funds\n- Small Cap Funds\n- Core large cap\n\nHigh risk, high reward. Requires a long-term horizon (7+ years).',
      funds: [
        {
          name: 'SBI Focused Equity Fund',
          category: 'Focused Fund',
          expense_ratio: 0.73,
          min_investment: 500,
          rating: 5,
        },
        {
          name: 'Nippon India Small Cap Fund',
          category: 'Small Cap',
          expense_ratio: 0.69,
          min_investment: 1000,
          rating: 5,
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
                return (
                  <button
                    key={riskLevel}
                    onClick={() => setSelectedRisk(riskLevel)}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                      selectedRisk === riskLevel
                        ? riskLevel === 'safe' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/40 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2)] scale-[1.02]' :
                          riskLevel === 'medium' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2)] scale-[1.02]' :
                          'border-red-500 bg-red-50 dark:bg-red-900/40 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2)] scale-[1.02]'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-xl hover:-translate-y-1'
                    }`}
                  >
                    <div className="text-4xl mb-4 drop-shadow-sm">{prof.icon}</div>
                    <h3 className={`text-xl font-bold mb-2 ${
                      selectedRisk === riskLevel 
                        ? riskLevel === 'safe' ? 'text-emerald-700 dark:text-emerald-300' :
                          riskLevel === 'medium' ? 'text-blue-700 dark:text-blue-300' :
                          'text-red-700 dark:text-red-300'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {prof.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{prof.description}</p>
                    <div className={`text-lg font-black mb-5 ${
                      selectedRisk === riskLevel 
                        ? riskLevel === 'safe' ? 'text-emerald-600 dark:text-emerald-400' :
                          riskLevel === 'medium' ? 'text-blue-600 dark:text-blue-400' :
                          'text-red-600 dark:text-red-400'
                        : riskLevel === 'safe' ? 'text-emerald-500 dark:text-emerald-400' :
                          riskLevel === 'medium' ? 'text-blue-500 dark:text-blue-400' :
                          'text-red-500 dark:text-red-400'
                    }`}>
                      {prof.expectedReturn}%{riskLevel === 'risky' ? '+' : ''} Annual Return
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSimulate(prof);
                      }}
                      className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${
                        selectedRisk === riskLevel
                          ? riskLevel === 'safe' ? 'bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 shadow-sm hover:bg-emerald-50' :
                            riskLevel === 'medium' ? 'bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 shadow-sm hover:bg-blue-50' :
                            'bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 shadow-sm hover:bg-red-50'
                          : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                      }`}
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
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">Asset Allocation</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-700 dark:text-gray-300">Equity / Stocks</span>
                          <span className="font-bold text-gray-900 dark:text-gray-100">{profile.allocation.equity}%</span>
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
                          <span className="text-gray-700 dark:text-gray-300">Debt / Liquid Funds</span>
                          <span className="font-bold text-gray-900 dark:text-gray-100">{profile.allocation.debt}%</span>
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
                          <span className="text-gray-700 dark:text-gray-300">Gold Allocation</span>
                          <span className="font-bold text-gray-900 dark:text-gray-100">{profile.allocation.gold}%</span>
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
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Risk Level</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{profile.risk}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Expected Annual Return</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{profile.expectedReturn}%</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Best For</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
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
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800/50 overflow-hidden shadow-lg">
                <div className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 md:p-8 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                    <span className="text-3xl drop-shadow-sm">📊</span> Recommended Mutual Funds
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">Top-rated funds curated explicitly for your {profile.name}</p>
                </div>

                <div className="p-6 md:p-8 grid gap-6">
                  {profile.funds.map((fund, idx) => (
                    <div key={idx} className="group flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700/80 hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300">

                      <div className="flex items-center gap-5 mb-4 md:mb-0">
                        <FundIcon 
                          fundName={fund.name} 
                          category={fund.category} 
                          className="w-14 h-14 md:w-16 md:h-16 shadow-lg border border-gray-100 dark:border-gray-600 shrink-0" 
                        />
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">{fund.name}</h4>
                          <span className="inline-block mt-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold tracking-wide border border-blue-200 dark:border-blue-800/50">
                            {fund.category.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-6 md:gap-8 md:pl-8 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-4 md:pt-0">
                        <div className="text-left">
                          <p className="text-xs text-gray-500 dark:text-gray-400 tracking-wider mb-1 uppercase font-semibold">Expense Ratio</p>
                          <p className="text-base font-black text-gray-900 dark:text-white">{fund.expense_ratio}%</p>
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-gray-500 dark:text-gray-400 tracking-wider mb-1 uppercase font-semibold">Min. Invest</p>
                          <p className="text-base font-black text-gray-900 dark:text-white">
                            {fund.min_investment === 0 ? 'No Min' : `₹${fund.min_investment.toLocaleString('en-IN')}`}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-gray-500 dark:text-gray-400 tracking-wider mb-1 uppercase font-semibold">Rating</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-yellow-400 text-lg drop-shadow-sm">★</span>
                            <span className="text-base font-black text-gray-900 dark:text-white">{fund.rating}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 md:p-6 border-t border-emerald-100 dark:border-emerald-800/30 text-sm text-gray-700 dark:text-gray-300 flex items-start gap-3">
                  <span className="text-xl">💬</span>
                  <p className="leading-relaxed"><strong>Note:</strong> Fund data is based on popular low-cost index and active funds curated for FirePath. For real-time updates and purchases, you will integrate with Finnhub or your brokerage.</p>
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
                        ₹{simResult.monthlySIP.toLocaleString('en-IN')}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">Start small, increase by 10% every year.</p>
                    </div>

                    {/* Strategy 2: Flat SIP */}
                    <div className="p-5 rounded-xl border-2 border-gray-200 bg-white">
                      <p className="text-sm font-bold text-gray-700 mb-1">Standard SIP (Fixed)</p>
                      <h4 className="text-2xl font-bold text-gray-800">
                        ₹{simResult.flatSIP.toLocaleString('en-IN')}
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
                          Gap: <span className="font-bold">₹{simResult.gap.toLocaleString('en-IN')}</span>.
                          Try the Step-up strategy or extend your timeline.
                        </p>
                      )}
                      {!simResult.feasible && simResult.alternateCorpus && (
                        <div className="mt-2 text-sm bg-white/50 p-2 rounded border border-red-200">
                          💡 With current surplus ({((user?.financialData?.monthlyIncome || 0) - (user?.financialData?.monthlyExpenses || 0)).toLocaleString('en-IN')}), you can reach <span className="font-bold">₹{simResult.alternateCorpus.toLocaleString('en-IN')}</span>.
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
