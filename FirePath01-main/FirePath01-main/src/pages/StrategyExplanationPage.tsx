import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Target, ShieldCheck, HeartPulse, Shield, Trophy, Award, CheckCircle2 } from 'lucide-react';
import { formatIndianCurrency } from '../utils/currency';

// Mapping strategy to its profile
const strategyData: Record<string, any> = {
    "Capital Stability Strategy": {
        style: 'Capital Stability Strategy',
        color: 'emerald',
        description: 'Focus on capital preservation and steady growth.',
        icon: '🛡️',
        animatingColor: 'rgba(16, 185, 129, 0.5)',
        expectedReturn: 8, // 8% per annum
        volatility: 'Low Expected Volatility',
        horizon: 'Suitable for 1-3+ Years',
        baskets: [
            {
                name: "Basket 1 (Conservative)",
                funds: [
                    { name: "ICICI Prudential Corporate Bond Fund", split: 100, risk: "stable" }
                ]
            }
        ]
    },
    "Balanced Growth Strategy": {
        style: 'Balanced Growth Strategy',
        color: 'blue',
        description: 'Balanced allocation between growth and stability.',
        icon: '⚖️',
        animatingColor: 'rgba(59, 130, 246, 0.5)',
        expectedReturn: 12, // 12% per annum
        volatility: 'Moderate Volatility',
        horizon: 'Suitable for 3-7 Years',
        baskets: [
            {
                name: "Basket 1 (Core Growth)",
                funds: [
                    { name: "UTI Nifty 50 Index Fund", split: 50, risk: "moderate" },
                    { name: "Parag Parikh Flexi Cap Fund", split: 30, risk: "aggressive" },
                    { name: "Nippon India ETF Gold BeES", split: 20, risk: "stable" }
                ]
            }
        ]
    },
    "High Growth Strategy": {
        style: 'High Growth Strategy',
        color: 'purple',
        description: 'Higher volatility but stronger long-term growth potential.',
        icon: '🚀',
        animatingColor: 'rgba(168, 85, 247, 0.5)',
        expectedReturn: 15,
        volatility: 'High Expected Volatility',
        horizon: 'Suitable for 7+ Years',
        baskets: [
            {
                name: "Basket 1 (Aggressive Focus)",
                funds: [
                    { name: "SBI Focused Equity Fund", split: 40, risk: "aggressive" },
                    { name: "Nippon India Small Cap Fund", split: 30, risk: "aggressive" },
                    { name: "UTI Nifty 50 Index Fund", split: 30, risk: "moderate" }
                ]
            }
        ]
    }
};

const getFundIconUrl = (fundName: string) => {
    if (fundName.toLowerCase().includes("gold") || fundName.toLowerCase().includes("bees")) return "https://img.icons8.com/color/48/gold-bars.png";
    if (fundName.includes("ICICI")) return "https://logo.clearbit.com/icicipruamc.com";
    if (fundName.includes("HDFC")) return "https://logo.clearbit.com/hdfcfund.com";
    if (fundName.includes("Kotak")) return "https://logo.clearbit.com/kotakmf.com";
    if (fundName.includes("SBI")) return "https://logo.clearbit.com/sbimf.com";
    if (fundName.includes("Nippon")) return "https://logo.clearbit.com/nipponindiamf.com";
    if (fundName.includes("UTI")) return "https://logo.clearbit.com/utimf.com";
    if (fundName.includes("Parag Parikh")) return "https://logo.clearbit.com/amc.ppfas.com";
    return "https://logo.clearbit.com/mutualfundssahihai.com";
};

