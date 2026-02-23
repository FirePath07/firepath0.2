import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { SettingsModal } from '../components/SettingsModal';
import { formatIndianCurrency } from '../utils/currency';

const StatCard = ({ title, value, subtitle, isHighlighted = false }: { title: string, value: string, subtitle: string, isHighlighted?: boolean }) => {
  const highlightClass = isHighlighted ? 'bg-emerald-100 border-emerald-600 scale-105 dark:bg-emerald-900/40 dark:border-emerald-500' : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700';
  return (
    <div className={`rounded-xl shadow-lg p-6 border-l-4 transition-all duration-300 ${highlightClass}`}>
      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
      <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>
    </div>
  )
}

export const UserProfileDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (!user) {
    navigate('/');
    return null;
  }

  const { financialData } = user;
  const annualIncome = financialData.monthlyIncome * 12;
  const annualExpenses = financialData.monthlyExpenses * 12;
  const annualSurplus = annualIncome - annualExpenses;
  const savingsRate = annualIncome > 0 ? ((annualSurplus / annualIncome) * 100).toFixed(1) : "0";

  // Align Calculation with Calculator Page (Future Value method)
  const inflationRate = (user.financialData.inflationRate || 6) / 100;
  const yearsToInvest = Math.max(0, financialData.targetRetirementAge - financialData.age);
  const futureAnnualExpenses = annualExpenses * Math.pow(1 + inflationRate, yearsToInvest);

  const fireNumber = futureAnnualExpenses * 25;

  const yearsToFire = annualSurplus > 0 && financialData.currentSavings < fireNumber
    ? Math.log((fireNumber * 0.05 + annualSurplus) / (financialData.currentSavings * 0.05 + annualSurplus)) / Math.log(1.05)
    : 0;
  const estimatedRetirementAge = financialData.age + Math.max(yearsToFire, 0);

  const netWorth = financialData.currentSavings;

  const stats = [
    { title: 'Annual Income', value: formatIndianCurrency(annualIncome), subtitle: `${formatIndianCurrency(financialData.monthlyIncome)}/month`, metricName: 'Annual Income' },
    { title: 'Annual Expenses', value: formatIndianCurrency(annualExpenses), subtitle: `${formatIndianCurrency(financialData.monthlyExpenses)}/month`, metricName: 'Annual Expenses' },
    { title: 'Savings Rate', value: `${savingsRate}%`, subtitle: `Saving ${formatIndianCurrency(annualSurplus)} per year`, metricName: 'Savings Rate' },
    { title: 'Net Worth', value: formatIndianCurrency(netWorth), subtitle: 'Your current assets', metricName: 'Net Worth' },
    { title: 'Years to FIRE', value: isFinite(yearsToFire) ? `${yearsToFire.toFixed(1)} yrs` : 'N/A', subtitle: `Est. retirement at ${Math.round(estimatedRetirementAge)}`, metricName: 'Years to FIRE' },
  ];

  const mostImportantStat = stats.find(s => s.metricName === financialData.mostImportantMetric) || stats[2]; // Default to Savings Rate

  const location = useLocation();
  const [isTutorialMode, setIsTutorialMode] = useState(false);

  useEffect(() => {
    if (location.state?.tutorialMode) {
      setIsTutorialMode(true);
      // Clean up state so refresh doesn't re-trigger? 
      // Actually keeping it is fine for now, or we can replace state.
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative transition-colors duration-300">
      {/* Tutorial Overlay */}
      {isTutorialMode && (
        <div className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 pointer-events-auto flex items-center justify-center">
          {/* Optional: Add a helper text/arrow pointing to quick actions logic could go here if we knew exact coordinates, 
                but centering a message is safer */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-2xl animate-bounce z-50 text-emerald-800 font-bold">
            👇 Start your journey here!
          </div>
        </div>
      )}

      {/* Main Content - Disable interaction when in tutorial mode unless highlighted */}
      <div className={`transition-all duration-300 ${isTutorialMode ? 'pointer-events-none' : ''}`}>
        <Navigation showFullNav={true} />
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Your Financial Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Welcome back, <button onClick={() => navigate('/user-details')} className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline">{user.name}</button>! Here's your FIRE journey overview.</p>
            </div>
          </div>

          {/* Personalized Goal */}
          {financialData.primaryGoal && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border-l-4 border-amber-500">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">My Goal: <span className="text-amber-600 dark:text-amber-400">{financialData.primaryGoal}</span></h2>
              <p className="text-gray-600 dark:text-gray-400">All your financial metrics are aligned to help you achieve this goal.</p>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard {...mostImportantStat} isHighlighted={true} />
            {stats.filter(s => s.metricName !== mostImportantStat.metricName).slice(0, 2).map(stat => (
              <StatCard {...stat} key={stat.title} />
            ))}
          </div>

          {/* FIRE Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* FIRE Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">FIRE Goal Progress</h2>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-gray-700 dark:text-gray-300 font-medium">FIRE Number (25x Future Expenses)</p>
                    <p className="text-lg font-bold text-emerald-700">{formatIndianCurrency(fireNumber)}</p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-emerald-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((financialData.currentSavings / fireNumber) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>{formatIndianCurrency(financialData.currentSavings)} Saved</span>
                    <span>{fireNumber > 0 ? Math.min(parseFloat(((financialData.currentSavings / fireNumber) * 100).toFixed(1)), 100) : 0}% Complete</span>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <strong>Estimated FIRE Age:</strong> <span className="text-blue-700 dark:text-blue-400 font-bold text-lg">{isFinite(estimatedRetirementAge) ? Math.round(estimatedRetirementAge) : 'N/A'}</span>
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Based on current savings and {savingsRate}% savings rate
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Current Age</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{financialData.age}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Target Retirement</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{financialData.targetRetirementAge}</p>
                  </div>
                </div>
              </div>
            </div>


            {/* Quick Actions - HIGH Z-INDEX IN TUTORIAL MODE */}
            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 relative transition-transform duration-300 ${isTutorialMode ? 'z-50 scale-105 ring-4 ring-emerald-400 pointer-events-auto' : ''}`}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/risk')}
                  className="p-4 border border-emerald-100 dark:border-emerald-900/50 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition text-left group"
                >
                  <span className="text-2xl mb-2 block">🛡️</span>
                  <span className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400">Risk Profile</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Review & update risk</p>
                </button>

                <button
                  onClick={() => navigate('/calculators')}
                  className="p-4 border border-blue-100 dark:border-blue-900/50 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 transition text-left group"
                >
                  <span className="text-2xl mb-2 block">🧮</span>
                  <span className="font-bold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">Calculators</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Plan your future</p>
                </button>

                <button
                  onClick={() => navigate('/articles')}
                  className="p-4 border border-amber-100 dark:border-amber-900/50 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/30 transition text-left group"
                >
                  <span className="text-2xl mb-2 block">📚</span>
                  <span className="font-bold text-gray-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400">Learn</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Financial guides</p>
                </button>

                <button
                  onClick={() => navigate('/questionnaire')}
                  className="p-4 border border-purple-100 dark:border-purple-900/50 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/30 transition text-left group"
                >
                  <span className="text-2xl mb-2 block">📝</span>
                  <span className="font-bold text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400">Retake</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Update assessment</p>
                </button>
              </div>
            </div>

            {/* Financial Snapshot */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Financial Snapshot</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Risk Profile</span>
                  <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400 capitalize">{financialData.riskProfile}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Monthly Surplus</span>
                  <span className="text-xl font-bold text-amber-700 dark:text-amber-400">{formatIndianCurrency(financialData.monthlyIncome - financialData.monthlyExpenses)}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Years of Expenses Saved</span>
                  <span className="text-xl font-bold text-purple-700 dark:text-purple-400">{annualExpenses > 0 ? (financialData.currentSavings / annualExpenses).toFixed(1) : 0} yrs</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Income Multiple</span>
                  <span className="text-xl font-bold text-blue-700 dark:text-blue-400">{annualIncome > 0 ? (fireNumber / annualIncome).toFixed(1) : 0}x</span>
                </div>
              </div>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-full mt-6 bg-emerald-700 text-white py-3 rounded-lg font-bold hover:bg-emerald-800 transition">
                Update My Numbers
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
