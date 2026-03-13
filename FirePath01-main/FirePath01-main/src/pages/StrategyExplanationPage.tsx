import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Target, ShieldCheck, HeartPulse, Shield, CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatIndianCurrency } from '../utils/currency';
import { FundIcon } from '../components/FundIcon';

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


export const StrategyExplanationPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    const { financialData } = user;
    const income = financialData.monthlyIncome || 0;

    // Current savings stay entirely for investment growth
    const currentSavings = financialData.currentSavings || 0;
    const netInvestedSavings = currentSavings; // No insurance deduction

    // Monthly investable surplus = income minus expenses minus splurge money
    const monthlyExpenses = financialData.monthlyExpenses || 0;
    const splurgeMoney = income * 0.15;
    const monthlyInvestableSurplus = Math.max(0, income - monthlyExpenses - splurgeMoney);

    // All of investor's monthly surplus flows into funds
    const investmentBudget = monthlyInvestableSurplus;
    const expensesBudget = monthlyExpenses;

    const stratName = financialData.riskProfile || "Balanced Growth Strategy";
    const activeStrategy = strategyData[stratName] || strategyData["Balanced Growth Strategy"];

    const incomeBreakdown = [
        ...activeStrategy.baskets[0].funds.map((f: any) => ({
            name: f.name,
            amount: (investmentBudget * f.split) / 100,
            percentage: income > 0 ? ((investmentBudget * f.split) / 100 / income) * 100 : 0,
            isFund: true
        })),
        {
            name: "Monthly Expenses",
            amount: expensesBudget,
            percentage: income > 0 ? (expensesBudget / income) * 100 : 0,
            isFund: false
        },
        {
            name: "Splurge Money",
            amount: splurgeMoney,
            percentage: income > 0 ? (splurgeMoney / income) * 100 : 0,
            isFund: false
        }
    ].filter(i => i.percentage > 0);

    const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b'];

    // Calculate Projection Chart — uses netInvestedSavings as starting base (excludes insurance corpus)
    const generateProjection = () => {
        const data = [];
        let currentVal = netInvestedSavings; // Start from savings minus insurance corpus
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

    // FIRE milestone based on inflated expenses or user selection
    const inflationRate = (financialData.inflationRate || 6) / 100;
    const yearsToInvest = Math.max(0, financialData.targetRetirementAge - financialData.age);
    const inflatedAnnualExpenses = expensesBudget * 12 * Math.pow(1 + inflationRate, yearsToInvest);
    
    // Use the stored selectedFireAmount if available, otherwise calculate a traditional (25x) inflated one
    const futureFireExpenses = financialData.selectedFireAmount && financialData.selectedFireAmount > 0 
        ? financialData.selectedFireAmount 
        : inflatedAnnualExpenses * 25;

    const getRiskColorClass = (risk: string) => {
        if (risk === 'stable') return 'bg-emerald-500';
        if (risk === 'moderate') return 'bg-amber-500';
        if (risk === 'aggressive') return 'bg-rose-500';
        return 'bg-blue-500';
    };

    const yearsToRetire = Math.max(0, financialData.targetRetirementAge - financialData.age);
    let projectedValueAtHorizon = netInvestedSavings;
    const monthlyRate = activeStrategy.expectedReturn / 12 / 100;
    for (let year = 1; year <= yearsToRetire; year++) {
        for (let m = 1; m <= 12; m++) {
            projectedValueAtHorizon = (projectedValueAtHorizon + investmentBudget) * (1 + monthlyRate);
        }
    }

    const isLowRisk = stratName === "Capital Stability Strategy";
    const missesFireGoal = isLowRisk && financialData.selectedFireAmount && projectedValueAtHorizon < financialData.selectedFireAmount;

    // --- Insurance Recommendation Logic based on Age ---
    const userAge = financialData.age || 25;
    let healthPlans = [];
    let lifePlans = [];

    if (userAge <= 26) {
        healthPlans = [
            { name: 'LIC Jeevan Arogya (Plan 903)', cover: '₹10,00,000 (Daily Cash ₹1k-4k)', prem: '₹5,800 - ₹7,400', tag: 'Hospital Cash', color: 'amber', url: 'https://licindia.in/lic-s-jeevan-arogya-plan-no.-904-uin-512n266v02-' },
            { name: 'HDFC ERGO Optima Secure', cover: '₹10,00,000', prem: '₹9,200 - ₹11,500', tag: 'Comprehensive', color: 'emerald', url: 'https://www.hdfcergo.com/campaigns/hdfc-ergo-health-insurance-2?&utm_source=bing_search_1&utm_medium=cpc&utm_campaign=Health_Search_Brand-Neev_Phrase&utm_adgroup=Generic-Insurance&utm_campaign=420828998&utm_content=1194070400921396&adid=&utm_term=best%20hdfc%20ergo%20mediclaim&utm_network=o&utm_matchtype=p&utm_device=c&utm_location=265993&utm_sitelink={sitelink}&utm_placement=&ci=bingsearch&msclkid=02a26ebb08641201990a07096d3f7dd8' }
        ];
        lifePlans = [
            { name: 'Term Life Insurance', cover: '₹1 Cr', prem: '₹7,500 - ₹9,500', tag: 'Recommended', color: 'blue', url: 'https://termlife.policybazaar.com/?utm_source=bing&utm_medium=cpc&utm_term=term%20life%20insurance&utm_campaign=Core00Term_Life_Insurance&msclkid=b854f23b498013d813739b892f7b0195' }
        ];
    } else {
        healthPlans = [
            { name: 'LIC Jeevan Arogya (Plan 903)', cover: '₹10,00,000 (Daily Cash ₹1k-4k)', prem: '₹8,200 - ₹10,500', tag: 'Hospital Cash', color: 'amber', url: 'https://licindia.in/lic-s-jeevan-arogya-plan-no.-904-uin-512n266v02-' },
            { name: 'HDFC ERGO Optima Secure', cover: '₹10,00,000', prem: '₹11,800 - ₹14,900', tag: 'Comprehensive', color: 'emerald', url: 'https://www.hdfcergo.com/campaigns/hdfc-ergo-health-insurance-2?&utm_source=bing_search_1&utm_medium=cpc&utm_campaign=Health_Search_Brand-Neev_Phrase&utm_adgroup=Generic-Insurance&utm_campaign=420828998&utm_content=1194070400921396&adid=&utm_term=best%20hdfc%20ergo%20mediclaim&utm_network=o&utm_matchtype=p&utm_device=c&utm_location=265993&utm_sitelink={sitelink}&utm_placement=&ci=bingsearch&msclkid=02a26ebb08641201990a07096d3f7dd8' }
        ];
        lifePlans = [
            { name: 'Term Life Insurance', cover: '₹1 Cr', prem: '₹10,500 - ₹13,500', tag: 'Recommended', color: 'blue', url: 'https://termlife.policybazaar.com/?utm_source=bing&utm_medium=cpc&utm_term=term%20life%20insurance&utm_campaign=Core00Term_Life_Insurance&msclkid=b854f23b498013d813739b892f7b0195' }
        ];
    }

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
                                                        <FundIcon 
                                                          fundName={fund.name} 
                                                          category={fund.risk} 
                                                          className="w-10 h-10 shadow-md p-1" 
                                                        />
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

                    <div className="grid md:grid-cols-2 gap-12 relative z-10 items-start">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-sm font-bold uppercase tracking-widest mb-6 border border-blue-500/20 shadow-inner">
                                <ShieldCheck className="w-4 h-4" /> The Protection Layer
                            </div>
                            <h3 className="text-3xl font-extrabold text-white mb-4">Securing Your Wealth</h3>
                            <p className="text-gray-300 text-base leading-relaxed mb-4">
                                You may use part of your general savings to purchase this recommended insurance coverage. Proper coverage acts as a shield for your invested corpus during emergencies.
                            </p>
                        </div>

                        <div className="space-y-5">
                            {/* Health Insurance */}
                            <div className="p-5 bg-gray-900/60 rounded-2xl border border-rose-500/30 hover:border-rose-400/60 transition duration-300 shadow-lg">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl shrink-0"><HeartPulse className="w-6 h-6" /></div>
                                    <h4 className="text-lg font-bold text-white">Health Insurance 🏥</h4>
                                </div>
                                <div className="space-y-2">
                                    {healthPlans.map((plan) => (
                                        <div key={plan.name} className="flex items-center justify-between bg-gray-800/50 rounded-xl px-4 py-3 border border-gray-700/40 hover:border-rose-500/30 transition">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-extrabold text-white tracking-wide">{plan.name}</p>
                                                    <a href={plan.url} target="_blank" rel="noopener noreferrer"
                                                        className="text-[10px] font-bold text-rose-400 hover:text-rose-300 underline underline-offset-2 transition shrink-0">
                                                        🔗 Visit
                                                    </a>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-0.5">Cover: <span className="text-white font-bold">{plan.cover}</span> &nbsp;|&nbsp; Premium: <span className="text-emerald-300 font-semibold">{plan.prem}</span></p>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap ml-3 shrink-0">{plan.tag}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Life Insurance */}
                            <div className="p-5 bg-gray-900/60 rounded-2xl border border-indigo-500/30 hover:border-indigo-400/60 transition duration-300 shadow-lg">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl shrink-0"><Shield className="w-6 h-6" /></div>
                                    <h4 className="text-lg font-bold text-white">Term Life Insurance 🛡️</h4>
                                </div>
                                <div className="space-y-2">
                                    {lifePlans.map((plan) => (
                                        <div key={plan.name} className="flex items-center justify-between bg-gray-800/50 rounded-xl px-4 py-3 border border-gray-700/40 hover:border-indigo-500/30 transition">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-extrabold text-white tracking-wide">{plan.name}</p>
                                                    <a href={plan.url} target="_blank" rel="noopener noreferrer"
                                                        className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition shrink-0">
                                                        🔗 Visit
                                                    </a>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-0.5">Cover: <span className="text-white font-bold">{plan.cover}</span> &nbsp;|&nbsp; Premium: <span className="text-indigo-300 font-semibold">{plan.prem}</span></p>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 whitespace-nowrap ml-3 shrink-0">{plan.tag}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>


                {/* STEP 6: FINANCIAL HEALTH RADAR */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-gray-800/40 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-gray-700/50 shadow-2xl relative overflow-hidden"
                >
                    {hasMounted && <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />}

                    <div className="text-center mb-10 relative z-10">
                        <h3 className="text-3xl font-extrabold text-white mb-3">📡 Financial Health Radar</h3>
                        <p className="text-gray-400 max-w-xl mx-auto">A multidimensional scan of your financial fitness across 5 key dimensions.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={[
                                    { axis: 'Time\nHorizon', value: Math.min(100, Math.max(10, ((financialData.targetRetirementAge - financialData.age) / 35) * 100)) },
                                    { axis: 'Capital\nBase', value: Math.min(100, Math.max(5, (netInvestedSavings / Math.max(income * 12, 1)) * 20)) },
                                    { axis: 'Monthly\nSurplus', value: Math.min(100, Math.max(5, (investmentBudget / Math.max(income, 1)) * 100)) },
                                    { axis: 'Insurance\nCover', value: 30 },
                                    { axis: 'Risk\nAlignment', value: stratName.includes('High Growth') ? 90 : stratName.includes('Balanced') ? 60 : 35 },
                                ]} cx="50%" cy="50%" outerRadius="80%">
                                    <PolarGrid stroke="#374151" />
                                    <PolarAngleAxis dataKey="axis" tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 600 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="You" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.25} strokeWidth={2} />
                                    <Tooltip formatter={(v: any) => `${Math.round(v)}%`} contentStyle={{ backgroundColor: '#1f2937', borderRadius: '10px', border: '1px solid #374151', color: '#fff' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="space-y-4">
                            {[
                                { label: 'Time Horizon', score: Math.min(100, Math.max(10, ((financialData.targetRetirementAge - financialData.age) / 35) * 100)), desc: `${financialData.targetRetirementAge - financialData.age} yrs to retirement` },
                                { label: 'Capital Base', score: Math.min(100, Math.max(5, (netInvestedSavings / Math.max(income * 12, 1)) * 20)), desc: `${formatIndianCurrency(netInvestedSavings)} net invested` },
                                { label: 'Monthly Surplus', score: Math.min(100, Math.max(5, (investmentBudget / Math.max(income, 1)) * 100)), desc: `${formatIndianCurrency(investmentBudget)}/mo for investing` },
                                { label: 'Insurance Cover', score: 30, desc: `Recommendation active` },
                                { label: 'Risk Alignment', score: stratName.includes('High Growth') ? 90 : stratName.includes('Balanced') ? 60 : 35, desc: stratName },
                            ].map((dim, i) => {
                                const s = Math.round(dim.score);
                                const color = s >= 70 ? '#10b981' : s >= 40 ? '#f59e0b' : '#ef4444';
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-semibold text-gray-300">{dim.label}</span>
                                            <span className="text-xs font-bold" style={{ color }}>{s}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${s}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1.2, delay: i * 0.1, ease: 'easeOut' }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: color }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">{dim.desc}</p>
                                    </div>
                                );
                            })}
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
                                    tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`}
                                    width={90}
                                />
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <Tooltip
                                    formatter={(value: any) => formatIndianCurrency(value)}
                                    labelStyle={{ color: '#9ca3af' }}
                                    contentStyle={{ backgroundColor: '#1f2937', borderRadius: '16px', border: '1px solid #374151', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                                />
                                {/* FIRE number checkpoint */}
                                {financialData.selectedFireAmount && financialData.selectedFireAmount > 0 && (
                                    <ReferenceLine
                                        y={financialData.selectedFireAmount}
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                        strokeDasharray="6 3"
                                        label={{
                                            value: `🎯 ${financialData.primaryGoal || 'FIRE'}: ${formatIndianCurrency(financialData.selectedFireAmount)}`,
                                            fill: '#f59e0b',
                                            fontSize: 11,
                                            fontWeight: 700,
                                            position: 'insideTopRight',
                                        }}
                                    />
                                )}
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

                    {missesFireGoal && (
                        <div className="mb-8 p-4 bg-rose-900/40 border border-rose-500/50 rounded-xl text-center shadow-lg">
                            <p className="text-rose-400 font-bold flex flex-col md:flex-row items-center justify-center gap-2">
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                                <span>Based on an 8% return assumption from debt funds, the FIRE goal may not be reached within your selected timeframe of {yearsToRetire} years.</span>
                            </p>
                        </div>
                    )}

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

            </div >
        </div >
    );
};
