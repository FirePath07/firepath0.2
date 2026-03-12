import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { formatIndianCurrency } from '../utils/currency';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area,
} from 'recharts';
import {
    Wallet, TrendingUp, TrendingDown, AlertTriangle, Info, Plus,
    Trash2, Calendar, ShoppingCart, Home, Coffee, Car,
    Activity, Music, Heart, Smartphone, MoreHorizontal, CheckCircle2,
    ChevronDown, ChevronUp, Zap, Sparkles, Target, Plane
} from 'lucide-react';

const CATEGORIES = [
    { name: 'Housing', icon: Home, color: '#3b82f6' },
    { name: 'Food', icon: Coffee, color: '#f59e0b' },
    { name: 'Transport', icon: Car, color: '#10b981' },
    { name: 'Shopping', icon: ShoppingCart, color: '#ec4899' },
    { name: 'Travel', icon: Plane, color: '#06b6d4' },
    { name: 'Entertainment', icon: Music, color: '#8b5cf6' },
    { name: 'Health', icon: Heart, color: '#ef4444' },
    { name: 'Subscriptions', icon: Smartphone, color: '#6366f1' },
    { name: 'Utilities', icon: Zap, color: '#facc15' },
    { name: 'Miscellaneous', icon: MoreHorizontal, color: '#64748b' }
];

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

