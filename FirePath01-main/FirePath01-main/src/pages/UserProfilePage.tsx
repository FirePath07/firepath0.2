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
    const fireNumber = annualExpenses * 25;
    const annualIncome = financialData.monthlyIncome * 12;
    const annualSurplus = annualIncome - annualExpenses;

    // Calculate estimated years to FIRE for display
    const yearsToFire = annualSurplus > 0 && financialData.currentSavings < fireNumber
        ? Math.log((fireNumber * 0.05 + annualSurplus) / (financialData.currentSavings * 0.05 + annualSurplus)) / Math.log(1.05)
        : 0;
    const estimatedRetirementAge = financialData.age + Math.max(yearsToFire, 0);

    const DataRow = ({ label, value, subtext }: { label: string, value: string, subtext?: string }) => (
        <div className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 rounded-lg transition">
            <span className="text-gray-600 font-medium">{label}</span>
            <div className="text-right">
                <span className="text-gray-900 font-bold block">{value}</span>
                {subtext && <span className="text-xs text-gray-500">{subtext}</span>}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation showFullNav={true} />
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/profile')}
                        className="text-gray-500 hover:text-emerald-700 font-medium flex items-center gap-2 transition"
                    >
                        ← Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Header / Identity */}
                    <div className="bg-emerald-50 p-8 border-b border-emerald-100 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center text-2xl font-bold text-emerald-800">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                                <p className="text-emerald-700">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition shadow-sm flex items-center gap-2"
                        >
                            <span>✎</span> Edit Profile
                        </button>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Financial Data Column */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase tracking-wide border-b border-gray-200 pb-2">Financial Data</h3>
                            <div className="space-y-1">
                                <DataRow label="Monthly Income" value={formatIndianCurrency(financialData.monthlyIncome)} subtext="Pre-tax estimate" />
                                <DataRow label="Monthly Expenses" value={formatIndianCurrency(financialData.monthlyExpenses)} />
                                <DataRow label="Current Savings" value={formatIndianCurrency(financialData.currentSavings)} subtext="Total across all accounts" />
                                <DataRow label="Current Age" value={`${financialData.age} years`} />
                            </div>
                        </div>

                        {/* Goals & FIRE Column */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase tracking-wide border-b border-gray-200 pb-2">Goals & Projections</h3>
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
                    <div className="bg-gray-50 p-6 border-t border-gray-200 text-sm text-gray-500 flex justify-between">
                        <span>Account ID: {user.id}</span>
                        <span>Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                    </div>
                </div>
            </main>
        </div>
    );
};
