import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { formatIndianCurrency } from '../utils/currency';
import { Target, Plus, Car, Laptop, Plane, AlertTriangle, CheckCircle2, Goal, X, Trash2, TrendingUp } from 'lucide-react';

export const FutureGoalsDashboard = () => {
    const { user, updateFinancialData } = useAuth();
    const navigate = useNavigate();

    const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
    const [isAddSavingsOpen, setIsAddSavingsOpen] = useState(false);
    const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
    const [isSipPopupOpen, setIsSipPopupOpen] = useState(false);
    const [sipPopupData, setSipPopupData] = useState({ oldSip: 0, newSip: 0, goalSip: 0, goalName: '' });

    // New Goal Form State
    const [goalName, setGoalName] = useState('');
    const [goalTarget, setGoalTarget] = useState('');
    const [goalSavings, setGoalSavings] = useState('');
    const [goalTimeline, setGoalTimeline] = useState(''); // in months
    const [goalCategory, setGoalCategory] = useState('Other');

    // Add Savings Form State
    const [addAmount, setAddAmount] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return null;

    const { financialData } = user;
    const goals = financialData.goals || [];
    const monthlySurplus = Math.max(0, (financialData.monthlyIncome || 0) - (financialData.monthlyExpenses || 0));

    const handleCreateGoal = async () => {
        if (!goalName || !goalTarget || !goalTimeline) return;
        
        const targetMonths = Number(goalTimeline);
        const targetAmount = Number(goalTarget);
        const currentSavings = Number(goalSavings) || 0;
        
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
        
        setGoalName('');
        setGoalTarget('');
        setGoalSavings('');
        setGoalTimeline('');
        setGoalCategory('Other');
        setIsAddGoalOpen(false);
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

        const updatedGoals = goals.map(g => {
            if (g.id === selectedGoalId) {
                return { ...g, currentSavings: g.currentSavings + amountToAdd };
            }
            return g;
        });

        await updateFinancialData({ goals: updatedGoals });
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Future Goals Planner</h1>
                        <p className="text-emerald-600 dark:text-emerald-400 font-medium tracking-wide">
                            Track and visualize personal purchases independently from your FIRE investments.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsAddGoalOpen(true)}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl shadow-[0_10px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_30px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Add New Goal
                    </button>
                </div>

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
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden group hover:shadow-2xl transition duration-300 flex flex-col"
                                >
                                    <div className="p-6 md:p-8 flex-1">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl group-hover:bg-emerald-100 group-hover:text-emerald-600 dark:group-hover:bg-emerald-900/50 dark:group-hover:text-emerald-400 transition">
                                                    {getCategoryIcon(goal.category)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-xl text-gray-900 dark:text-white truncate max-w-[150px]">{goal.name}</h3>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">{goal.category}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <button
                                                    onClick={() => handleDeleteGoal(goal.id)}
                                                    className="text-gray-400 hover:text-rose-500 transition -mt-2 -mr-2 p-2"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Target</p>
                                                    <p className="font-extrabold text-lg text-emerald-600 dark:text-emerald-400">{formatIndianCurrency(goal.targetAmount)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Saved</p>
                                                <p className="font-bold text-gray-900 dark:text-white">{formatIndianCurrency(goal.currentSavings)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Required SIP</p>
                                                <p className="font-bold text-blue-600 dark:text-blue-400">{formatIndianCurrency(requiredSip)}<span className="text-xs font-normal">/mo</span></p>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">Progress</span>
                                                <span className="text-sm font-black text-gray-900 dark:text-white">{progress.toFixed(1)}%</span>
                                            </div>
                                            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className={`h-full ${isComplete ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-emerald-400'}`} 
                                                />
                                            </div>
                                        </div>

                                        {isChallenging && (
                                            <div className="flex items-start gap-2 mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                                                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0" />
                                                <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                                                    Required saving ({formatIndianCurrency(requiredSip)}) exceeds your monthly surplus. Consider extending the timeline!
                                                </p>
                                            </div>
                                        )}
                                        
                                        {isComplete && (
                                            <div className="flex items-center gap-2 mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl justify-center font-bold text-emerald-700 dark:text-emerald-400">
                                                <CheckCircle2 className="w-5 h-5" /> Goal Reached!
                                            </div>
                                        )}
                                    </div>

                                    {!isComplete && (
                                        <button 
                                            onClick={() => { setSelectedGoalId(goal.id); setIsAddSavingsOpen(true); }}
                                            className="w-full py-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 text-gray-800 dark:text-white font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" /> Add Savings
                                        </button>
                                    )}
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
                            className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-gray-100 dark:border-gray-700"
                        >
                            <button onClick={() => setIsAddGoalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X className="w-6 h-6" />
                            </button>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create Future Goal</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Set a specific savings target entirely separate from your FIRE corpus.</p>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Goal Name</label>
                                    <input
                                        type="text"
                                        value={goalName}
                                        onChange={(e) => setGoalName(e.target.value)}
                                        placeholder="e.g. Buy a Car, Europe Trip"
                                        className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Target (₹)</label>
                                        <input
                                            type="number"
                                            value={goalTarget}
                                            onChange={(e) => setGoalTarget(e.target.value)}
                                            placeholder="800000"
                                            className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Saved (₹)</label>
                                        <input
                                            type="number"
                                            value={goalSavings}
                                            onChange={(e) => setGoalSavings(e.target.value)}
                                            placeholder="50000"
                                            className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Timeline (Months)</label>
                                        <input
                                            type="number"
                                            value={goalTimeline}
                                            onChange={(e) => setGoalTimeline(e.target.value)}
                                            placeholder="36"
                                            className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                                        <select
                                            value={goalCategory}
                                            onChange={(e) => setGoalCategory(e.target.value)}
                                            className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
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
                                className="w-full py-4 bg-emerald-600 disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition"
                            >
                                Start Goal Tracker
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
                            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative border border-gray-700 text-center"
                        >
                            <div className="inline-flex items-center justify-center p-4 bg-emerald-500/20 text-emerald-400 rounded-full mb-6">
                                <TrendingUp className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">Goal SIP Added!</h3>
                            <p className="text-gray-400 text-sm mb-6">
                                Planning for <strong>{sipPopupData.goalName}</strong> will require {formatIndianCurrency(sipPopupData.goalSip)} per month. Here is your new financial commitment:
                            </p>
                            
                            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-5 mb-6 border border-gray-700/50">
                                <div className="flex justify-between items-center mb-4 text-sm font-medium text-gray-400">
                                    <span>Previous Overall SIP</span>
                                    <span>{formatIndianCurrency(sipPopupData.oldSip)}</span>
                                </div>
                                <div className="h-px bg-gray-700 w-full mb-4"></div>
                                <div className="flex justify-between items-center text-lg">
                                    <span className="font-bold text-gray-300">New Overall SIP</span>
                                    <span className="font-black text-emerald-400">{formatIndianCurrency(sipPopupData.newSip)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsSipPopupOpen(false)}
                                className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-500 transition"
                            >
                                Got It!
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
