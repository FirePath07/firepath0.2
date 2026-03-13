import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { formatIndianCurrency } from '../utils/currency';
import confetti from 'canvas-confetti';
import { Target, Plus, Car, Laptop, Plane, AlertTriangle, CheckCircle2, Goal, X, Trash2, TrendingUp } from 'lucide-react';

export const FutureGoalsDashboard = () => {
    const { user, loading, updateFinancialData } = useAuth();
    const navigate = useNavigate();

    const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isAddSavingsOpen, setIsAddSavingsOpen] = useState(false);
    const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
    const [isSipPopupOpen, setIsSipPopupOpen] = useState(false);
    const [sipPopupData, setSipPopupData] = useState({ oldSip: 0, newSip: 0, goalSip: 0, goalName: '' });
    
    // Achievement State
    const [achievedGoal, setAchievedGoal] = useState<any | null>(null);

    // New Goal Form State
    const [goalName, setGoalName] = useState('');
    const [goalTarget, setGoalTarget] = useState('');
    const [goalSavings, setGoalSavings] = useState('');
    const [goalTimeline, setGoalTimeline] = useState(''); // in years
    const [goalCategory, setGoalCategory] = useState('Other');
    
    // Add Savings Form State
    const [addAmount, setAddAmount] = useState('');

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

    if (!user) return null;

    const { financialData } = user;
    const goals = financialData.goals || [];
    const monthlyIncome = financialData.monthlyIncome || 0;
    const monthlyExpenses = financialData.monthlyExpenses || 0;
    const monthlySurplus = Math.max(0, monthlyIncome - monthlyExpenses);
    const fireSip = financialData.defaultMonthlySIP || 0;

    const totalGoalsSip = goals.reduce((sum, goal) => {
        const remAmt = Math.max(0, goal.targetAmount - goal.currentSavings);
        const reqSip = goal.targetMonths > 0 ? remAmt / goal.targetMonths : 0;
        return sum + (reqSip > 0 && remAmt > 0 ? reqSip : 0);
    }, 0);

    const isLudicrous = (totalGoalsSip + fireSip) > monthlySurplus && monthlySurplus > 0;
    const totalBurnRate = ((totalGoalsSip + fireSip) / monthlySurplus) * 100;

    const handleCreateGoal = async () => {
        if (!goalName || !goalTarget || !goalTimeline) return;
        
        const targetYears = Number(goalTimeline);
        const targetMonths = targetYears * 12;
        const targetAmount = Number(goalTarget);
        const currentSavings = Number(goalSavings) || 0;
        
        if (isEditMode && selectedGoalId) {
            const updatedGoals = goals.map(g => {
                if (g.id === selectedGoalId) {
                    return {
                        ...g,
                        name: goalName,
                        targetAmount,
                        currentSavings,
                        targetMonths,
                        category: goalCategory
                    };
                }
                return g;
            });
            await updateFinancialData({ goals: updatedGoals });
            setIsEditMode(false);
            setSelectedGoalId(null);
        } else {
            const newGoal = {
                id: Date.now().toString(),
                name: goalName,
                targetAmount,
                currentSavings,
                targetMonths,
                category: goalCategory,
                createdAt: new Date().toISOString()
            };

            const updatedGoals = [...goals, newGoal];
            await updateFinancialData({ goals: updatedGoals });
            
            const remainingAmt = Math.max(0, targetAmount - currentSavings);
            const newGoalSip = targetMonths > 0 ? remainingAmt / targetMonths : 0;
            
            const activeGoalsSIP = goals.reduce((sum, goal) => {
                const remAmt = Math.max(0, goal.targetAmount - goal.currentSavings);
                const reqSip = goal.targetMonths > 0 ? remAmt / goal.targetMonths : 0;
                return sum + (reqSip > 0 && remAmt > 0 ? reqSip : 0);
            }, 0);
            
            const investmentSip = financialData.defaultMonthlySIP || 0;
            const oldOverall = investmentSip + activeGoalsSIP;
            const newOverall = oldOverall + newGoalSip;

            setSipPopupData({ oldSip: oldOverall, newSip: newOverall, goalSip: newGoalSip, goalName: goalName });
            setIsSipPopupOpen(true);
        }
        
        setGoalName('');
        setGoalTarget('');
        setGoalSavings('');
        setGoalTimeline('');
        setGoalCategory('Other');
        setIsAddGoalOpen(false);
    };

    const handleEditGoal = (goal: any) => {
        setGoalName(goal.name);
        setGoalTarget(goal.targetAmount.toString());
        setGoalSavings(goal.currentSavings.toString());
        setGoalTimeline((goal.targetMonths / 12).toString());
        setGoalCategory(goal.category);
        setSelectedGoalId(goal.id);
        setIsEditMode(true);
        setIsAddGoalOpen(true);
    };

    const handleDeleteGoal = async (id: string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this goal? This cannot be undone.");
        if (confirmDelete) {
            const updatedGoals = goals.filter(g => g.id !== id);
            await updateFinancialData({ goals: updatedGoals });
        }
    };

    const handleAddSavings = async () => {
        if (!selectedGoalId || !addAmount) return;
        
        const amountToAdd = Number(addAmount);
        if (amountToAdd <= 0) return;

        let goalReached = null;
        const updatedGoals = goals.map(g => {
            if (g.id === selectedGoalId) {
                const newSavings = g.currentSavings + amountToAdd;
                if (newSavings >= g.targetAmount && g.currentSavings < g.targetAmount) {
                    goalReached = { ...g, currentSavings: newSavings };
                }
                return { ...g, currentSavings: newSavings };
            }
            return g;
        });

        await updateFinancialData({ goals: updatedGoals });
        if (goalReached) {
            setAchievedGoal(goalReached);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#3b82f6', '#f59e0b']
            });
        }
        setAddAmount('');
        setIsAddSavingsOpen(false);
        setSelectedGoalId(null);
    };
    
    const getCategoryIcon = (cat: string) => {
        switch (cat) {
            case 'Vehicle': return <Car className="w-6 h-6" />;
            case 'Electronics': return <Laptop className="w-6 h-6" />;
            case 'Travel': return <Plane className="w-6 h-6" />;
            default: return <Goal className="w-6 h-6" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Navigation showFullNav={true} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                    <div className="relative z-10">
                        <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-3 tracking-tighter italic">Future <span className="text-emerald-500">Goals</span></h1>
                        <div className="flex flex-wrap gap-4 items-center">
                            <p className="text-gray-500 dark:text-gray-400 font-bold max-w-xl">
                                Separate your dreams from your retirement. Track big purchases without risking your FIRE path.
                            </p>
                            <div className="px-5 py-2 bg-gray-100 dark:bg-gray-700/50 rounded-2xl border border-gray-200 dark:border-gray-600">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Available Surplus</p>
                                <p className="text-lg font-black text-gray-900 dark:text-white">{formatIndianCurrency(monthlySurplus)} <span className="text-[10px] text-gray-400">/mo</span></p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => { setIsEditMode(false); setGoalName(''); setGoalTarget(''); setGoalSavings(''); setGoalTimeline(''); setGoalCategory('Other'); setIsAddGoalOpen(true); }}
                        className="px-10 py-5 bg-black dark:bg-white text-white dark:text-black font-black rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 relative z-10 group"
                    >
                        <Plus className="w-6 h-6 stroke-[4] group-hover:rotate-90 transition-transform duration-500" /> 
                        <span className="uppercase tracking-widest text-xs">Create New Goal</span>
                    </button>
                </div>

                {/* Extreme Warning System */}
                {isLudicrous && (
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="mb-12 p-8 bg-rose-500 text-white rounded-[3rem] shadow-2xl shadow-rose-500/40 relative overflow-hidden"
                    >
                        <div className="absolute right-0 bottom-0 opacity-10 -mr-10 -mb-10">
                            <AlertTriangle size={200} />
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shrink-0 animate-pulse">
                                <AlertTriangle size={40} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 italic">⚠️ Plan Feasibility: CRITICAL</h2>
                                <p className="text-rose-100 font-bold text-lg leading-relaxed max-w-3xl">
                                    Your total monthly commitment <span className="text-white bg-black/20 px-2 rounded-lg">{formatIndianCurrency(totalGoalsSip + fireSip)}</span> exceeds your surplus <span className="text-white bg-black/20 px-2 rounded-lg">{formatIndianCurrency(monthlySurplus)}</span>. 
                                    This plan is mathematically impossible and will eat into your essential expenses or debt. Delay some goals or increase income immediately!
                                </p>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <div className="px-4 py-2 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest">FIRE Requirement: {formatIndianCurrency(fireSip)}</div>
                                    <div className="px-4 py-2 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest">Goals Requirement: {formatIndianCurrency(totalGoalsSip)}</div>
                                    <div className="px-4 py-2 bg-black/20 rounded-full text-xs font-black uppercase tracking-widest text-rose-200">Allocation: {totalBurnRate.toFixed(0)}% of Surplus</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Goals List */}
                {goals.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-16 text-center border border-gray-100 dark:border-gray-700">
                        <div className="inline-flex items-center justify-center p-6 bg-emerald-50 dark:bg-emerald-900/30 rounded-full mb-6">
                            <Target className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Future Goals Set</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-8">
                            Want to throw a big wedding, buy a new laptop, or go on vacation? Setup an independent goal track outside of your FIRE portfolio here!
                        </p>
                        <button
                            onClick={() => setIsAddGoalOpen(true)}
                            className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition"
                        >
                            Create First Goal
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {goals.map((goal, idx) => {
                            const remainingAmt = Math.max(0, goal.targetAmount - goal.currentSavings);
                            const requiredSip = goal.targetMonths > 0 ? remainingAmt / goal.targetMonths : 0;
                            const progress = Math.min(100, (goal.currentSavings / goal.targetAmount) * 100);
                            const isComplete = progress >= 100;
                            
                            const isChallenging = requiredSip > monthlySurplus && !isComplete;

                            return (
                                <motion.div 
                                    key={goal.id} 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden group hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 flex flex-col relative"
                                >
                                    {isComplete && (
                                        <div className="absolute top-0 right-0 p-6 z-10">
                                            <div className="bg-emerald-500 text-white p-2 rounded-full shadow-lg shadow-emerald-500/40">
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="p-8 flex-1">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:bg-emerald-500 transition-all duration-500 shadow-inner">
                                                    {getCategoryIcon(goal.category)}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-2xl text-gray-900 dark:text-white tracking-tight">{goal.name}</h3>
                                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest">{goal.category}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                 <button
                                                    onClick={() => handleEditGoal(goal)}
                                                    title="Quick Edit"
                                                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-all border border-transparent hover:border-emerald-200"
                                                >
                                                    <Target className="w-5 h-5" /> 
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteGoal(goal.id)}
                                                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all border border-transparent hover:border-rose-200"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 mb-8">
                                            <div className="bg-gray-50/50 dark:bg-gray-900/50 p-5 rounded-3xl border border-gray-100 dark:border-gray-800">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Target Goal</p>
                                                <p className="text-xl font-black text-gray-900 dark:text-white">{formatIndianCurrency(goal.targetAmount)}</p>
                                            </div>
                                            <div className="bg-emerald-50/30 dark:bg-emerald-900/10 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-900/20">
                                                <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">Target Year</p>
                                                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                                                    {new Date(new Date().setMonth(new Date().getMonth() + goal.targetMonths)).getFullYear()}
                                                    <span className="text-xs font-bold ml-1">({(goal.targetMonths / 12).toFixed(1)}y)</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mb-8 p-6 bg-gray-50/50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Savings Progress</span>
                                                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full">{progress.toFixed(0)}%</span>
                                            </div>
                                            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700/50 rounded-full overflow-hidden shadow-inner mb-4">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ duration: 1.5, ease: "circOut" }}
                                                    className={`h-full rounded-full shadow-lg ${isComplete ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'}`} 
                                                />
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <p className="font-bold text-gray-500 dark:text-gray-400">{formatIndianCurrency(goal.currentSavings)}</p>
                                                <p className="font-bold text-gray-900 dark:text-white">Goal: {formatIndianCurrency(goal.targetAmount)}</p>
                                            </div>
                                        </div>

                                        {isChallenging && !isLudicrous && (
                                            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-2xl mb-4">
                                                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold leading-tight uppercase tracking-wider">
                                                    Timeline Tight: Consider increasing initial savings or delaying goal.
                                                </p>
                                            </div>
                                        )}
                                        {isLudicrous && (
                                            <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 rounded-2xl mb-4">
                                                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                                                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-black leading-tight uppercase tracking-wider">
                                                    UNSUSTAINABLE: Combined plan exceeds surplus!
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="px-8 pb-8 flex gap-3">
                                        {!isComplete ? (
                                            <>
                                                <button 
                                                    onClick={() => { setSelectedGoalId(goal.id); setIsAddSavingsOpen(true); }}
                                                    className="flex-[2] py-4 bg-black dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-1 active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                                                >
                                                    <Plus className="w-4 h-4 stroke-[4]" /> Add Funds
                                                </button>
                                                <button 
                                                    onClick={() => handleEditGoal(goal)}
                                                    className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-black rounded-2xl hover:bg-gray-200 transition-all text-[10px] uppercase tracking-widest"
                                                >
                                                    Settings
                                                </button>
                                            </>
                                        ) : (
                                            <div className="w-full py-4 bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-black rounded-2xl flex items-center justify-center gap-3">
                                                <CheckCircle2 className="w-5 h-5" /> MILESTONE ACHIEVED
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* MODALS */}
            <AnimatePresence>
                {/* Add Goal Modal */}
                {isAddGoalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative border border-gray-100 dark:border-gray-700"
                        >
                            <button onClick={() => { setIsAddGoalOpen(false); setIsEditMode(false); }} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">{isEditMode ? 'Edit Goal' : 'Create Goal'}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-medium">Set a target separate from your FIRE corpus.</p>

                            <div className="space-y-6 mb-10">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Goal Identity</label>
                                    <input
                                        type="text"
                                        value={goalName}
                                        onChange={(e) => setGoalName(e.target.value)}
                                        placeholder="e.g. Tesla Model 3"
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Target (₹)</label>
                                        <input
                                            type="number"
                                            value={goalTarget}
                                            onChange={(e) => setGoalTarget(e.target.value)}
                                            placeholder="800000"
                                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Initial (₹)</label>
                                        <input
                                            type="number"
                                            value={goalSavings}
                                            onChange={(e) => setGoalSavings(e.target.value)}
                                            placeholder="50000"
                                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Horizon (Years)</label>
                                        <input
                                            type="number"
                                            value={goalTimeline}
                                            onChange={(e) => setGoalTimeline(e.target.value)}
                                            placeholder="3"
                                            step="0.1"
                                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                                        <select
                                            value={goalCategory}
                                            onChange={(e) => setGoalCategory(e.target.value)}
                                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="Vehicle">Vehicle</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Travel">Travel</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleCreateGoal}
                                disabled={!goalName || !goalTarget || !goalTimeline}
                                className="w-full py-5 bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-500 dark:disabled:bg-gray-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1 active:scale-95 transition-all text-sm uppercase tracking-widest"
                            >
                                {isEditMode ? 'Update Goal Settings' : 'Initialize Goal Tracker'}
                            </button>
                        </motion.div>
                    </div>
                )}

                {/* Add Savings Modal */}
                {isAddSavingsOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative border border-gray-100 dark:border-gray-700"
                        >
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Update Savings</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Deposit money directly into this separate goal framework.</p>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Add Amount (₹)</label>
                                <input
                                    type="number"
                                    value={addAmount}
                                    onChange={(e) => setAddAmount(e.target.value)}
                                    placeholder="e.g. 15000"
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-extrabold text-2xl text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none text-center"
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setIsAddSavingsOpen(false); setSelectedGoalId(null); setAddAmount(''); }}
                                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddSavings}
                                    disabled={!addAmount || Number(addAmount) <= 0}
                                    className="flex-1 py-3 bg-emerald-600 disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg transition"
                                >
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
                              {/* SIP Change Modal */}
                {isSipPopupOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl relative border border-gray-100 dark:border-gray-700 text-center"
                        >
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl mb-8 shadow-inner">
                                <TrendingUp className="w-10 h-10" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Active SIP Shift</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 font-medium leading-relaxed">
                                Planning for <strong>{sipPopupData.goalName}</strong> adds {formatIndianCurrency(sipPopupData.goalSip)} to your monthly goal-based commitment.
                            </p>
                            
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-6 mb-8 border border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between items-center mb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    <span>Old Overall SIP</span>
                                    <span>{formatIndianCurrency(sipPopupData.oldSip)}</span>
                                </div>
                                <div className="h-px bg-gray-200 dark:bg-gray-700 w-full mb-4"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-black text-gray-600 dark:text-gray-300">New Target SIP</span>
                                    <span className="text-xl font-black text-emerald-500">{formatIndianCurrency(sipPopupData.newSip)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsSipPopupOpen(false)}
                                className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1 active:scale-95 transition-all uppercase tracking-widest text-xs"
                            >
                                Acknowledge & Activate
                            </button>
                        </motion.div>
                    </div>
                )}

                {/* Achievement Modal */}
                {achievedGoal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-gray-800 rounded-[3rem] p-12 max-w-md w-full shadow-[0_0_100px_rgba(16,185,129,0.2)] relative border-4 border-emerald-500 text-center"
                        >
                            <motion.div 
                                animate={{ 
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute -top-10 left-1/2 -translate-x-1/2 w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/50"
                            >
                                <CheckCircle2 className="w-12 h-12 text-white" />
                            </motion.div>
                            
                            <h3 className="text-4xl font-black text-gray-900 dark:text-white mt-8 mb-4 tracking-tight">Milestone Unlocked!</h3>
                            <p className="text-gray-500 dark:text-gray-400 font-bold mb-8 leading-relaxed">
                                Congratulations! You have fully funded <strong>{achievedGoal.name}</strong>. You can now revert your monthly commitment back to its original value.
                            </p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setAchievedGoal(null)}
                                    className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all uppercase tracking-widest text-xs"
                                >
                                    Continue with Current SIP
                                </button>
                                <button
                                    onClick={async () => {
                                        if (achievedGoal) {
                                            const updatedGoals = goals.filter(g => g.id !== achievedGoal.id);
                                            
                                            // Add as an expense when finished
                                            const categoryMapping: Record<string, string> = {
                                                'Vehicle': 'Transport',
                                                'Electronics': 'Shopping',
                                                'Travel': 'Travel',
                                                'Other': 'Miscellaneous'
                                            };

                                            const newExpense = {
                                                id: Date.now().toString(),
                                                amount: achievedGoal.targetAmount,
                                                description: `Goal Achieved: ${achievedGoal.name}`,
                                                category: categoryMapping[achievedGoal.category] || 'Miscellaneous',
                                                date: new Date().toISOString().split('T')[0],
                                                notes: `Successfully completed future goal: ${achievedGoal.name}`,
                                                taggedGoalId: achievedGoal.id
                                            };

                                            const updatedExpenses = [...(financialData.expensesList || []), newExpense];
                                            
                                            await updateFinancialData({ 
                                                goals: updatedGoals,
                                                expensesList: updatedExpenses
                                            });
                                            setAchievedGoal(null);
                                        }
                                    }}
                                    className="w-full py-5 bg-rose-600 text-white font-black rounded-2xl shadow-xl hover:shadow-rose-500/30 hover:-translate-y-1 transition-all uppercase tracking-widest text-xs"
                                >
                                    Finish Goal & Record Expense
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
