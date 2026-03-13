import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { SettingsModal } from '../components/SettingsModal';
import { formatIndianCurrency } from '../utils/currency';
import { calculateFIREMetrics } from '../utils/finance';
import { motion, AnimatePresence } from 'framer-motion';
import { Award } from 'lucide-react';
import confetti from 'canvas-confetti';

const StatCard = ({ title, value, subtitle, isHighlighted = false }: { title: string, value: string, subtitle: string, isHighlighted?: boolean }) => {
  let colorClass = 'text-emerald-700 dark:text-emerald-400';
  let borderClass = 'border-emerald-600 dark:border-emerald-500';
  let bgClass = isHighlighted ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-white dark:bg-gray-800';

  if (title === 'Years to FIRE') {
    colorClass = 'text-amber-600 dark:text-amber-400';
    borderClass = 'border-amber-500 dark:border-amber-400';
    bgClass = 'bg-amber-50/50 dark:bg-amber-900/10';
  } else if (title === 'Annual Income') {
    colorClass = 'text-blue-600 dark:text-blue-400';
    borderClass = 'border-blue-500 dark:border-blue-400';
    bgClass = 'bg-blue-50/50 dark:bg-blue-900/10';
  } else if (title === 'Savings Rate') {
    colorClass = 'text-rose-600 dark:text-rose-400';
    borderClass = 'border-rose-500 dark:border-rose-400';
    bgClass = 'bg-rose-50/50 dark:bg-rose-900/10';
  }

  const highlightEffect = isHighlighted ? 'scale-105 shadow-xl shadow-gray-200/50 dark:shadow-none' : '';

  return (
    <div className={`rounded-3xl shadow-lg p-8 border-l-8 transition-all duration-500 ${bgClass} ${borderClass} ${highlightEffect} border-t border-r border-b border-gray-100 dark:border-gray-700/50`}>
      <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">{title}</p>
      <p className={`text-4xl font-black tracking-tight ${colorClass}`}>{value}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 font-bold italic">{subtitle}</p>
    </div>
  )
}

