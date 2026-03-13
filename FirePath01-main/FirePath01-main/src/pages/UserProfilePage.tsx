import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { SettingsModal } from '../components/SettingsModal';
import { formatIndianCurrency } from '../utils/currency';
import { calculateFIREMetrics } from '../utils/finance';
import { motion } from 'framer-motion';
import { 
    Wallet, TrendingUp, Target, Shield, 
    Calendar, User, Mail, ChevronLeft, 
    Edit3, Award, ArrowUpRight, PieChart
} from 'lucide-react';

export const UserProfilePage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        if (loading) return;
        if (!user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

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
        fireNumber,
        estimatedRetirementAge,
        currentTotalWealth,
        savingsRate
    } = calculateFIREMetrics(financialData);

    const StatCard = ({ icon: Icon, label, value, subtext, color }: any) => (
        <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all h-full"
        >
            <div className={`p-3 rounded-xl ${color} w-fit mb-4`}>
                <Icon size={24} />
            </div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</p>
            <h4 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{value}</h4>
            {subtext && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">{subtext}</p>}
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Navigation showFullNav={true} />
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Breadcrumbs & Title */}
                <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <button
                            onClick={() => navigate('/profile')}
                            className="group text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold flex items-center gap-2 transition mb-2"
                        >
                            <ChevronLeft size={20} className="transition-transform group-hover:-translate-x-1" />
                            Back to Dashboard
                        </button>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Your Profile</h1>
                    </div>
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                        <Edit3 size={18} /> Update Details
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Identity & Contact */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                            <div className="h-24 bg-gradient-to-r from-emerald-500 to-teal-600" />
                            <div className="px-8 pb-8 -mt-12 text-center">
                                <div className="inline-block relative">
                                    <div className="w-24 h-24 bg-white dark:bg-gray-900 rounded-full p-1 shadow-xl">
                                        <div className="w-full h-full bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-3xl font-black text-emerald-700 dark:text-emerald-300">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full flex items-center justify-center">
                                        <Shield size={12} className="text-white" />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">{user.name}</h2>
                                <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mt-1">
                                    <Mail size={14} />
                                    <span className="text-sm font-medium">{user.email}</span>
                                </div>
                                
                                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700 space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <Calendar size={16} /> Member Since
                                        </span>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <User size={16} /> Current Age
                                        </span>
                                        <span className="font-bold text-gray-900 dark:text-white">{financialData.age} Years</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Tip Card */}
                        <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-20">
                                <Award size={100} />
                            </div>
                            <h4 className="text-lg font-bold mb-2 flex items-center gap-2 italic">
                                <Target size={20} className="text-emerald-400" /> FIRE Strategy
                            </h4>
                            <p className="text-sm text-emerald-100/80 leading-relaxed font-medium">
                                Your <span className="text-emerald-300 font-bold">{financialData.riskProfile}</span> is optimized for your target retirement age of {financialData.targetRetirementAge}.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Financial Data Cards */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Featured Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <motion.div 
                                    whileHover={{ scale: 1.01 }}
                                    className="bg-white dark:bg-gray-800 p-8 rounded-3xl border-2 border-emerald-500 shadow-xl shadow-emerald-500/5 transition-all relative overflow-hidden"
                                >
                                    <div className="absolute -right-8 -bottom-8 opacity-5 dark:opacity-10 text-emerald-500">
                                        <Wallet size={160} />
                                    </div>
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                                        <div>
                                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest text-xs mb-3">
                                                <TrendingUp size={14} /> Live Portfolio Value
                                            </div>
                                            <p className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
                                                {formatIndianCurrency(currentTotalWealth)}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                                                Initial Savings + Recorded Growth
                                            </p>
                                        </div>
                                        <div className="bg-emerald-50 dark:bg-emerald-900/30 px-6 py-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 text-right">
                                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">Savings Rate</span>
                                            <p className="text-2xl font-black text-emerald-800 dark:text-emerald-200">{savingsRate}%</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            <StatCard 
                                icon={ArrowUpRight} 
                                label="Monthly Income" 
                                value={formatIndianCurrency(annualIncome / 12)} 
                                subtext="Pre-tax estimate"
                                color="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                            />
                            <StatCard 
                                icon={PieChart} 
                                label="Monthly Expenses" 
                                value={formatIndianCurrency(annualExpenses / 12)} 
                                subtext="Core lifestyle spending"
                                color="bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400"
                            />
                            <StatCard 
                                icon={Target} 
                                label="FIRE Target Amount" 
                                value={formatIndianCurrency(fireNumber)} 
                                subtext="Target for financial freedom"
                                color="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400"
                            />
                            <StatCard 
                                icon={Calendar} 
                                label="Est. Retirement Age" 
                                value={`${Math.round(estimatedRetirementAge)} Years`} 
                                subtext={`Target: ${financialData.targetRetirementAge} Years`}
                                color="bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400"
                            />
                        </div>

                        {/* Section Header */}
                        <div className="pt-4">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                                <Shield size={20} className="text-emerald-500" /> Account Security & Metadata
                            </h3>
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 flex flex-col md:flex-row justify-between gap-4 text-sm">
                                <div className="space-y-1">
                                    <p className="text-gray-400 uppercase font-bold text-[10px]">Unique Account Identifier</p>
                                    <p className="text-gray-700 dark:text-gray-300 font-mono font-medium">{user.id}</p>
                                </div>
                                <div className="md:text-right space-y-1">
                                    <p className="text-gray-400 uppercase font-bold text-[10px]">Data Locality</p>
                                    <p className="text-gray-700 dark:text-gray-300 font-medium">Cloud Infrastructure (Encrypted)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
