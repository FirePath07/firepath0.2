import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { FundIcon } from '../components/FundIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { formatIndianCurrency } from '../utils/currency';
import confetti from 'canvas-confetti';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Plus, Wallet, Briefcase, RefreshCcw, Landmark, CheckCircle2, Award } from 'lucide-react';
import { calculateFIREMetrics } from '../utils/finance';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b'];

// Mock deterministic NAV generator
const getBaseNav = (fundName: string) => {
    let hash = 0;
    for (let i = 0; i < fundName.length; i++) {
        hash = fundName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return 50 + (Math.abs(hash) % 150);
};

const FUND_CODE_MAP: Record<string, string> = {
    "ICICI Prudential Corporate Bond Fund": "120692",
    "HDFC Corporate Bond Fund": "118987",
    "Kotak Corporate Bond Fund": "133791",
    "UTI Nifty 50 Index Fund": "120716",
    "ICICI Prudential Nifty 50 Index Fund": "101349",
    "HDFC Nifty 50 Index Fund": "101525",
    "Parag Parikh Flexi Cap Fund": "122639",
    "HDFC Flexi Cap Fund": "118955",
    "Kotak Flexicap Fund": "120166",
    "Nippon India ETF Gold BeES": "140088",
    "SBI Focused Equity Fund": "119727",
    "ICICI Prudential Focused Equity Fund": "120722",
    "Axis Focused 25 Fund": "120465",
    "Nippon India Small Cap Fund": "118777",
    "SBI Small Cap Fund": "125497",
    "Kotak Small Cap Fund": "120153"
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const invested = payload.find((p: any) => p.dataKey === 'Invested')?.value;
        const value = payload.find((p: any) => p.dataKey === 'Value')?.value;
        const isProfit = value >= invested;

        return (
            <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700 p-5 rounded-2xl shadow-2xl min-w-[200px]">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">{label}</p>
                <div className="space-y-3">
                    <div className="flex justify-between items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-gray-300 font-medium">Invested</span>
                        </div>
                        <span className="text-white font-bold">{formatIndianCurrency(invested || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                            <span className="text-gray-300 font-medium">Value</span>
                        </div>
                        <span className="text-white font-bold">{formatIndianCurrency(value || 0)}</span>
                    </div>
                </div>
                <div className={`mt-4 pt-3 border-t ${isProfit ? 'border-emerald-500/30' : 'border-rose-500/30'} flex justify-between items-center`}>
                    <span className="text-xs text-gray-400 font-medium">Total Return</span>
                    <span className={`text-sm font-black ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfit ? '+' : '-'}{formatIndianCurrency(Math.abs((value || 0) - (invested || 0)))}
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

export const InvestmentProgressDashboard = () => {
    const { user, updateFinancialData } = useAuth();
    const navigate = useNavigate();

    const [isUpdateSipOpen, setIsUpdateSipOpen] = useState(false);
    const [bonusAmount, setBonusAmount] = useState('');

    const [isUpdateIncomeOpen, setIsUpdateIncomeOpen] = useState(false);
    const [newSalary, setNewSalary] = useState('');
    const [newExpenses, setNewExpenses] = useState('');

    const [isRecommendOpen, setIsRecommendOpen] = useState(false);
    const [recommendedSip, setRecommendedSip] = useState(0);

    const [navPrices, setNavPrices] = useState<Record<string, number>>({});
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [achievedGoal, setAchievedGoal] = useState<any | null>(null);
    const [showFireCelebration, setShowFireCelebration] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            refreshMarketData();
        }
    }, [user, navigate]);

    const refreshMarketData = async () => {
        setIsRefreshing(true);
        const prices: Record<string, number> = {};
        const funds = user?.financialData?.selectedBasket?.funds || [];

        await Promise.all(funds.map(async (f) => {
            const code = FUND_CODE_MAP[f.name];
            try {
                if (code) {
                    const res = await fetch(`https://api.mfapi.in/mf/${code}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.data && data.data.length > 0) {
                            prices[f.name] = parseFloat(data.data[0].nav);
                            return;
                        }
                    }
                }
            } catch (e) {
                console.warn(`Failed to fetch NAV for ${f.name}`);
            }

            // Fallback mock logic
            const base = getBaseNav(f.name);
            const randomGrowth = 1 + (Math.random() * 0.03);
            prices[f.name] = Number((base * randomGrowth).toFixed(2));
        }));

        setNavPrices(prices);
        setIsRefreshing(false);
    };

    if (!user) return null;

    const { financialData } = user;
    const portfolio = financialData.portfolio || [];
    const basket = financialData.selectedBasket;

    const { currentTotalWealth, fireNumber } = calculateFIREMetrics(financialData);
    const isFireAchieved = currentTotalWealth >= fireNumber && fireNumber > 0;

    useEffect(() => {
        if (isFireAchieved && !financialData.fireCelebrated) {
            setShowFireCelebration(true);
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.5 },
                colors: ['#10b981', '#fbbf24', '#ffffff', '#34d399']
            });
            // Mark as celebrated on the server/context
            updateFinancialData({ fireCelebrated: true });
        }
    }, [isFireAchieved, financialData.fireCelebrated]);

    // Compute Summary
    let totalInvested = 0;
    let currentValue = 0;

    const fundPerformance = portfolio.map(pos => {
        const currentNav = navPrices[pos.fundName] || pos.navAtPurchase || getBaseNav(pos.fundName);
        const currentVal = pos.units * currentNav;
        const pl = currentVal - pos.totalInvested;
        const returnPct = pos.totalInvested > 0 ? (pl / pos.totalInvested) * 100 : 0;

        totalInvested += pos.totalInvested;
        currentValue += currentVal;

        return {
            ...pos,
            currentNav,
            currentValue: currentVal,
            pl,
            returnPct
        };
    });

    const totalPL = currentValue - totalInvested;

    const activeGoalsSIP = (financialData.goals || []).reduce((sum, goal) => {
        const remainingAmt = Math.max(0, goal.targetAmount - goal.currentSavings);
        const requiredSip = goal.targetMonths > 0 ? remainingAmt / goal.targetMonths : 0;
        return sum + (requiredSip > 0 && remainingAmt > 0 ? requiredSip : 0);
    }, 0);

    const overallSIP = (financialData.defaultMonthlySIP || 0) + activeGoalsSIP;

    const handleUpdateSip = async () => {
        if (!basket || !basket.funds.length) return alert("Please complete risk assessment to select a basket.");

        const defaultSip = financialData.defaultMonthlySIP || 0;
        const totalBonus = Number(bonusAmount) || 0;
        
        // Amount logic: We invest the defaultSip + any extra bonus in the FIRE portfolio.
        // Additionally, we process the active goal SIPs.
        const fireInvestAmount = defaultSip + totalBonus;
        
        if (fireInvestAmount <= 0 && activeGoalsSIP <= 0) return;

        // 1. Update Portfolio (FIRE Corpus)
        const newPortfolio = [...portfolio];
        if (fireInvestAmount > 0) {
            basket.funds.forEach(fund => {
                const fundAmount = (fireInvestAmount * fund.split) / 100;
                const nav = navPrices[fund.name] || getBaseNav(fund.name);
                const unitsBought = fundAmount / nav;

                const existingIndex = newPortfolio.findIndex(p => p.fundName === fund.name);
                if (existingIndex >= 0) {
                    newPortfolio[existingIndex].units += unitsBought;
                    newPortfolio[existingIndex].totalInvested += fundAmount;
                } else {
                    newPortfolio.push({
                        fundName: fund.name,
                        units: unitsBought,
                        totalInvested: fundAmount,
                        navAtPurchase: nav
                    });
                }
            });
        }

        // 2. Update Future Goals Progress (Internal tracking)
        const currentGoals = financialData.goals || [];
        let goalReached = null;
        const updatedGoals = currentGoals.map(goal => {
            const remainingAmt = Math.max(0, goal.targetAmount - goal.currentSavings);
            const reqSip = goal.targetMonths > 0 ? remainingAmt / goal.targetMonths : 0;
            
            if (reqSip > 0 && remainingAmt > 0) {
                const newSavings = goal.currentSavings + reqSip;
                if (newSavings >= goal.targetAmount && goal.currentSavings < goal.targetAmount) {
                    goalReached = { ...goal, currentSavings: newSavings };
                }
                return { ...goal, currentSavings: newSavings };
            }
            return goal;
        });

        const newMonthlyContribs = [...(financialData.monthlyContributions || []), {
            date: new Date().toISOString().split('T')[0],
            amount: fireInvestAmount + activeGoalsSIP // Total cash out
        }];

        const newHistory = [...(financialData.portfolioHistory || []), {
            date: new Date().toISOString().split('T')[0],
            totalInvested: totalInvested + fireInvestAmount,
            currentValue: currentValue + fireInvestAmount
        }];

        await updateFinancialData({
            portfolio: newPortfolio,
            goals: updatedGoals,
            monthlyContributions: newMonthlyContribs,
            portfolioHistory: newHistory
        });

        if (goalReached) {
            setAchievedGoal(goalReached);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#3b82f6', '#f59e0b']
            });
        }

        setBonusAmount('');
        setIsUpdateSipOpen(false);
    };

    const handleUpdateIncome = async () => {
        const salary = Number(newSalary) || financialData.monthlyIncome;
        const expenses = newExpenses ? Number(newExpenses) : financialData.monthlyExpenses;

        await updateFinancialData({
            monthlyIncome: salary,
            monthlyExpenses: expenses
        });

        const remainingMoney = Math.max(0, salary - expenses);
        const splurge = salary * 0.15;
        const investable = Math.max(0, remainingMoney - splurge);

        setRecommendedSip(investable);
        setIsUpdateIncomeOpen(false);
        setIsRecommendOpen(true);
    };

    const handleApplyRecommendedSip = async () => {
        // Automatically set the new recommended SIP as the default
        await updateFinancialData({ defaultMonthlySIP: recommendedSip });
        setIsRecommendOpen(false);
        setIsUpdateSipOpen(true);
    };

    const hasInvested = portfolio.length > 0;
    const chartData = (financialData.portfolioHistory || []).map(h => ({
        name: h.date,
        Invested: h.totalInvested,
        Value: h.currentValue
    }));

    const pieData = fundPerformance.map(f => ({
        name: f.fundName,
        value: f.currentValue
    })).filter(f => f.value > 0);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Navigation showFullNav={true} />

            {/* notification block removed */}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Investment Progress Dashboard</h1>
                        {basket && (
                            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                <Briefcase className="w-4 h-4" /> Selected: {basket.name}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsUpdateIncomeOpen(true)}
                            className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white font-bold rounded-xl shadow-sm hover:shadow-md transition flex items-center gap-2"
                        >
                            <Wallet className="w-4 h-4" /> Update Salary
                        </button>
                        <button
                            onClick={() => setIsUpdateSipOpen(true)}
                            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Monthly Invest
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 flex flex-col justify-center transition hover:shadow-xl">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Overall Monthly SIP</p>
                        <p className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">{formatIndianCurrency(overallSIP)}</p>
                        <p className="text-[10px] text-gray-500 mt-1 font-medium">Inv: {formatIndianCurrency(financialData.defaultMonthlySIP || 0)} | Goals: {formatIndianCurrency(activeGoalsSIP)}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 flex flex-col justify-center transition hover:shadow-xl">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Total Invested</p>
                        <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{formatIndianCurrency(totalInvested)}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 flex flex-col justify-center transition hover:shadow-xl">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Current Portfolio Value</p>
                        <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{formatIndianCurrency(currentValue)}</p>
                    </div>
                    <div className={`bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 border transition hover:shadow-xl flex flex-col justify-center ${totalPL >= 0 ? 'border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-900/10' : 'border-rose-500/30 bg-rose-50/10 dark:bg-rose-900/10'}`}>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Total Profit / Loss</p>
                        <p className={`text-3xl font-black flex items-center gap-2 tracking-tight ${totalPL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {totalPL >= 0 ? '+' : '-'}{formatIndianCurrency(Math.abs(totalPL))}
                        </p>
                    </div>
                </div>

                {/* Charts & Graphs */}
                {hasInvested ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 md:p-8 border border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Portfolio Growth Over Time</h2>
                            <div className="h-80 -mx-2 md:mx-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} minTickGap={30} />
                                        <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${(val / 100000).toLocaleString('en-IN')}L`} width={60} />
                                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
                                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                                        <Area type="monotone" dataKey="Invested" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorInvested)" activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }} />
                                        <Area type="monotone" dataKey="Value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" activeDot={{ r: 8, stroke: '#fff', strokeWidth: 3, fill: '#10b981' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 md:p-8 border border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Asset Allocation</h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: any) => formatIndianCurrency(value)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 space-y-2 max-h-32 overflow-y-auto no-scrollbar">
                                {pieData.map((entry, index) => (
                                    <div key={index} className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            <span className="text-gray-600 dark:text-gray-300 font-medium truncate w-32">{entry.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white">{formatIndianCurrency(entry.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-10 text-center border border-gray-100 dark:border-gray-700 mb-8">
                        <div className="inline-flex items-center justify-center p-5 bg-emerald-50 dark:bg-emerald-900/30 rounded-full mb-6">
                            <Landmark className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ready to grow your wealth?</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-6">You haven't made any investments yet. Click the "Monthly Invest" button to record your first SIP and start tracking your FIRE journey.</p>
                        <button
                            onClick={() => setIsUpdateSipOpen(true)}
                            className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition"
                        >
                            Start Investing
                        </button>
                    </div>
                )}

                {/* Fund Performance Table */}
                {hasInvested && (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
                        <div className="p-6 md:p-8 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Fund Performance</h2>
                            <button
                                onClick={refreshMarketData}
                                disabled={isRefreshing}
                                className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 disabled:opacity-50"
                            >
                                <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                {isRefreshing ? 'Syncing...' : 'Sync Live NAV'}
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold border-b border-gray-200 dark:border-gray-700">
                                        <th className="p-4 md:px-8 md:py-5">Fund Name</th>
                                        <th className="p-4 md:px-8 md:py-5">Units Held</th>
                                        <th className="p-4 md:px-8 md:py-5">Total Invested</th>
                                        <th className="p-4 md:px-8 md:py-5">Current Value</th>
                                        <th className="p-4 md:px-8 md:py-5 text-right">P&L (Return)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {fundPerformance.map((fund, idx) => (
                                        <motion.tr
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition"
                                        >
                                            <td className="p-4 md:px-8 md:py-6 whitespace-nowrap">
                                                <div className="flex items-center gap-4">
                                                    <FundIcon 
                                                        fundName={fund.fundName} 
                                                        className="w-10 h-10 shadow-sm shrink-0" 
                                                    />
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white text-[15px]">{fund.fundName}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-medium">NAV: ₹{fund.currentNav.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 md:px-8 md:py-5">
                                                <p className="text-gray-900 dark:text-gray-200 font-medium">{fund.units.toFixed(2)}</p>
                                            </td>
                                            <td className="p-4 md:px-8 md:py-5">
                                                <p className="text-gray-900 dark:text-gray-200 font-medium">{formatIndianCurrency(fund.totalInvested)}</p>
                                            </td>
                                            <td className="p-4 md:px-8 md:py-5">
                                                <p className="text-gray-900 dark:text-gray-200 font-bold">{formatIndianCurrency(fund.currentValue)}</p>
                                            </td>
                                            <td className="p-4 md:px-8 md:py-5 text-right">
                                                <div className={`inline-flex flex-col items-end ${fund.pl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                    <span className="font-bold text-[15px]">
                                                        {fund.pl >= 0 ? '+' : '-'}{formatIndianCurrency(Math.abs(fund.pl))}
                                                    </span>
                                                    <span className="text-xs font-semibold bg-white dark:bg-gray-800 bg-opacity-50 px-2 py-0.5 rounded-full mt-1">
                                                        {fund.returnPct >= 0 ? '+' : ''}{fund.returnPct.toFixed(2)}%
                                                    </span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </main>

            {/* Modals */}
            <AnimatePresence>
                {isUpdateSipOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
                        >
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Update Monthly Investment</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Confirm your monthly SIP allocation. It will be seamlessly split according to your selected basket ({basket?.name || 'None'}).</p>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Suggested Monthly SIP (₹)</label>
                                <div className="w-full px-5 py-4 bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl font-bold text-gray-800 dark:text-gray-200 text-lg">
                                    {formatIndianCurrency(financialData.defaultMonthlySIP || 0)}
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Add Bonus Investment (Optional) (₹)</label>
                                <input
                                    type="number"
                                    value={bonusAmount}
                                    onChange={(e) => setBonusAmount(e.target.value)}
                                    placeholder="Bonus Amount (e.g. 5000)"
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition text-lg"
                                />
                                <p className="mt-3 font-bold text-sm text-gray-700 dark:text-gray-300 text-right">Total: {formatIndianCurrency((financialData.defaultMonthlySIP || 0) + (Number(bonusAmount) || 0))}</p>
                            </div>

                            {((financialData.defaultMonthlySIP || 0) + (Number(bonusAmount) || 0)) > 0 && basket && (
                                <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                                    <p className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-400 mb-3 tracking-wider">Preview Allocation</p>
                                    <div className="space-y-2">
                                        {basket.funds.map(f => (
                                            <div key={f.name} className="flex justify-between text-sm">
                                                <span className="text-gray-700 dark:text-gray-300 truncate pr-4">{f.name}</span>
                                                <span className="font-bold text-gray-900 dark:text-white">{formatIndianCurrency((((financialData.defaultMonthlySIP || 0) + (Number(bonusAmount) || 0)) * f.split) / 100)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsUpdateSipOpen(false)}
                                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateSip}
                                    className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 transition"
                                >
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isUpdateIncomeOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
                        >
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Update Salary & Income</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Congratulations on your new income! Update your details to get a new SIP recommendation.</p>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">New Monthly Salary (₹)</label>
                                    <input
                                        type="number"
                                        value={newSalary}
                                        onChange={(e) => setNewSalary(e.target.value)}
                                        placeholder={`Current: ₹${financialData.monthlyIncome}`}
                                        className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Updated Monthly Expenses (₹) <span className="text-gray-400 font-normal">(Optional)</span></label>
                                    <input
                                        type="number"
                                        value={newExpenses}
                                        onChange={(e) => setNewExpenses(e.target.value)}
                                        placeholder={`Current: ₹${financialData.monthlyExpenses}`}
                                        className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsUpdateIncomeOpen(false)}
                                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateIncome}
                                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition"
                                >
                                    Save Details
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isRecommendOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative z-10 text-center">
                                <div className="inline-flex p-4 bg-emerald-500/20 text-emerald-400 rounded-full mb-4 shrink-0">
                                    <TrendingUp className="w-8 h-8" />
                                </div>
                                <h3 className="text-3xl font-extrabold text-white mb-2">Updated Investment Plan</h3>
                                <p className="text-indigo-200 text-sm mb-6">Based on your new salary, here is your target monthly investable surplus.</p>

                                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8">
                                    <p className="text-indigo-200 font-semibold mb-1">Recommended Monthly SIP</p>
                                    <p className="text-5xl font-black text-emerald-400 mb-2">{formatIndianCurrency(recommendedSip)}</p>
                                    <p className="text-xs text-indigo-300">Spread across your {basket?.name || 'selected basket'}</p>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setIsRecommendOpen(false)}
                                        className="flex-1 py-4 text-white font-bold rounded-xl border border-white/20 hover:bg-white/10 transition"
                                    >
                                        Not right now
                                    </button>
                                    <button
                                        onClick={handleApplyRecommendedSip}
                                        className="flex-1 py-4 bg-emerald-500 text-white font-extrabold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:bg-emerald-400 transition"
                                    >
                                        Apply Allocation
                                    </button>
                                </div>
                            </div>
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
                            
                            <h3 className="text-4xl font-black text-gray-900 dark:text-white mt-8 mb-4 tracking-tight">Goal Achieved!</h3>
                            <p className="text-gray-500 dark:text-gray-400 font-bold mb-8 leading-relaxed">
                                Amazing! Your monthly investment has fully funded <strong>{achievedGoal.name}</strong>. You can now choose to revert your SIP or keep investing.
                            </p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setAchievedGoal(null)}
                                    className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all uppercase tracking-widest text-xs"
                                >
                                    Acknowledged
                                </button>
                                <button
                                    onClick={async () => {
                                        if (achievedGoal) {
                                            const updatedGoals = (financialData.goals || []).filter(g => g.id !== achievedGoal.id);
                                            
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
                {/* FIRE Achievement Celebration Modal */}
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