export const UserProfileDashboard = () => {
  const { user, loading, hardReset, updateFinancialData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHardResetOpen, setIsHardResetOpen] = useState(false);
  const [isTutorialMode, setIsTutorialMode] = useState(false);
  const [showFireCelebration, setShowFireCelebration] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (location.state?.tutorialMode) {
      setIsTutorialMode(true);
      window.history.replaceState({}, document.title);
    }
    // Redirect admin to specialized dashboard
    if (user?.email === 'firepathjjrp@gmail.com') {
      navigate('/admin');
    }
  }, [location, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const { financialData } = user;
  const {
    annualExpenses,
    annualIncome,
    annualSurplus,
    savingsRate,
    fireNumber,
    yearsToFire,
    estimatedRetirementAge,
    currentTotalWealth
  } = calculateFIREMetrics(financialData);

  const netWorth = currentTotalWealth;

  const isFireAchieved = currentTotalWealth >= fireNumber && fireNumber > 0;

  useEffect(() => {
    if (isFireAchieved && !financialData.fireCelebrated) {
      setShowFireCelebration(true);
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#10b981', '#fbbf24', '#ffffff', '#34d399']
      });
      updateFinancialData({ fireCelebrated: true });
    }
  }, [isFireAchieved, financialData.fireCelebrated]);

  const targetYearsToRetire = Math.max(0, financialData.targetRetirementAge - financialData.age);
  const willMissTimeline = yearsToFire > targetYearsToRetire;
  const isLowRisk = financialData.riskProfile?.includes("Capital Stability");

  const subtitleMessage = willMissTimeline && isLowRisk
    ? `Est. retirement at ${Math.round(estimatedRetirementAge)} (Past target of ${financialData.targetRetirementAge})`
    : `Est. retirement at ${Math.round(estimatedRetirementAge)}`;

  const stats = [
    { title: 'Annual Income', value: formatIndianCurrency(annualIncome), subtitle: `${formatIndianCurrency(financialData.monthlyIncome)}/month`, metricName: 'Annual Income' },
    { title: 'Annual Expenses', value: formatIndianCurrency(annualExpenses), subtitle: `${formatIndianCurrency(financialData.monthlyExpenses)}/month`, metricName: 'Annual Expenses' },
    { title: 'Savings Rate', value: `${savingsRate}%`, subtitle: `Saving ${formatIndianCurrency(annualSurplus)} per year`, metricName: 'Savings Rate' },
    { title: 'Net Worth', value: formatIndianCurrency(netWorth), subtitle: 'Your current assets', metricName: 'Net Worth' },
    { title: 'Years to FIRE', value: isFinite(yearsToFire) ? `${yearsToFire.toFixed(1)} yrs` : 'N/A', subtitle: subtitleMessage, metricName: 'Years to FIRE' },
  ];

  const mostImportantStat = stats.find(s => s.metricName === financialData.mostImportantMetric) || stats[2];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative transition-colors duration-300">
      {/* Hard Reset Modal */}
      {isHardResetOpen && (
        <div className="fixed inset-0 bg-red-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-all">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full p-8 text-center border-4 border-red-500/50">
            <h2 className="text-3xl font-extrabold text-red-600 dark:text-red-500 mb-4">⚠️ HARD RESET ⚠️</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6 font-medium text-lg leading-relaxed">
              This action will completely wipe all your associated financial data and return your account to a clean slate.
              <br /><br />
              This <strong className="text-red-600 dark:text-red-400">CANNOT</strong> be undone. You will need to retake the questionnaire to evaluate your FIRE path again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button
                onClick={() => setIsHardResetOpen(false)}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition flex-1"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await hardReset();
                  setIsHardResetOpen(false);
                  navigate('/questionnaire', { replace: true });
                }}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-500/30 flex-1"
              >
                YES, WIPE DATA
              </button>
            </div>
          </div>
        </div>
      )}
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
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onHardResetRequest={() => setIsHardResetOpen(true)} />

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
                <div className="bg-gradient-to-br from-emerald-50 dark:from-emerald-900/20 to-transparent p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl"></div>
                  <div className="flex flex-col gap-5 relative z-10">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">Your Ultimate Target</p>
                        <p className="text-gray-900 dark:text-gray-100 font-medium text-sm">FIRE Number (25x Future Expenses)</p>
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.05, 1], textShadow: ["0px 0px 0px rgba(16,185,129,0)", "0px 0px 20px rgba(16,185,129,0.5)", "0px 0px 0px rgba(16,185,129,0)"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="text-3xl md:text-5xl font-black text-emerald-600 dark:text-emerald-400 text-left md:text-right mt-2 md:mt-0 drop-shadow-sm"
                      >
                        {formatIndianCurrency(fireNumber)}
                      </motion.div>
                    </div>

                    <div>
                      {/* Vivid Animated FIRE Progress Bar */}
                      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-5 overflow-hidden relative shadow-inner">
                        {/* Glow track background */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700" />
                        {/* Animated fill */}
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((currentTotalWealth / fireNumber) * 100, 100)}%` }}
                          transition={{ duration: 1.8, ease: 'easeOut', delay: 0.3 }}
                          className="absolute top-0 left-0 h-full rounded-full"
                          style={{
                            background: 'linear-gradient(90deg, #059669, #10b981, #34d399, #6ee7b7)',
                            boxShadow: '0 0 16px 4px rgba(16,185,129,0.6), 0 0 32px 8px rgba(16,185,129,0.2)',
                          }}
                        >
                          {/* Shimmer overlay */}
                          <motion.div
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                            className="absolute inset-0 w-1/2 rounded-full"
                            style={{
                              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                            }}
                          />
                        </motion.div>
                        {/* Pulsing glow tip */}
                        <motion.div
                          animate={{ opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-[0_0_12px_4px_rgba(16,185,129,0.9)]"
                          style={{ left: `calc(${Math.min((currentTotalWealth / fireNumber) * 100, 100)}% - 10px)` }}
                        />
                      </div>
                      <div className="flex justify-between mt-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">{formatIndianCurrency(currentTotalWealth)} Saved or Invested</span>
                        <motion.span
                          animate={{ color: ['#059669', '#10b981', '#059669'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                          className="font-black"
                        >
                          {fireNumber > 0 ? Math.min(parseFloat(((currentTotalWealth / fireNumber) * 100).toFixed(1)), 100) : 0}% Complete
                        </motion.span>
                      </div>
                    </div>
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

                {willMissTimeline && isLowRisk && (
                  <div className="bg-rose-50 dark:bg-rose-900/30 rounded-lg p-4 border border-rose-200 dark:border-rose-800 mt-4">
                    <p className="text-sm text-rose-700 dark:text-rose-400 font-bold mb-1">
                      ⚠️ Goal at Risk
                    </p>
                    <p className="text-xs text-rose-600 dark:text-rose-300">
                      With the 8% expected returns of a debt fund focus, your conservative strategy is mathematically projected to miss your target retirement age of {financialData.targetRetirementAge}. You will need to either extend your timeline, increase your monthly investments, or assume a higher risk strategy.
                    </p>
                  </div>
                )}

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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/expenses')}
                  className="p-4 border border-emerald-100 dark:border-emerald-900/50 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition text-left group"
                >
                  <span className="text-2xl mb-2 block">💸</span>
                  <span className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400">Expenses</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Track & budget</p>
                </button>

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
                  onClick={() => setIsHardResetOpen(true)}
                  className="p-4 border border-purple-100 dark:border-purple-900/50 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/30 transition text-left group"
                >
                  <span className="text-2xl mb-2 block">📝</span>
                  <span className="font-bold text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400">Retake</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Update assessment</p>
                </button>

                <button
                  onClick={() => navigate('/investment-dashboard')}
                  className="p-4 border-2 border-emerald-400 dark:border-emerald-500 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition text-left group bg-emerald-50/50 dark:bg-emerald-900/10 shadow-sm"
                >
                  <span className="text-2xl mb-2 block">📈</span>
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 group-hover:text-emerald-900 dark:group-hover:text-emerald-200">Investments</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Track portfolio</p>
                </button>
              </div>
            </div>


          </div>
        </main>
      </div>

      <AnimatePresence>
        {showFireCelebration && (
          <div className="fixed inset-0 bg-emerald-950/95 backdrop-blur-xl z-[200] flex items-center justify-center p-6 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-xl w-full"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="w-32 h-32 bg-emerald-500 rounded-full mx-auto mb-8 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)] border-4 border-white"
              >
                <Award className="w-16 h-16 text-white" />
              </motion.div>

              <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">
                MISSION ACCOMPLISHED! 🔥
              </h2>
              <p className="text-emerald-200 text-xl md:text-2xl font-bold mb-10 leading-relaxed">
                Congratulations, <span className="text-white underline decoration-white/30">{user.name}</span>!
                Your portfolio has reached <span className="text-white font-black">{formatIndianCurrency(currentTotalWealth)}</span>,
                officially meeting your FIRE target.
              </p>

              <div className="space-y-4">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/10 border border-white/20 p-6 rounded-3xl"
                >
                  <p className="text-sm font-bold text-emerald-300 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-2xl font-black text-white">FINANCIALLY INDEPENDENT</p>
                </motion.div>

                <button
                  onClick={() => setShowFireCelebration(false)}
                  className="w-full py-5 bg-white text-emerald-900 font-black rounded-2xl shadow-2xl hover:bg-emerald-50 transition-all uppercase tracking-widest text-sm mt-4 hover:scale-[1.02]"
                >
                  Enter Freedom Mode
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
