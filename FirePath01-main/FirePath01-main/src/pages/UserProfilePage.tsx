import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { SettingsModal } from '../components/SettingsModal';
import { formatIndianCurrency } from '../utils/currency';

export const UserProfilePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    if (!user) {
        navigate('/login');
        return null;
    }

    const { financialData } = user;
    const annualExpenses = financialData.monthlyExpenses * 12;
    
    // Use the stored selectedFireAmount if available, otherwise calculate a traditional (25x) inflated one
    const inflationRate = (financialData.inflationRate || 6) / 100;
    const yearsToInvest = Math.max(0, financialData.targetRetirementAge - financialData.age);
    const futureAnnualExpenses = annualExpenses * Math.pow(1 + inflationRate, yearsToInvest);
    
    // If selectedFireAmount is 0 (or not set), default to 25x inflated annual expenses
    const fireNumber = financialData.selectedFireAmount && financialData.selectedFireAmount > 0 
        ? financialData.selectedFireAmount 
        : futureAnnualExpenses * 25;

    const annualIncome = financialData.monthlyIncome * 12;
    const annualSurplus = annualIncome - annualExpenses;

    // Expected return based on risk profile
    let expectedReturnRate = 0.12; 
    if (financialData.riskProfile?.includes("Capital Stability")) expectedReturnRate = 0.08;
    else if (financialData.riskProfile?.includes("High Growth")) expectedReturnRate = 0.16;

    const r = expectedReturnRate;

    // Calculate estimated years to FIRE for display
    const yearsToFire = annualSurplus > 0 && financialData.currentSavings < fireNumber
        ? Math.log((fireNumber * r + annualSurplus) / (financialData.currentSavings * r + annualSurplus)) / Math.log(1 + r)
        : financialData.currentSavings >= fireNumber ? 0 : Infinity;
    const estimatedRetirementAge = financialData.age + (isFinite(yearsToFire) ? Math.max(yearsToFire, 0) : 0);

    const DataRow = ({ label, value, subtext }: { label: string, value: string, subtext?: string }) => (
        <div className="flex justify-between items-center py-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded-lg transition">
            <span className="text-gray-600 dark:text-gray-400 font-medium">{label}</span>
            <div className="text-right">
                <span className="text-gray-900 dark:text-white font-bold block">{value}</span>
                {subtext && <span className="text-xs text-gray-500 dark:text-gray-400">{subtext}</span>}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Navigation showFullNav={true} />
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/profile')}
                        className="text-gray-500 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium flex items-center gap-2 transition"
                    >
                        ← Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Profile</h1>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    {/* Header / Identity */}
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 p-8 border-b border-emerald-100 dark:border-emerald-800/50 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-emerald-200 dark:bg-emerald-800 rounded-full flex items-center justify-center text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                                <p className="text-emerald-700 dark:text-emerald-400">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition shadow-sm flex items-center gap-2"
                        >
                            <span>✎</span> Edit Profile
                        </button>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Financial Data Column */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 pb-2">Financial Data</h3>
                            <div className="space-y-1">
                                <DataRow label="Monthly Income" value={formatIndianCurrency(financialData.monthlyIncome)} subtext="Pre-tax estimate" />
                                <DataRow label="Monthly Expenses" value={formatIndianCurrency(financialData.monthlyExpenses)} />
                                <DataRow label="Current Savings" value={formatIndianCurrency(financialData.currentSavings)} subtext="Total across all accounts" />
                                <DataRow label="Current Age" value={`${financialData.age} years`} />
                            </div>
                        </div>

                        {/* Goals & FIRE Column */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 pb-2">Goals & Projections</h3>
                            <div className="space-y-1">
                                <DataRow label="Primary Goal" value={financialData.primaryGoal || 'Not set'} />
                                <DataRow
                                    label="Target Retirement Age"
                                    value={`${financialData.targetRetirementAge} years`}
                                    subtext={`Est. Actual: ${Math.round(estimatedRetirementAge)}`}
                                />
                                <DataRow
                                    label="Risk Profile"
                                    value={financialData.riskProfile ? financialData.riskProfile.charAt(0).toUpperCase() + financialData.riskProfile.slice(1) : 'Medium'}
                                    subtext="Determines asset allocation"
                                />
                                <DataRow
                                    label="FIRE Number"
                                    value={formatIndianCurrency(fireNumber)}
                                    subtext="25x Annual Expenses"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Account Info Footer */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 flex justify-between">
                        <span>Account ID: {user.id}</span>
                        <span>Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                    </div>
                </div>
            </main>
        </div>
    );
};