export const ExpensesPage = () => {
    const { user, updateFinancialData } = useAuth();
    const navigate = useNavigate();

    // Form State
    const [expenseName, setExpenseName] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseCategory, setExpenseCategory] = useState('Miscellaneous');
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
    const [expenseNotes, setExpenseNotes] = useState('');
    const [taggedGoalId, setTaggedGoalId] = useState('');
    const [showForm, setShowForm] = useState(false);

    if (!user) {
        navigate('/');
        return null;
    }

    const { financialData } = user;
    const expensesList = financialData.expensesList || [];
    const goals = financialData.goals || [];
    const monthlyIncome = financialData.monthlyIncome || 0;
    const fireSip = financialData.defaultMonthlySIP || 0;

    // Derived Calculations
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthExpenses = expensesList.filter(exp => {
        const d = new Date(exp.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalMonthlyExpenses = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    const activeGoalsSIP = goals.reduce((sum, goal) => {
        const remainingAmt = Math.max(0, goal.targetAmount - goal.currentSavings);
        const reqSip = goal.targetMonths > 0 ? remainingAmt / goal.targetMonths : 0;
        return sum + (reqSip > 0 && remainingAmt > 0 ? reqSip : 0);
    }, 0);

    const totalInvestments = fireSip + activeGoalsSIP;
    const remainingBalance = monthlyIncome - totalMonthlyExpenses - totalInvestments;

    // Chart Data
    const categoryData = useMemo(() => {
        const data = CATEGORIES.map(cat => ({
            name: cat.name,
            value: currentMonthExpenses
                .filter(exp => exp.category === cat.name)
                .reduce((sum, exp) => sum + exp.amount, 0),
            color: cat.color
        })).filter(d => d.value > 0);
        return data;
    }, [currentMonthExpenses]);

    const trendData = useMemo(() => {
        // Mocking last 4 months for trend visual
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const last4 = [];
        for (let i = 3; i >= 0; i--) {
            const m = (currentMonth - i + 12) % 12;
            const y = currentMonth - i < 0 ? currentYear - 1 : currentYear;
            const total = expensesList
                .filter(exp => {
                    const d = new Date(exp.date);
                    return d.getMonth() === m && d.getFullYear() === y;
                })
                .reduce((sum, exp) => sum + exp.amount, 0);

            last4.push({ name: months[m], amount: total });
        }
        return last4;
    }, [expensesList, currentMonth]);

    // Impact Logic
    const fireImpact = useMemo(() => {
        const deficit = -remainingBalance;
        if (deficit <= 0) return { type: 'positive', text: `Saving ${formatIndianCurrency(remainingBalance)} extra! You could reach FIRE ${Math.floor(remainingBalance / 5000) + 1} months earlier if this surplus is invested.` };

        // Simple heuristic: if we under-invest by X, timeline shifts
        const monthsShift = Math.ceil(deficit / (fireSip || 5000) * 1.5);
        return { type: 'negative', text: `Current overspending could extend your FIRE timeline by approximately ${monthsShift} months.` };
    }, [remainingBalance, fireSip]);

    const goalImpact = useMemo(() => {
        if (remainingBalance >= 0) return { type: 'positive', text: "All future goals are on track. Keep it up!" };
        const deficit = Math.abs(remainingBalance);
        return { type: 'negative', text: `At this spending level, your next major goal might be delayed by ${Math.ceil(deficit / 3000)} months.` };
    }, [remainingBalance]);

    // Handle Actions
    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = Number(expenseAmount);
        if (amount <= 0 || !expenseName.trim()) return;

        const newExpense = {
            id: Date.now().toString(),
            amount,
            description: expenseName.trim(),
            category: expenseCategory,
            date: expenseDate,
            notes: expenseNotes,
            taggedGoalId: taggedGoalId || undefined
        };

        const newExpensesList = [...expensesList, newExpense];
        await updateFinancialData({ expensesList: newExpensesList });

        setExpenseName('');
        setExpenseAmount('');
        setExpenseNotes('');
        setTaggedGoalId('');
        setShowForm(false);
    };

    const handleDeleteExpense = async (id: string) => {
        if (!window.confirm("Delete this expense?")) return;
        const newExpensesList = expensesList.filter(exp => exp.id !== id);
        await updateFinancialData({ expensesList: newExpensesList });
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f1a] transition-colors duration-500 pb-20">
            <Navigation showFullNav={true} />

            <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12">

                {/* Section 4: Monthly Summary Panel */}
                <div className="bg-white dark:bg-slate-800/40 rounded-[3rem] p-8 md:p-12 mb-12 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700/50">
                    <div className="flex flex-col lg:flex-row justify-between gap-12">
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-8">
                            <SummaryCard label="Monthly Income" value={monthlyIncome} icon={Wallet} color="emerald" />
                            <SummaryCard label="Total Expenses" value={totalMonthlyExpenses} icon={ShoppingCart} color="rose" />
                            <SummaryCard label="Investments" value={totalInvestments} icon={Activity} color="blue" />
                            <SummaryCard
                                label="Remaining"
                                value={remainingBalance}
                                icon={remainingBalance >= 0 ? TrendingUp : TrendingDown}
                                color={remainingBalance >= 0 ? "emerald" : "rose"}
                            />
                        </div>
                    </div>
                    {remainingBalance < 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-10 flex items-center gap-4 bg-rose-500/10 border border-rose-500/20 p-6 rounded-[2rem] text-rose-600 dark:text-rose-400"
                        >
                            <AlertTriangle className="animate-bounce" />
                            <p className="font-black text-sm uppercase tracking-widest">Budget Alert: You are spending more than your remaining balance!</p>
                        </motion.div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Column: Input & History */}
                    <div className="lg:col-span-7 space-y-12">

                        {/* Section 3: Expense Input System */}
                        <div className="bg-white dark:bg-slate-800/40 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-700/50 shadow-xl overflow-hidden relative">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                    <Plus className="text-emerald-500" /> Log Transaction
                                </h2>
                                <button
                                    onClick={() => setShowForm(!showForm)}
                                    className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-emerald-500 hover:text-white transition-all"
                                >
                                    {showForm ? <ChevronUp /> : <ChevronDown />}
                                </button>
                            </div>

                            <AnimatePresence>
                                {showForm && (
                                    <motion.form
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        onSubmit={handleAddExpense}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Expense Name</label>
                                                <input
                                                    type="text"
                                                    value={expenseName}
                                                    onChange={(e) => setExpenseName(e.target.value)}
                                                    placeholder="e.g. Weekly Groceries"
                                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Amount (₹)</label>
                                                <div className="relative group">
                                                    <input
                                                        type="number"
                                                        value={expenseAmount}
                                                        onChange={(e) => setExpenseAmount(e.target.value)}
                                                        placeholder="0.00"
                                                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white font-bold text-lg"
                                                        required
                                                    />
                                                    <div className="flex gap-2 mt-3">
                                                        {QUICK_AMOUNTS.map(amt => (
                                                            <button
                                                                key={amt}
                                                                type="button"
                                                                onClick={() => setExpenseAmount(amt.toString())}
                                                                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 dark:text-slate-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
                                                            >
                                                                ₹{amt}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Category</label>
                                                <div className="flex flex-wrap gap-3 mt-2">
                                                    {CATEGORIES.slice(0, 5).map(cat => (
                                                        <button
                                                            key={cat.name}
                                                            type="button"
                                                            onClick={() => setExpenseCategory(cat.name)}
                                                            className={`p-2 rounded-xl border transition-all flex items-center gap-2 ${expenseCategory === cat.name ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-emerald-500'}`}
                                                        >
                                                            <cat.icon size={14} />
                                                            <span className="text-[10px] font-bold">{cat.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                                <select
                                                    value={expenseCategory}
                                                    onChange={(e) => setExpenseCategory(e.target.value)}
                                                    className="w-full mt-3 px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white appearance-none cursor-pointer"
                                                >
                                                    {CATEGORIES.map(cat => (
                                                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Date</label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                                    <input
                                                        type="date"
                                                        value={expenseDate}
                                                        onChange={(e) => setExpenseDate(e.target.value)}
                                                        className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Link to Goal (Optional)</label>
                                                <select
                                                    value={taggedGoalId}
                                                    onChange={(e) => setTaggedGoalId(e.target.value)}
                                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white appearance-none"
                                                >
                                                    <option value="">No specific goal</option>
                                                    {goals.map(goal => (
                                                        <option key={goal.id} value={goal.id}>{goal.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Notes</label>
                                                <input
                                                    type="text"
                                                    value={expenseNotes}
                                                    onChange={(e) => setExpenseNotes(e.target.value)}
                                                    placeholder="Add context..."
                                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full py-5 bg-gradient-to-r from-emerald-600 to-emerald-400 text-white font-black rounded-3xl shadow-xl shadow-emerald-500/30 hover:-translate-y-1 transition-all uppercase tracking-widest text-xs"
                                        >
                                            Record Transaction
                                        </button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Recent History */}
                        <div className="bg-white dark:bg-slate-800/40 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-700/50 shadow-xl">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                                <HistoryIcon className="text-slate-400" /> Transaction Logs
                            </h2>
                            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 no-scrollbar">
                                {expensesList.length === 0 ? (
                                    <div className="py-20 text-center opacity-30 italic font-bold">No transactions found...</div>
                                ) : (
                                    [...expensesList].reverse().map((exp) => (
                                        <ExpenseRow key={exp.id} expense={exp} onDelete={() => handleDeleteExpense(exp.id)} goals={goals} />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Analysis & Insights */}
                    <div className="lg:col-span-5 space-y-12">

                        {/* Section 6 & 7: Impact Panels */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

                            <h2 className="text-xl font-black mb-10 flex items-center gap-3 italic">
                                <Sparkles className="text-emerald-400" /> Dynamic Intelligence
                            </h2>

                            <div className="space-y-10">
                                {/* FIRE Impact */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Impact on FIRE Progress</p>
                                    <div className={`p-6 rounded-[2rem] border ${fireImpact.type === 'negative' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                                        <p className="text-sm font-bold leading-relaxed">{fireImpact.text}</p>
                                    </div>
                                </div>

                                {/* Goals Impact */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Impact on Future Goals</p>
                                    <div className={`p-6 rounded-[2rem] border ${goalImpact.type === 'negative' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                                        <p className="text-sm font-bold leading-relaxed">{goalImpact.text}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 8: Smart Suggestions */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Smart Insights</p>
                            <div className="grid grid-cols-1 gap-4">
                                <InsightCard
                                    text={remainingBalance < 0 ? "You've exceeded your budget. Try cutting down on non-essentials like Shopping for the next few days." : "Great job staying within budget! Consider moving your surplus to your high-interest investments."}
                                    variant={remainingBalance < 0 ? 'warning' : 'success'}
                                />
                                {categoryData.find(d => d.name === 'Food' && d.value > monthlyIncome * 0.2) && (
                                    <InsightCard text="Dining expenses are quite high this month (over 20% of income). Cooking at home could save you ₹2,000+." variant="info" />
                                )}
                                <InsightCard text="Consistency is key. Regular logging helps our AI predict your savings with 95% more accuracy." variant="info" />
                            </div>
                        </div>

                        {/* Section 5 & 9: Visual Analysis */}
                        <div className="bg-white dark:bg-slate-800/40 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-700/50 shadow-xl">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 px-4">Spending Breakdown</h2>
                            {categoryData.length > 0 ? (
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={8}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center opacity-20">No data for chart</div>
                            )}
                        </div>

                        {/* Section 5: Monthly Trends */}
                        <div className="bg-white dark:bg-slate-800/40 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-700/50 shadow-xl">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 px-4">Monthly Trends</h2>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                                        <YAxis hide />
                                        <RechartsTooltip 
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                            itemStyle={{ color: '#10b981' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#10b981"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorAmount)"
                                            dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                                            activeDot={{ r: 6, strokeWidth: 0 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Section 5: Monthly Comparison */}
                        <div className="bg-white dark:bg-slate-800/40 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-700/50 shadow-xl">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 px-4">Monthly Comparison</h2>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={trendData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                        <YAxis hide />
                                        <RechartsTooltip />
                                        <Bar dataKey="amount" fill="#3b82f6" radius={[10, 10, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const SummaryCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700/50 hover:-translate-y-1 transition-all group">
        <div className={`p-4 rounded-2xl bg-${color}-500/10 text-${color}-500 w-fit mb-4 group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-xl font-black ${color === 'rose' && value > 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
            {formatIndianCurrency(value)}
        </p>
    </div>
);

const ExpenseRow = ({ expense, onDelete, goals }: any) => {
    const categoryInfo = CATEGORIES.find(c => c.name === expense.category) || CATEGORIES[8];
    const taggedGoal = goals.find((g: any) => g.id === expense.taggedGoalId);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900/30 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 group"
        >
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: categoryInfo.color }}>
                    <categoryInfo.icon size={22} />
                </div>
                <div>
                    <h4 className="font-black text-slate-900 dark:text-white mb-1">{expense.description}</h4>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{expense.category}</span>
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(expense.date).toLocaleDateString()}</span>
                        {taggedGoal && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full">
                                <Target size={10} />
                                <span className="text-[9px] font-black uppercase tracking-widest">{taggedGoal.name}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <p className="text-lg font-black text-slate-900 dark:text-white">-{formatIndianCurrency(expense.amount)}</p>
                <button
                    onClick={onDelete}
                    className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </motion.div>
    );
};

const InsightCard = ({ text, variant }: { text: string, variant: 'warning' | 'info' | 'success' }) => {
    const icon = {
        warning: <AlertTriangle className="text-rose-500" size={20} />,
        info: <Info className="text-blue-500" size={20} />,
        success: <CheckCircle2 className="text-emerald-500" size={20} />
    };

    return (
        <div className={`p-5 rounded-2xl border flex gap-4 ${variant === 'warning' ? 'bg-rose-500/5 border-rose-500/10' :
                variant === 'success' ? 'bg-emerald-500/5 border-emerald-500/10' :
                    'bg-blue-500/5 border-blue-500/10'
            }`}>
            <div className="shrink-0">{icon[variant]}</div>
            <p className="text-xs font-bold leading-relaxed text-slate-600 dark:text-slate-300">{text}</p>
        </div>
    );
};

const HistoryIcon = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
    </svg>
);