export const StrategyExplanationPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!user) {
        return <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">Loading...</div>;
    }

    const { financialData } = user;
    const income = financialData.monthlyIncome || 0;

    // Calculate base investable surplus
    const monthlyExpenses = financialData.monthlyExpenses || 0;
    const monthlyInvestableSurplus = Math.max(0, income - monthlyExpenses);

    // Take 10% of income strictly for Insurance automatically (as a protective layer).
    const insuranceBudget = income * 0.10;
    const topUpBudget = Math.max(0, monthlyInvestableSurplus - insuranceBudget);

    const stratName = financialData.riskProfile || "Balanced Growth Strategy";
    const activeStrategy = strategyData[stratName] || strategyData["Balanced Growth Strategy"];

    const investmentBudget = topUpBudget;
    const expensesBudget = Math.max(0, income - insuranceBudget - investmentBudget);

    const incomeBreakdown = [
        ...activeStrategy.baskets[0].funds.map((f: any) => ({
            name: f.name,
            amount: (investmentBudget * f.split) / 100,
            percentage: ((investmentBudget * f.split) / 100 / income) * 100,
            isFund: true
        })),
        {
            name: "Insurance Protection",
            amount: insuranceBudget,
            percentage: (insuranceBudget / income) * 100,
            isFund: false
        },
        {
            name: "Monthly Expenses",
            amount: expensesBudget,
            percentage: (expensesBudget / income) * 100,
            isFund: false
        }
    ].filter(i => i.percentage > 0);

    const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b'];

    // Calculate Projection Chart
    const generateProjection = () => {
        const data = [];
        let currentVal = financialData.currentSavings || 0;
        const monthlyRate = activeStrategy.expectedReturn / 12 / 100;

        for (let year = 0; year <= 25; year++) {
            if (year === 0) {
                data.push({ year: `Year 0`, value: Math.round(currentVal) });
            } else {
                for (let m = 1; m <= 12; m++) {
                    currentVal = (currentVal + investmentBudget) * (1 + monthlyRate);
                }
                if (year % 5 === 0) {
                    data.push({ year: `Year ${year}`, value: Math.round(currentVal) });
                }
            }
        }
        return data;
    };
    const projectionData = generateProjection();

    // Determine Level Output
    let userLevel = 1;
    let levelTitle = "Budget Awareness";
    let progressPct = 20;

    if (investmentBudget > 0) {
        userLevel = 2; levelTitle = "Consistent Investing"; progressPct = 40;
    }
    if (financialData.currentSavings > income * 3) {
        userLevel = 3; levelTitle = "Portfolio Growth"; progressPct = 60;
    }
    if (financialData.currentSavings > income * 12) {
        userLevel = 4; levelTitle = "Financial Stability"; progressPct = 80;
    }
    if (financialData.currentSavings > (expensesBudget * 12 * 25)) {
        userLevel = 5; levelTitle = "Financial Independence"; progressPct = 100;
    }

    const futureFireExpenses = expensesBudget * 12 * 25;

    const getRiskColorClass = (risk: string) => {
        if (risk === 'stable') return 'bg-emerald-500';
        if (risk === 'moderate') return 'bg-amber-500';
        if (risk === 'aggressive') return 'bg-rose-500';
        return 'bg-blue-500';
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-gray-200 selection:bg-emerald-500/30 font-sans pb-24 overflow-x-hidden">
            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
                <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[150px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-20">

                {/* STEP 1: HEADER EXPERIENCE */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center relative pt-8"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="inline-flex justify-center mb-6"
                    >
                        <div className="text-6xl drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]">🎯</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-xs font-black tracking-[0.2em] text-emerald-400 uppercase mb-4"
                    >
                        Success! Your Strategy is Active
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-6 drop-shadow-sm">
                        {stratName}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light">
                        Your financial strategy is now activated. Based on your answers, this plan balances growth, stability, and protection to move you toward financial independence.
                    </p>
                </motion.div>

                {/* STEP 4: STRATEGY EXPLANATION */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <div className="bg-gray-800/40 border border-gray-700/50 backdrop-blur-xl rounded-2xl p-6 text-center hover:bg-gray-800/60 transition duration-300">
                        <div className="text-4xl mb-4">{activeStrategy.icon}</div>
                        <h4 className="text-lg font-bold text-white mb-2">Style Focus</h4>
                        <p className="text-sm text-gray-400">{activeStrategy.description}</p>
                    </div>
                    <div className="bg-gray-800/40 border border-gray-700/50 backdrop-blur-xl rounded-2xl p-6 text-center hover:bg-gray-800/60 transition duration-300">
                        <div className="text-4xl mb-4">📈</div>
                        <h4 className="text-lg font-bold text-white mb-2">Growth Target</h4>
                        <p className="text-sm text-emerald-400 font-bold mb-2">~{activeStrategy.expectedReturn}% p.a.</p>
                        <p className="text-xs text-gray-400">{activeStrategy.volatility}</p>
                    </div>
                    <div className="bg-gray-800/40 border border-gray-700/50 backdrop-blur-xl rounded-2xl p-6 text-center hover:bg-gray-800/60 transition duration-300">
                        <div className="text-4xl mb-4">⏳</div>
                        <h4 className="text-lg font-bold text-white mb-2">Time Horizon</h4>
                        <p className="text-sm text-blue-400 font-bold mb-2">{activeStrategy.horizon}</p>
                        <p className="text-xs text-gray-400">Recommended investment duration</p>
                    </div>
                </motion.div>

                {/* STEP 2: MONTHLY INCOME BREAKDOWN */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-gray-800/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl relative overflow-hidden"
                >
                    <h3 className="text-2xl font-bold text-white mb-2">Monthly Income Strategy Split</h3>
                    <p className="text-gray-400 mb-8">How your <span className="text-white font-bold">{formatIndianCurrency(income)}</span> monthly income is strategically allocated.</p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width={100} height={100}>
                                <PieChart>
                                    <Pie
                                        data={incomeBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={4}
                                        dataKey="amount"
                                        stroke="none"
                                        isAnimationActive={hasMounted}
                                    >
                                        {incomeBreakdown.map((_entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: any) => formatIndianCurrency(value)}
                                        contentStyle={{ backgroundColor: '#1f2937', borderRadius: '12px', border: '1px solid #374151', color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="space-y-5">
                            {incomeBreakdown.map((item, idx) => (
                                <div key={idx} className="bg-gray-900/40 p-4 rounded-xl border border-gray-700/50 relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className={`font-semibold ${item.isFund ? 'text-emerald-400' : 'text-gray-300'}`}>{item.name}</span>
                                        <span className="font-bold text-white">{formatIndianCurrency(item.amount)}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${item.percentage}%` }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                viewport={{ once: true }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 min-w-[40px] text-right">{item.percentage.toFixed(1)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* STEP 3: BASKET DETAILS */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h3 className="text-3xl font-extrabold text-white mb-8">Your Investment Baskets</h3>
                    <div className="space-y-8">
                        {activeStrategy.baskets.map((basket: any, bIdx: number) => (
                            <div key={bIdx} className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-gray-700/50 shadow-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition duration-500 pointer-events-none" />

                                <div className="flex items-center justify-between mb-8 border-b border-gray-700/50 pb-6 relative z-10">
                                    <div>
                                        <h4 className="text-2xl font-bold text-white">{basket.name}</h4>
                                        <p className="text-sm text-gray-400 mt-1">Allocating {formatIndianCurrency(investmentBudget)} per month</p>
                                    </div>
                                </div>

                                <div className="space-y-6 relative z-10">
                                    {basket.funds.map((fund: any, fIdx: number) => {
                                        const fundAmount = (investmentBudget * fund.split) / 100;
                                        return (
                                            <div key={fIdx} className="bg-gray-800/80 border border-gray-700/50 rounded-2xl p-5 hover:bg-gray-800 transition duration-300">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <img src={getFundIconUrl(fund.name)} alt="logo" className="w-10 h-10 rounded-full bg-white p-1 object-contain shadow-md" onError={(e) => e.currentTarget.style.display = 'none'} />
                                                        <span className="font-bold text-gray-100 text-lg">{fund.name}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xl font-bold text-white block">{formatIndianCurrency(fundAmount)} /mo</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 mr-6 relative h-3 bg-gray-900 rounded-full overflow-hidden shadow-inner">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            whileInView={{ width: `${fund.split}%` }}
                                                            transition={{ duration: 1.5, delay: 0.1 * fIdx, ease: "easeOut" }}
                                                            viewport={{ once: true }}
                                                            className={`absolute top-0 left-0 h-full rounded-full ${getRiskColorClass(fund.risk)}`}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-black text-gray-300 bg-gray-900 px-3 py-1 rounded-lg border border-gray-700 shadow-inner">
                                                        {fund.split}%
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* STEP 5: INSURANCE INTEGRATION */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-blue-500/30 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl transform translate-x-32 -translate-y-32 pointer-events-none" />

                    <div className="grid md:grid-cols-2 gap-12 relative z-10 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-sm font-bold uppercase tracking-widest mb-6 border border-blue-500/20 shadow-inner">
                                <ShieldCheck className="w-4 h-4" /> The Protection Layer
                            </div>
                            <h3 className="text-3xl font-extrabold text-white mb-6">Securing Your Wealth</h3>
                            <p className="text-gray-300 text-lg leading-relaxed mb-6">
                                We've automatically dedicated a portion of your income (<strong className="text-white bg-blue-900/50 px-2 py-0.5 rounded">{formatIndianCurrency(insuranceBudget)}/mo</strong>) towards high-quality health and term life insurance. This forms an impenetrable shield against life's unpredictable emergencies.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 bg-gray-900/60 rounded-2xl border border-gray-700/50 flex flex-col sm:flex-row gap-5 items-start hover:border-rose-500/30 transition duration-300 shadow-lg">
                                <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl shrink-0 shadow-inner">
                                    <HeartPulse className="w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-white mb-2">Health Protection (🏥)</h4>
                                    <p className="text-sm text-gray-400 mb-4 leading-relaxed">Defends your investments against high medical bills. Priority: Fast claim settlement networks.</p>
                                    <p className="text-xs font-bold text-rose-400 bg-rose-900/20 inline-block px-3 py-1.5 rounded-lg border border-rose-500/20">Recommended: HDFC Ergo, Niva Bupa</p>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-900/60 rounded-2xl border border-gray-700/50 flex flex-col sm:flex-row gap-5 items-start hover:border-indigo-500/30 transition duration-300 shadow-lg">
                                <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl shrink-0 shadow-inner">
                                    <Shield className="w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-white mb-2">Life Protection (🛡️)</h4>
                                    <p className="text-sm text-gray-400 mb-4 leading-relaxed">Guarantees dependent stability. Priority: Market standing and historically high solvency ratio.</p>
                                    <p className="text-xs font-bold text-indigo-400 bg-indigo-900/20 inline-block px-3 py-1.5 rounded-lg border border-indigo-500/20">Recommended: Max Life, ICICI Prudential</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* STEP 6: LEVEL UP SYSTEM */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-gray-800/40 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-gray-700/50 shadow-2xl relative overflow-hidden"
                >
                    {hasMounted && <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />}

                    <div className="text-center mb-12 relative z-10">
                        <h3 className="text-3xl font-extrabold text-white mb-4 flex justify-center items-center gap-3">
                            Financial Engine Level <span className="text-4xl">🔥</span>
                        </h3>
                        <p className="text-gray-400 max-w-xl mx-auto text-lg">As you consistently invest {formatIndianCurrency(investmentBudget)} every month, your investment engine ranks up, unlocking new financial security statuses.</p>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-12 relative z-10">
                        <div className="relative pt-[20px] pb-[40px]">
                            {/* Level labels above points */}
                            <div className="absolute top-[-30px] left-0 right-0 flex justify-between px-2 sm:px-4 text-xs font-bold text-gray-500 z-0">
                                <span className={userLevel >= 1 ? "text-emerald-400" : ""}>Lvl 1</span>
                                <span className={userLevel >= 2 ? "text-emerald-400" : ""}>Lvl 2</span>
                                <span className={userLevel >= 3 ? "text-emerald-400" : ""}>Lvl 3</span>
                                <span className={userLevel >= 4 ? "text-emerald-400" : ""}>Lvl 4</span>
                                <span className={userLevel >= 5 ? "text-amber-400" : ""}>Lvl 5 🏆</span>
                            </div>

                            <div className="absolute top-6 left-[24px] right-[24px] h-3 bg-gray-800 rounded-full shadow-inner overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${progressPct}%` }}
                                    transition={{ duration: 2, ease: "easeOut" }}
                                    viewport={{ once: true }}
                                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full relative"
                                >
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)]" />
                                </motion.div>
                            </div>

                            <div className="flex justify-between relative mt-2 w-full px-2 sm:px-4">
                                {[1, 2, 3, 4, 5].map((lvl) => (
                                    <div key={lvl} className={`flex flex-col items-center gap-2 transition duration-500 delay-100 ${userLevel >= lvl ? 'opacity-100 scale-110' : 'opacity-40 grayscale scale-90'}`}>
                                        <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-black text-lg border-4 shadow-lg ${userLevel >= lvl ? 'bg-gray-900 text-white border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-gray-800 text-gray-500 border-gray-700'}`}>
                                            {lvl === 5 ? <Award className="w-5 h-5 sm:w-7 sm:h-7 text-amber-500" /> : lvl}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="text-center bg-gray-900/70 backdrop-blur-md rounded-3xl p-8 border border-emerald-500/20 shadow-2xl transform hover:scale-[1.02] transition duration-300">
                            <div className="inline-flex p-4 bg-emerald-500/20 text-emerald-400 rounded-full mb-6 relative overflow-hidden">
                                <div className="absolute inset-0 bg-emerald-400/20 animate-ping rounded-full" />
                                <Trophy className="w-10 h-10 relative z-10" />
                            </div>
                            <p className="text-emerald-500 font-extrabold tracking-[0.2em] text-sm mb-2 drop-shadow-sm">CURRENT MILESTONE</p>
                            <h4 className="text-4xl font-black text-white mb-4 drop-shadow-md">Level {userLevel}: {levelTitle}</h4>
                            <p className="text-gray-300 text-lg">Consistent investing builds your financial shield. Keep pushing!</p>
                        </div>
                    </div>
                </motion.div>

                {/* STEP 7: FUTURE PROJECTION */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-gray-800/40 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-gray-700/50 shadow-xl"
                >
                    <div className="text-center mb-10">
                        <h3 className="text-3xl font-bold text-white mb-4">The Wealth Projection 📈</h3>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                            Visualizing the <span className="text-emerald-400 font-bold">{activeStrategy.expectedReturn}% historical compound growth</span> over 25 years.
                        </p>
                    </div>

                    <div className="h-[400px] w-full mb-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={projectionData} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="year" stroke="#4b5563" tick={{ fill: '#9ca3af' }} />
                                <YAxis
                                    stroke="#4b5563"
                                    tick={{ fill: '#9ca3af' }}
                                    tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                                    width={70}
                                />
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <Tooltip
                                    formatter={(value: any) => formatIndianCurrency(value)}
                                    labelStyle={{ color: '#9ca3af' }}
                                    contentStyle={{ backgroundColor: '#1f2937', borderRadius: '16px', border: '1px solid #374151', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#10b981"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                    isAnimationActive={hasMounted}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-gray-900/60 rounded-2xl border border-gray-700/50 text-center shadow-inner">
                            <p className="text-gray-400 font-semibold mb-2">Year 5 Target</p>
                            <p className="text-3xl font-bold text-white">{formatIndianCurrency(projectionData.find(d => d.year === 'Year 5')?.value || 0)}</p>
                        </div>
                        <div className="p-6 bg-gray-900/60 rounded-2xl border border-gray-700/50 text-center shadow-inner">
                            <p className="text-gray-400 font-semibold mb-2">Year 10 Target</p>
                            <p className="text-3xl font-bold text-emerald-400">{formatIndianCurrency(projectionData.find(d => d.year === 'Year 10')?.value || 0)}</p>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-emerald-900/40 to-gray-900/60 rounded-2xl border border-emerald-500/30 text-center shadow-[0_0_20px_rgba(16,185,129,0.1)] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition duration-300" />
                            <p className="text-emerald-400 font-bold mb-2">FIRE Milestone (Est.)</p>
                            <p className="text-3xl font-black text-white">{formatIndianCurrency(futureFireExpenses)}</p>
                        </div>
                    </div>
                </motion.div>

                {/* STEP 9: FINAL MOTIVATION */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-emerald-900/30 backdrop-blur-xl rounded-3xl p-10 md:p-16 border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)] text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 right-1/2 translate-x-1/2 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none" />

                    <div className="inline-flex p-5 bg-emerald-500/20 text-emerald-300 rounded-full mb-8 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                        <Target className="w-12 h-12" />
                    </div>

                    <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight drop-shadow-md">
                        You now have a clear <br className="hidden md:block" /> financial roadmap.
                    </h2>
                    <p className="text-lg md:text-xl text-emerald-100 max-w-3xl mx-auto mb-12 leading-relaxed font-medium tracking-wide">
                        Every month you invest brings you closer to ultimate freedom. Stick to this master plan, automate your investments, and build the life you've always envisioned.
                    </p>

                    <button
                        onClick={() => navigate('/profile')}
                        className="group inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-[#0f172a] font-black text-lg md:text-xl px-10 py-5 rounded-2xl shadow-[0_10px_40px_rgba(16,185,129,0.5)] hover:shadow-[0_15px_50px_rgba(16,185,129,0.7)] hover:-translate-y-2 transition-all duration-300"
                    >
                        Start My Plan <CheckCircle2 className="w-7 h-7 transition-transform group-hover:scale-110" />
                    </button>
                    <p className="mt-6 text-sm text-emerald-400/70 font-semibold tracking-wide uppercase">Your journey to FIRE officially begins now.</p>
                </motion.div>

            </div>
        </div>
    );
};
