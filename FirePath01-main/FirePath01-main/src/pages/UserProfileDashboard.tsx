import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { SettingsModal } from '../components/SettingsModal';

const StatCard = ({ title, value, subtitle, isHighlighted = false }: { title: string, value: string, subtitle: string, isHighlighted?: boolean }) => {
    const highlightClass = isHighlighted ? 'bg-emerald-100 border-emerald-600 scale-105' : 'bg-white border-gray-200';
    return (
        <div className={`rounded-xl shadow-lg p-6 border-l-4 transition-all duration-300 ${highlightClass}`}>
            <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
            <p className="text-3xl font-bold text-emerald-700">{value}</p>
            <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
        </div>
    )
}

export const UserProfileDashboard = () => {
  const { user, signOut } = useAuth();
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
  const fireNumber = annualExpenses * 25;
  const yearsToFire = annualSurplus > 0 && financialData.currentSavings < fireNumber 
    ? Math.log((fireNumber * 0.05 + annualSurplus) / (financialData.currentSavings * 0.05 + annualSurplus)) / Math.log(1.05)
    : 0;
  const estimatedRetirementAge = financialData.age + Math.max(yearsToFire, 0);

  const netWorth = financialData.currentSavings;

  const stats = [
    { title: 'Annual Income', value: `₹${(annualIncome / 100000).toFixed(1)}L`, subtitle: `₹${financialData.monthlyIncome.toLocaleString()}/month`, metricName: 'Annual Income' },
    { title: 'Annual Expenses', value: `₹${(annualExpenses / 100000).toFixed(1)}L`, subtitle: `₹${financialData.monthlyExpenses.toLocaleString()}/month`, metricName: 'Annual Expenses' },
    { title: 'Savings Rate', value: `${savingsRate}%`, subtitle: `Saving ₹${(annualSurplus / 100000).toFixed(1)}L per year`, metricName: 'Savings Rate' },
    { title: 'Net Worth', value: `₹${(netWorth / 100000).toFixed(1)}L`, subtitle: 'Your current assets', metricName: 'Net Worth'},
    { title: 'Years to FIRE', value: isFinite(yearsToFire) ? `${yearsToFire.toFixed(1)} yrs` : 'N/A', subtitle: `Est. retirement at ${Math.round(estimatedRetirementAge)}`, metricName: 'Years to FIRE' },
  ];
  
  const mostImportantStat = stats.find(s => s.metricName === financialData.mostImportantMetric) || stats[2]; // Default to Savings Rate

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation showFullNav={true} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Financial Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.name}! Here's your FIRE journey overview.</p>
          </div>
          <div className="flex gap-2">
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-50 transition shadow-sm">
                Settings
            </button>
            <button 
                onClick={() => { signOut(); navigate('/'); }}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition shadow-sm">
                Sign Out
            </button>
          </div>
        </div>
        
        {/* Personalized Goal */}
        {financialData.primaryGoal && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-amber-500">
                <h2 className="text-lg font-bold text-gray-800">My Goal: <span className="text-amber-600">{financialData.primaryGoal}</span></h2>
                <p className="text-gray-600">All your financial metrics are aligned to help you achieve this goal.</p>
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
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">FIRE Goal Progress</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-gray-700 font-medium">FIRE Number (25x Annual Expenses)</p>
                  <p className="text-lg font-bold text-emerald-700">₹{(fireNumber / 100000).toFixed(0)}L</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-emerald-500 h-3 rounded-full transition-all duration-300"
                    style={{width: `${Math.min((financialData.currentSavings / fireNumber) * 100, 100)}%`}}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>₹{(financialData.currentSavings / 100000).toFixed(1)}L Saved</span>
                  <span>{fireNumber > 0 ? Math.min(parseFloat(((financialData.currentSavings / fireNumber) * 100).toFixed(1)), 100) : 0}% Complete</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Estimated FIRE Age:</strong> <span className="text-blue-700 font-bold text-lg">{isFinite(estimatedRetirementAge) ? Math.round(estimatedRetirementAge) : 'N/A'}</span>
                </p>
                <p className="text-xs text-gray-600">
                  Based on current savings and {savingsRate}% savings rate
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 font-medium">Current Age</p>
                  <p className="text-2xl font-bold text-gray-900">{financialData.age}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 font-medium">Target Retirement</p>
                  <p className="text-2xl font-bold text-gray-900">{financialData.targetRetirementAge}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Snapshot */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Snapshot</h2>
            
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-700 font-medium">Risk Profile</span>
                    <span className="text-xl font-bold text-emerald-700 capitalize">{financialData.riskProfile}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-700 font-medium">Monthly Surplus</span>
                    <span className="text-xl font-bold text-amber-700">₹{(financialData.monthlyIncome - financialData.monthlyExpenses).toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-700 font-medium">Years of Expenses Saved</span>
                    <span className="text-xl font-bold text-purple-700">{annualExpenses > 0 ? (financialData.currentSavings / annualExpenses).toFixed(1) : 0} yrs</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-700 font-medium">Income Multiple</span>
                    <span className="text-xl font-bold text-blue-700">{annualIncome > 0 ? (fireNumber / annualIncome).toFixed(1) : 0}x</span>
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
  );
};
