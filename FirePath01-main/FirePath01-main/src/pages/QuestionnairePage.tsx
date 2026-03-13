import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatIndianCurrency } from '../utils/currency';
import { motion } from 'framer-motion';
import { Clock, Shield, ArrowRight, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { FundIcon } from '../components/FundIcon';

const INPUT_QUESTIONS = [
  {
    question: "What is your current exact age?",
    type: 'number',
    key: 'exactAge',
    placeholder: 'e.g., 30'
  },
  {
    question: "What is your exact monthly income (₹)?",
    type: 'number',
    key: 'monthlyIncome',
    placeholder: 'e.g., 50000'
  },
  {
    question: "What are your total monthly expenses (₹)?",
    type: 'number',
    key: 'monthlyExpenses',
    placeholder: 'e.g., 25000'
  },
  {
    question: "What age would you ideally like to retire?",
    type: 'select',
    key: 'targetRetirementAgeBracket',
    options: [
      { label: 'Before 40', value: 1 },
      { label: '40–45', value: 2 },
      { label: '46–50', value: 3 },
      { label: '51–60', value: 4 },
      { label: '60+', value: 5 }
    ]
  },
  {
    question: "What percentage of your income do you currently save?",
    type: 'select',
    key: 'savingsRateBracket',
    options: [
      { label: 'Under 10%', value: 1 },
      { label: '10–20%', value: 2 },
      { label: '21–35%', value: 3 },
      { label: '36–50%', value: 4 },
      { label: '50%+', value: 5 }
    ]
  },
  {
    question: "How many months of emergency savings do you have?",
    type: 'select',
    key: 'emergencyBufferBracket',
    options: [
      { label: '0–2 months', value: 1 },
      { label: '3–5 months', value: 2 },
      { label: '6–9 months', value: 3 },
      { label: '10–18 months', value: 4 },
      { label: '18+ months', value: 5 }
    ]
  },
  {
    question: "What is your current investable corpus / total savings (₹)?",
    type: 'number',
    key: 'currentSavings',
    placeholder: 'e.g., 200000'
  },
  {
    question: "Do you have financial dependents?",
    type: 'select',
    key: 'dependentsBracket',
    options: [
      { label: 'None', value: 1 },
      { label: '1–2', value: 2 },
      { label: '3+', value: 3 }
    ]
  }
];

const RISK_QUESTIONS = [
  {
    question: "What kind of returns would make you feel comfortable?",
    type: 'select',
    key: 'returnPref',
    options: [
      { label: 'Steady growth with low ups and downs', value: 1 },
      { label: 'Moderate growth with occasional volatility', value: 2 },
      { label: 'Strong growth even if markets fluctuate sharply', value: 3 }
    ]
  },
  {
    question: "If your portfolio falls noticeably during a market correction, you would:",
    type: 'select',
    key: 'drawReact',
    options: [
      { label: 'Shift money to safer funds', value: 1 },
      { label: 'Stay invested and wait', value: 2 },
      { label: 'Invest more through SIP', value: 3 }
    ]
  },
  {
    question: "Which investment mix feels most suitable to you?",
    type: 'select',
    key: 'style',
    options: [
      { label: 'Mostly Debt Funds, Liquid Funds, and Fixed Income', value: 1 },
      { label: 'Mix of Index Funds and Hybrid Funds', value: 2 },
      { label: 'Equity Funds including Mid/Small Cap exposure', value: 3 }
    ]
  },
  {
    question: "How comfortable are you investing in Mid-cap or Small-cap funds?",
    type: 'select',
    key: 'smallcap',
    options: [
      { label: 'Not comfortable', value: 1 },
      { label: 'Limited exposure only', value: 2 },
      { label: 'Comfortable with meaningful allocation', value: 3 }
    ]
  },
  {
    question: "Would you allocate money to sectoral or thematic funds?",
    type: 'select',
    key: 'thematic',
    options: [
      { label: 'Prefer to avoid', value: 1 },
      { label: 'Small portion only', value: 2 },
      { label: 'Yes, if long-term opportunity', value: 3 }
    ]
  },
  {
    question: "How long can you stay invested without needing this money?",
    type: 'select',
    key: 'horizon',
    options: [
      { label: 'Need flexibility', value: 1 },
      { label: 'Comfortable staying invested for several years (up to 10 years)', value: 2 },
      { label: 'Comfortable staying invested long-term (easily over 10 years)', value: 3 }
    ]
  },
  {
    question: "What portion of your portfolio would you allocate to gold or safer assets?",
    type: 'select',
    key: 'safeAlloc',
    options: [
      { label: 'Large portion for stability', value: 1 },
      { label: 'Moderate allocation', value: 2 },
      { label: 'Small allocation, growth focused', value: 3 }
    ]
  },
  {
    question: "Your preferred investment method:",
    type: 'select',
    key: 'method',
    options: [
      { label: 'Lump sum when markets feel safe', value: 1 },
      { label: 'Regular SIP investing', value: 2 },
      { label: 'SIP + tactical investing during corrections', value: 3 }
    ]
  },
  {
    question: "Experience with Indian market volatility (e.g., corrections):",
    type: 'select',
    key: 'exp',
    options: [
      { label: 'Limited experience', value: 1 },
      { label: 'Experienced a few corrections', value: 2 },
      { label: 'Stayed invested during major downturns', value: 3 }
    ]
  },
  {
    question: "Income stability to support investing:",
    type: 'select',
    key: 'income',
    options: [
      { label: 'Variable income', value: 1 },
      { label: 'Stable salary', value: 2 },
      { label: 'Stable with additional income sources', value: 3 }
    ]
  },
  {
    question: "How actively do you want to manage your investments?",
    type: 'select',
    key: 'activePref',
    options: [
      { label: 'Prefer simple and automatic', value: 1 },
      { label: 'Review periodically', value: 2 },
      { label: 'Actively monitor and rebalance', value: 3 }
    ]
  },
  {
    question: "What is your primary investment goal?",
    type: 'select',
    key: 'goal',
    options: [
      { label: 'Capital protection', value: 1 },
      { label: 'Long-term wealth creation', value: 2 },
      { label: 'Accelerated wealth growth', value: 3 }
    ]
  },
  {
    question: "Would you consider investing internationally through global funds?",
    type: 'select',
    key: 'global',
    options: [
      { label: 'Prefer India-only investments', value: 1 },
      { label: 'Small global exposure', value: 2 },
      { label: 'Meaningful global diversification', value: 3 }
    ]
  }
].map(q => ({
  ...q,
  options: [...q.options].sort(() => Math.random() - 0.5)
}));

const ALL_QUESTIONS = [...INPUT_QUESTIONS, ...RISK_QUESTIONS];

export const QuestionnairePage = () => {
  const navigate = useNavigate();
  const { user, updateFinancialData } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [manualCategory, setManualCategory] = useState<string | null>(null);


  // removed handleFireSelection

  const handleComplete = (finalStrategy: string, selectedBasketData?: any) => {
    const retireMap: Record<number, number> = { 1: 38, 2: 43, 3: 48, 4: 55, 5: 65 };

    const currentAge = answers.exactAge ? Number(answers.exactAge) : 25;
    const retireAge = retireMap[answers.targetRetirementAgeBracket as number] || 60;
    const monthlyIncome = answers.monthlyIncome ? Number(answers.monthlyIncome) : 0;
    const monthlyExpenses = answers.monthlyExpenses ? Number(answers.monthlyExpenses) : 0;
    const currentSavings = answers.currentSavings ? Number(answers.currentSavings) : 0;
    const selectedFireAmount = answers.selectedFireAmount ? Number(answers.selectedFireAmount) : 0;

    const surplus = Math.max(0, monthlyIncome - monthlyExpenses);
    const splurgeMoney = surplus >= 3000 ? (surplus - 3000) * 0.15 : 0;
    const defaultMonthlySIP = Math.max(0, surplus - splurgeMoney);

    const yearsToRetire = retireAge > currentAge ? retireAge - currentAge : 0;
    let timePressure = "Low";
    if (yearsToRetire <= 5) timePressure = "Extreme";
    else if (yearsToRetire >= 6 && yearsToRetire <= 10) timePressure = "High";
    else if (yearsToRetire >= 11 && yearsToRetire <= 20) timePressure = "Moderate";

    // Derive portfolio score from exact savings amount
    let portfolioScore = 1;
    if (currentSavings >= 10000 && currentSavings < 50000) portfolioScore = 2;
    if (currentSavings >= 50000 && currentSavings < 250000) portfolioScore = 3;
    if (currentSavings >= 250000 && currentSavings < 1000000) portfolioScore = 4;
    if (currentSavings >= 1000000) portfolioScore = 5;

    const scoreSum = (Number(answers.savingsRateBracket) || 1) +
      (Number(answers.emergencyBufferBracket) || 1) +
      portfolioScore;

    const foundationAverage = scoreSum / 3;
    let foundationLevel = "Weak foundation";
    if (foundationAverage >= 2.1 && foundationAverage <= 3.0) foundationLevel = "Developing";
    else if (foundationAverage >= 3.1 && foundationAverage <= 4.0) foundationLevel = "Strong";
    else if (foundationAverage >= 4.1) foundationLevel = "Very Strong";

    const finalData = {
      ...answers,
      age: currentAge,
      monthlyIncome,
      monthlyExpenses,
      currentSavings,
      selectedFireAmount,
      targetRetirementAge: retireAge,
      timePressure,
      foundationLevel,
      riskProfile: finalStrategy,
      mostImportantMetric: 'Years to FIRE' as const,
      defaultMonthlySIP,
      ...(selectedBasketData && { selectedBasket: selectedBasketData })
    };

    updateFinancialData(finalData);
    navigate('/strategy-explanation');
  };

  const handleSelectOption = (value: number) => {
    const qIndex = step > INPUT_QUESTIONS.length ? step - 1 : step;
    const currentQ = ALL_QUESTIONS[qIndex];
    setAnswers({ ...answers, [currentQ.key]: value });
  };

  const renderInputStep = () => {
    const isRiskPhase = step > INPUT_QUESTIONS.length;
    const qIndex = isRiskPhase ? step - 1 : step;
    const q = ALL_QUESTIONS[qIndex];

    const displayStep = isRiskPhase ? (step - INPUT_QUESTIONS.length) : (step + 1);
    const totalPhaseSteps = isRiskPhase ? RISK_QUESTIONS.length : INPUT_QUESTIONS.length;
    const phaseName = isRiskPhase ? "Risk Assessment" : "Financial Baseline";

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full transition-colors duration-300">
        <div className="text-center mb-6">
          <p className="text-emerald-600 dark:text-emerald-400 font-semibold">{phaseName}: Step {displayStep} of {totalPhaseSteps}</p>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-2">{q.question}</h2>
        </div>

        {q.type === 'select' ? (
          <div className="space-y-4">
            {q.options?.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelectOption(opt.value)}
                className={`w-full text-left px-6 py-4 border rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md ${answers[q.key] === opt.value
                  ? 'bg-emerald-100 dark:bg-emerald-800 border-emerald-500 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500 ring-opacity-50'
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900 border-gray-200 dark:border-gray-600 hover:border-emerald-500 dark:hover:border-emerald-500 text-gray-800 dark:text-white'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="number"
              min={q.key === 'exactAge' ? "18" : "0"}
              value={answers[q.key] === undefined ? '' : answers[q.key]}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : Number(e.target.value);
                setAnswers({ ...answers, [q.key]: val });
              }}
              className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 rounded-xl transition-all duration-200 text-gray-800 dark:text-white font-medium shadow-sm outline-none"
              placeholder={(q as any).placeholder || "Enter value..."}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e') {
                  e.preventDefault();
                }
                if (e.key === 'Enter') {
                  const val = answers[q.key];
                  if (val === undefined || val === '') return;
                  if (Number(val) < 0) {
                    alert("Negative values are not allowed! Please enter a valid non-negative number.");
                    return;
                  }
                  if (q.key === 'exactAge' && Number(val) < 18) {
                    alert("You must be at least 18 years old to proceed.");
                    return;
                  }
                  setStep(step + 1);
                }
              }}
            />
          </div>
        )}

        <div className="mt-8 flex justify-between gap-4">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${step === 0
              ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
          >
            Previous
          </button>
          <button
            onClick={() => {
              const val = answers[q.key];
              if (val === undefined || val === '') {
                alert("Please provide an answer before continuing.");
                return;
              }
              if (typeof val === 'number' && val < 0) {
                alert("Negative values are not allowed!");
                return;
              }
              if (q.key === 'exactAge' && Number(val) < 18) {
                alert("You must be at least 18 years old to proceed.");
                return;
              }
              setStep(step + 1);
            }}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            Continue <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderStatusTemplateStep = () => {
    // ── NEW: income split logic ──────────────────────────────────────
    const income = answers.monthlyIncome ? Number(answers.monthlyIncome) : 0;
    const expenses = answers.monthlyExpenses ? Number(answers.monthlyExpenses) : 0;
    const surplus = Math.max(0, income - expenses);
    const splurgeMoney = surplus >= 3000 ? (surplus - 3000) * 0.15 : 0;
    const investable = Math.max(0, surplus - splurgeMoney);
    const canInvest = investable >= 1000;
    const isDeficit = expenses > income;

    const retireMap: Record<number, number> = { 1: 38, 2: 43, 3: 48, 4: 55, 5: 65 };
    const currentAge = answers.exactAge ? Number(answers.exactAge) : 25;
    const retireAge = retireMap[answers.targetRetirementAgeBracket as number] || 60;

    const yearsToRetire = retireAge > currentAge ? retireAge - currentAge : 0;

    let timePressure = "Low";
    let pressureColor = "text-emerald-500";
    let pressureBg = "bg-emerald-500/10";
    let PressureIcon = TrendingUp;

    if (yearsToRetire <= 5) {
      timePressure = "Extreme";
      pressureColor = "text-red-500";
      pressureBg = "bg-red-500/10";
      PressureIcon = AlertTriangle;
    } else if (yearsToRetire >= 6 && yearsToRetire <= 10) {
      timePressure = "High";
      pressureColor = "text-orange-500";
      pressureBg = "bg-orange-500/10";
      PressureIcon = AlertTriangle;
    } else if (yearsToRetire >= 11 && yearsToRetire <= 20) {
      timePressure = "Moderate";
      pressureColor = "text-amber-500";
      pressureBg = "bg-amber-500/10";
      PressureIcon = Clock;
    }

    const scoreSum = (Number(answers.savingsRateBracket) || 1) +
      (Number(answers.emergencyBufferBracket) || 1) +
      (Number(answers.portfolioBracket) || 1);

    const foundationAverage = scoreSum / 3;
    let foundationLevel = "Weak";
    let foundationColor = "text-red-500";
    let foundationBg = "bg-red-500/10";
    const foundationProgress = foundationAverage / 5 * 100;

    if (foundationAverage >= 2.1 && foundationAverage <= 3.0) {
      foundationLevel = "Developing";
      foundationColor = "text-amber-500";
      foundationBg = "bg-amber-500/10";
    } else if (foundationAverage >= 3.1 && foundationAverage <= 4.0) {
      foundationLevel = "Strong";
      foundationColor = "text-emerald-500";
      foundationBg = "bg-emerald-500/10";
    } else if (foundationAverage >= 4.1) {
      foundationLevel = "Very Strong";
      foundationColor = "text-blue-500";
      foundationBg = "bg-blue-500/10";
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white dark:bg-[#0f172a] rounded-[2.5rem] shadow-2xl p-8 md:p-12 max-w-3xl w-full border border-gray-100 dark:border-slate-800 relative overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

        <div className="text-center mb-10 relative z-10">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", damping: 12 }}
            className="inline-flex items-center justify-center p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl mb-6 shadow-sm"
          >
            <Shield className="w-10 h-10 text-emerald-600" />
          </motion.div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">
            Financial <span className="text-emerald-500 not-italic">Baseline</span> Snapshot
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 font-medium max-w-lg mx-auto">
            This forms the core of your strategy. Review your current standing before we move to your risk preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 relative z-10">
          {/* Time Horizon Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="group p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 transition-all hover:border-emerald-500/30"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${pressureBg}`}>
                  <PressureIcon className={`w-5 h-5 ${pressureColor}`} />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest text-[10px]">Time Horizon</h3>
              </div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm ${pressureBg} ${pressureColor}`}>
                {timePressure}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{yearsToRetire}</span>
              <span className="text-xl font-bold text-slate-400 uppercase tracking-widest italic">Years</span>
            </div>
            <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-tight">Until Target Retirement</p>
          </motion.div>

          {/* Foundation Health Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="group p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 transition-all hover:border-emerald-500/30"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${foundationBg}`}>
                  <Shield className={`w-5 h-5 ${foundationColor}`} />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest text-[10px]">Health Score</h3>
              </div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm ${foundationBg} ${foundationColor}`}>
                {foundationLevel}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{foundationAverage.toFixed(1)}</span>
              <span className="text-xl font-bold text-slate-400 uppercase tracking-widest italic">/ 5.0</span>
            </div>
            
            <div className="mt-4">
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${foundationProgress}%` }}
                  transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]`}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Income Split Breakdown - Better Presented */}
        {isDeficit ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-10 bg-rose-500/5 dark:bg-rose-500/10 border-2 border-dashed border-rose-500/30 rounded-[2.5rem] text-center relative z-10"
          >
            <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-500/20 rotate-3">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-black text-rose-500 mb-4 uppercase italic tracking-tight underline decoration-4 decoration-rose-500/20">Critical: Cashflow Deficit</h3>
            <p className="text-rose-600 dark:text-rose-400 font-bold leading-relaxed mb-10 max-w-md mx-auto">
              Your expenses (₹{expenses.toLocaleString('en-IN')}) are higher than your income (₹{income.toLocaleString('en-IN')}).
            </p>
            <button
              onClick={() => setStep(0)}
              className="px-10 py-4 bg-rose-500 text-white font-black rounded-2xl hover:bg-rose-600 transition shadow-xl shadow-rose-500/30 uppercase tracking-widest text-xs"
            >
              Correct Your Figures
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative z-10 p-8 md:p-10 bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-800"
          >
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-8 italic">Salary Allocation Engine</h3>
            
            {income > 0 ? (
              <div className="space-y-8">
                {/* Visual stacked bar */}
                <div className="h-6 w-full flex bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${(expenses / income) * 100}%` }} 
                    transition={{ delay: 0.7, duration: 1.2 }} 
                    className="h-full bg-rose-500 group relative cursor-help" 
                  />
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${(splurgeMoney / income) * 100}%` }} 
                    transition={{ delay: 0.9, duration: 1.2 }} 
                    className="h-full bg-amber-500 group relative cursor-help border-l-2 border-slate-900/10" 
                  />
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${(investable / income) * 100}%` }} 
                    transition={{ delay: 1.1, duration: 1.2 }} 
                    className={`h-full ${canInvest ? 'bg-emerald-500' : 'bg-slate-400'} border-l-2 border-slate-900/10`} 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Fixed Expenses</span>
                    </div>
                    <p className="text-lg font-black text-slate-900 dark:text-white">₹{expenses.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] font-bold text-slate-400">{Math.round((expenses / income) * 100)}% of Salary</p>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Splurge Buffer</span>
                    </div>
                    <p className="text-lg font-black text-slate-900 dark:text-white">₹{splurgeMoney.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] font-bold text-slate-400">Fixed 15% Allocation</p>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Investable SIP</span>
                    </div>
                    <p className="text-xl font-black text-emerald-500">₹{investable.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] font-bold text-emerald-500/60 font-black italic">Remaining Surplus</p>
                  </div>
                </div>

                <div className={`mt-4 p-5 rounded-2xl border flex items-start gap-4 transition-all duration-300 ${canInvest
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-900 dark:text-emerald-400'
                  : 'bg-amber-500/5 border-amber-500/20 text-amber-900 dark:text-amber-400'
                }`}>
                  <div className="mt-1">
                    {canInvest ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
                  </div>
                  <div className="text-sm font-bold leading-relaxed">
                    {canInvest ? (
                      <>
                        System identifies <strong>₹{investable.toLocaleString('en-IN')}/month</strong> available for strategic deployment. This covers <strong>{Math.floor(investable / 1000)}</strong> diversified funds.
                      </>
                    ) : (
                      <>
                        Surplus below optimal threshold (₹1,000). We recommend optimizing expenses to unlock at least ₹1,000 for your first SIP.
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No income data detected.</p>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-12 flex gap-4 relative z-10"
        >
          <button
            onClick={() => setStep(step - 1)}
            className="px-8 py-5 font-black text-slate-400 uppercase tracking-widest text-[10px] bg-slate-100 dark:bg-slate-900 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
          >
            Back
          </button>
          <button
            onClick={() => {
              if (isDeficit) {
                alert("Please correct the cashflow deficit to proceed.");
                return;
              }
              setStep(step + 1);
            }}
            disabled={isDeficit}
            className={`flex-1 group relative inline-flex items-center justify-center px-10 py-5 font-black text-white transition-all duration-300 rounded-2xl shadow-xl uppercase tracking-widest text-[11px] ${isDeficit 
              ? 'bg-slate-300 cursor-not-allowed' 
              : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/20 translate-y-0 hover:-translate-y-1'}`}
          >
            <span>Proceed to Risk Profile</span>
            {!isDeficit && <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />}
          </button>
        </motion.div>
      </motion.div >
    );
  };

  const renderFireSelectionStep = () => {
    const income = answers.monthlyIncome ? Number(answers.monthlyIncome) : 0;
    const expenses = answers.monthlyExpenses ? Number(answers.monthlyExpenses) : 0;
    const annualExpenses = (expenses > 0 ? expenses : income * 0.50) * 12;
    const inflationRate = 0.06;

    const retireMap: Record<number, number> = { 1: 38, 2: 43, 3: 48, 4: 55, 5: 65 };
    const currentAge = answers.exactAge ? Number(answers.exactAge) : 25;
    const retirementAge = retireMap[answers.targetRetirementAgeBracket as number] || 60;
    const yearsToInvest = Math.max(0, retirementAge - currentAge);

    const futureAnnualExpenses = annualExpenses * Math.pow(1 + inflationRate, yearsToInvest);
    const leanFire = Math.round(futureAnnualExpenses * 20);
    const tradFire = Math.round(futureAnnualExpenses * 25);
    const fatFire = Math.round(futureAnnualExpenses * 30);

    const handleFireSelectionLocal = (goal: string, fireAmount: number) => {
      setAnswers({ ...answers, primaryGoal: goal, selectedFireAmount: fireAmount });
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full transition-colors duration-300">
        <div className="text-center mb-6">
          <p className="text-emerald-600 dark:text-emerald-400 font-semibold">Final Steps</p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose your FIRE Target</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Based on your monthly expenses of {formatIndianCurrency(expenses > 0 ? expenses : income * 0.50)}
            <br />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              (Adjusted for 6% inflation over {yearsToInvest} years to retirement)
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleFireSelectionLocal('Lean FIRE', leanFire)}
            className={`p-6 border-2 rounded-xl transition text-left group ${answers.primaryGoal === 'Lean FIRE'
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/50'
              : 'border-gray-200 dark:border-gray-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
              }`}
          >
            <div className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">Lean FIRE 🌿</div>
            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-1">{formatIndianCurrency(leanFire)}</div>
            <div className="text-sm text-gray-500 dark:text-gray-500">20x Future Annual Expenses</div>
          </button>

          <button
            onClick={() => handleFireSelectionLocal('Traditional FIRE', tradFire)}
            className={`p-6 border-2 rounded-xl transition text-left relative ${answers.primaryGoal === 'Traditional FIRE'
              ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-800/60'
              : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-800/40'
              }`}
          >
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs px-2 py-1 rounded-bl-lg font-bold">Recommended</div>
            <div className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-2">Traditional FIRE 🔥</div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-1">{formatIndianCurrency(tradFire)}</div>
            <div className="text-sm text-emerald-700 dark:text-emerald-500">25x Future Annual Expenses</div>
          </button>

          <button
            onClick={() => handleFireSelectionLocal('Fat FIRE', fatFire)}
            className={`p-6 border-2 rounded-xl transition text-left group ${answers.primaryGoal === 'Fat FIRE'
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/50'
              : 'border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30'
              }`}
          >
            <div className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2 group-hover:text-purple-700 dark:group-hover:text-purple-400">Fat FIRE 💎</div>
            <div className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-1">{formatIndianCurrency(fatFire)}</div>
            <div className="text-sm text-gray-500 dark:text-gray-500">30x Future Annual Expenses</div>
          </button>
        </div>

        <div className="mt-8 flex justify-between gap-4">
          <button
            onClick={() => setStep(step - 1)}
            className="px-6 py-3 rounded-xl font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
          >
            Previous
          </button>
          <button
            onClick={() => {
              if (answers.primaryGoal) {
                setStep(step + 1);
              } else {
                alert("Please select a FIRE Target to continue.");
              }
            }}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            Continue <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderStrategyResultStep = () => {
    // ── Compute investable from actual income - expenses ──────────────
    const income = answers.monthlyIncome ? Number(answers.monthlyIncome) : 0;
    const expenses = answers.monthlyExpenses ? Number(answers.monthlyExpenses) : 0;
    const surplus = Math.max(0, income - expenses);
    const isLowSavings = surplus < 3000;
    
    // In low-savings, splurge is 0, SIP is full surplus
    const splurgeMoney = surplus >= 3000 ? (surplus - 3000) * 0.15 : 0;
    const investable = Math.max(0, surplus - splurgeMoney);
    const MIN_FUND = 1000; // minimum ₹1,000 per fund

    const a = {
      returnPref: Number(answers.returnPref) || 1,
      drawReact: Number(answers.drawReact) || 1,
      smallcap: Number(answers.smallcap) || 1,
      thematic: Number(answers.thematic) || 1,
      horizon: Number(answers.horizon) || 1,
      safeAlloc: Number(answers.safeAlloc) || 1,
      exp: Number(answers.exp) || 1,
      goal: Number(answers.goal) || 1,
      income: Number(answers.income) || 1,
      method: Number(answers.method) || 1,
      activePref: Number(answers.activePref) || 1,
      global: Number(answers.global) || 1,
      style: Number(answers.style) || 1,
    };

    const riskScore = (a.returnPref + a.drawReact + a.smallcap + a.thematic + a.horizon + a.safeAlloc + a.exp + a.goal) / 8;

    // Calculate time pressure & foundation level for display
    const currentAge = answers.exactAge ? Number(answers.exactAge) : 25;
    const retireMap: Record<number, number> = { 1: 38, 2: 43, 3: 48, 4: 55, 5: 65 };
    const retireAge = retireMap[answers.targetRetirementAgeBracket as number] || 60;
    const yearsToRetire = retireAge > currentAge ? retireAge - currentAge : 0;
    let timePressure = "Low";
    if (yearsToRetire <= 5) timePressure = "Extreme";
    else if (yearsToRetire >= 6 && yearsToRetire <= 10) timePressure = "High";
    else if (yearsToRetire >= 11 && yearsToRetire <= 20) timePressure = "Moderate";

    const scoreSum = (Number(answers.savingsRateBracket) || 1) +
      (Number(answers.emergencyBufferBracket) || 1) +
      (Number(answers.portfolioBracket) || 1);
    const foundationAverage = scoreSum / 3;
    let foundationLevel = "Weak foundation";
    if (foundationAverage >= 2.1 && foundationAverage <= 3.0) foundationLevel = "Developing";
    else if (foundationAverage >= 3.1 && foundationAverage <= 4.0) foundationLevel = "Strong";
    else if (foundationAverage >= 4.1) foundationLevel = "Very Strong";

    let baseStrategy = "Capital Stability Strategy";
    if (riskScore > 1.7 && riskScore <= 2.4) baseStrategy = "Balanced Growth Strategy";
    else if (riskScore > 2.4) baseStrategy = "High Growth Strategy";

    const isFlag1 = (riskScore >= 2.5 && a.income === 1);
    const isFlag2 = (a.safeAlloc === 1 && a.goal === 3);
    const isFlag3 = (a.exp === 1 && a.smallcap === 3);

    let finalStrategy = baseStrategy;

    if (isFlag1) {
      if (baseStrategy === "High Growth Strategy") finalStrategy = "Balanced Growth Strategy";
      else if (baseStrategy === "Balanced Growth Strategy") finalStrategy = "Capital Stability Strategy";
    }
    if (isFlag2) {
      finalStrategy = "Balanced Growth Strategy";
    }
    if (isFlag3) {
      if (finalStrategy === "High Growth Strategy") finalStrategy = "Balanced Growth Strategy (safer equity mix)";
      else if (finalStrategy === "Balanced Growth Strategy") finalStrategy = "Balanced Growth Strategy (more Debt/Gold)";
    }

    let description = "";
    if (finalStrategy.includes("Capital Stability")) description = "Focus on Debt Funds, Conservative Hybrid, Gold ETF, minimal equity exposure.";
    else if (finalStrategy.includes("High Growth")) description = "Equity-heavy, Mid/Small cap focus, global diversification, limited debt.";
    else description = "Core Nifty/Sensex, Flexi-cap, moderate debt/gold, balanced approach.";

    // Map to low/medium/high
    let riskCategory = 'MEDIUM RISK';
    if (finalStrategy.includes("Capital Stability")) riskCategory = 'LOW RISK';
    else if (finalStrategy.includes("High Growth")) riskCategory = 'HIGH RISK';

    // Enforcement: If low savings, only LOW RISK is actually allowed
    if (isLowSavings) {
      riskCategory = 'LOW RISK';
    }

    const getBaskets = (category: string) => {
      if (category === 'LOW RISK') {
        return [
          {
            title: "Basket 1 (Conservative)",
            funds: [{ name: "ICICI Prudential Corporate Bond Fund", split: 100 }]
          },
          {
            title: "Basket 2 (Balanced)",
            funds: [{ name: "HDFC Corporate Bond Fund", split: 100 }]
          },
          {
            title: "Basket 3 (Growth)",
            funds: [{ name: "Kotak Corporate Bond Fund", split: 100 }]
          }
        ];
      } else if (category === 'HIGH RISK') {
        return [
          {
            title: "Basket 1 (Aggressive Focus)",
            funds: [
              { name: "SBI Focused Equity Fund", split: 40 },
              { name: "Nippon India Small Cap Fund", split: 35 },
              { name: "UTI Nifty 50 Index Fund", split: 25 }
            ]
          },
          {
            title: "Basket 2 (Dynamic High Risk)",
            funds: [
              { name: "ICICI Prudential Focused Equity Fund", split: 40 },
              { name: "SBI Small Cap Fund", split: 35 },
              { name: "ICICI Prudential Nifty 50 Index Fund", split: 25 }
            ]
          },
          {
            title: "Basket 3 (Steady Aggressive)",
            funds: [
              { name: "HDFC Focused Fund", split: 40 },
              { name: "Kotak Small Cap Fund", split: 35 },
              { name: "HDFC Nifty 50 Index Fund", split: 25 }
            ]
          }
        ];
      } else {
        // MEDIUM RISK
        return [
          {
            title: "Basket 1 (Core Growth)",
            funds: [
              { name: "UTI Nifty 50 Index Fund", split: 50 },
              { name: "Parag Parikh Flexi Cap Fund", split: 30 },
              { name: "Nippon India ETF Gold BeES", split: 20 }
            ]
          },
          {
            title: "Basket 2 (Balanced Mix)",
            funds: [
              { name: "ICICI Prudential Nifty 50 Index Fund", split: 50 },
              { name: "HDFC Flexi Cap Fund", split: 30 },
              { name: "Nippon India ETF Gold BeES", split: 20 }
            ]
          },
          {
            title: "Basket 3 (Steady Medium)",
            funds: [
              { name: "HDFC Nifty 50 Index Fund", split: 50 },
              { name: "Kotak Flexicap Fund", split: 30 },
              { name: "Nippon India ETF Gold BeES", split: 20 }
            ]
          }
        ];
      }
    };

    const displayCategory = manualCategory || riskCategory;
    const baskets = getBaskets(displayCategory);

    // Default estimated growth rates
    const growthRates: Record<string, string> = {
      'LOW RISK': '8-9% p.a.',
      'MEDIUM RISK': '10-12% p.a.',
      'HIGH RISK': '13-16%+ p.a.'
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-[#0f172a] rounded-[2rem] shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)] p-8 max-w-5xl w-full border border-gray-800 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="text-center mb-8 relative z-10">
          <p className="text-emerald-400 font-bold tracking-widest uppercase text-sm mb-2 drop-shadow-sm">Final Recommendation</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-lg">
            Your Investment Strategy & Baskets
          </h2>
          {/* Low Savings Warning */}
          {isLowSavings ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-3 max-w-2xl mx-auto shadow-sm"
            >
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-200 text-left font-medium leading-relaxed">
                Based on your current income and expenses, your available investment amount is limited. 
                At the moment, you can only invest in the <strong>Low Risk (Debt Fund)</strong> basket. 
                Increasing your savings in the future will unlock more diversified investment options.
              </p>
            </motion.div>
          ) : (
            <div className={`mt-4 inline-flex gap-2 items-center px-5 py-2.5 rounded-full text-sm font-bold border ${investable >= MIN_FUND
              ? 'bg-emerald-900/30 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-900/30 border-amber-500/40 text-amber-300'
              }`}>
              {investable >= MIN_FUND
                ? `💰 Investable surplus: ₹${investable.toLocaleString('en-IN')}/mo`
                : `⚠️ Surplus too low to invest (₹${investable.toLocaleString('en-IN')}). Aim to save ≥ ₹${(expenses + MIN_FUND).toLocaleString('en-IN')}/mo`
              }
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          <div className="space-y-6 lg:col-span-1 border-b pb-8 lg:pb-0 lg:border-b-0 lg:border-r border-gray-700/50 lg:pr-6">
            <div className="p-6 bg-gradient-to-br from-emerald-900/60 to-gray-900 rounded-2xl border border-emerald-500/30 shadow-xl overflow-hidden relative group transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 pointer-events-none transition-transform duration-700 group-hover:scale-150" />
              <h3 className="text-2xl font-bold text-emerald-400 mb-3 drop-shadow-sm relative z-10 flex items-center gap-3">
                <span>{displayCategory === 'LOW RISK' ? '🛡️' : displayCategory === 'MEDIUM RISK' ? '⚖️' : '🚀'}</span>
                {finalStrategy}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed relative z-10">{description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/80 rounded-xl shadow-inner text-center md:text-left transition-colors duration-300 hover:bg-gray-800">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-semibold">Time Pressure</p>
                <p className="text-xl font-black text-white">{timePressure}</p>
              </div>
              <div className="p-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/80 rounded-xl shadow-inner text-center md:text-left transition-colors duration-300 hover:bg-gray-800">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-semibold">Financial Band</p>
                <p className="text-xl font-black text-white">{foundationLevel}</p>
              </div>
            </div>

            {(isFlag1 || isFlag2 || isFlag3) && (
              <div className="p-4 bg-amber-900/20 backdrop-blur-sm rounded-xl border border-amber-700/50 shadow-inner">
                <p className="text-amber-400 font-bold text-sm mb-2 flex items-center gap-2">
                  <span className="text-lg">⚠️</span> Adjustments:
                </p>
                <ul className="text-xs text-amber-200/80 list-disc pl-5 space-y-1.5 font-medium">
                  {isFlag1 && <li>High growth preference with unstable income.</li>}
                  {isFlag2 && <li>Conflicting safety and growth priorities.</li>}
                  {isFlag3 && <li>Low experience with high volatility exposure.</li>}
                </ul>
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-4 font-bold text-gray-400 bg-gray-800 rounded-xl shadow-md hover:bg-gray-700 transition-all duration-200"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  let strategyName = finalStrategy;
                  if (manualCategory === 'LOW RISK') strategyName = "Capital Stability Strategy";
                  if (manualCategory === 'HIGH RISK') strategyName = "High Growth Strategy";
                  if (manualCategory === 'MEDIUM RISK') strategyName = "Balanced Growth Strategy";

                  const defaultBasket = baskets[0];
                  const basketData = {
                    name: defaultBasket.title,
                    funds: defaultBasket.funds.map(f => ({
                      name: f.name,
                      split: f.split
                    }))
                  };
                  handleComplete(strategyName, basketData);
                }}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-bold py-4 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] rounded-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Finish Setup <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6 relative z-10">
            <div className="flex bg-gray-800/60 p-1.5 rounded-2xl mb-2 backdrop-blur-md border border-gray-700/50 overflow-x-auto no-scrollbar">
              {['LOW RISK', 'MEDIUM RISK', 'HIGH RISK'].map(cat => {
                const isDisabled = isLowSavings && cat !== 'LOW RISK';
                return (
                  <button
                    key={cat}
                    disabled={isDisabled}
                    onClick={() => setManualCategory(cat)}
                    className={`flex-1 min-w-[120px] py-3 text-sm font-bold rounded-xl transition-all duration-300 relative group/btn ${displayCategory === cat
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-lg shadow-emerald-900/50 transform scale-[1.02]'
                      : 'text-gray-500 hover:text-white hover:bg-gray-800/50'
                      } ${isDisabled ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
                  >
                    <span className="mr-2">{cat === 'LOW RISK' ? '🛡️' : cat === 'MEDIUM RISK' ? '⚖️' : '🚀'}</span>
                    <span className="flex flex-col">
                      <span>{cat} {riskCategory === cat && !isLowSavings && '✨'}</span>
                      {isDisabled && <span className="text-[8px] font-black uppercase text-amber-500/80">Min ₹3,000 req.</span>}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                Recommended Portfolios
                <span className="text-xs font-black tracking-widest text-gray-400 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700 uppercase">
                  {displayCategory}
                </span>
              </h3>
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                {displayCategory === riskCategory
                  ? `Based on your profile, expect an estimated growth of `
                  : `You manually selected this category. Expect an estimated growth of `}
                <strong className="text-emerald-400 font-bold">{growthRates[displayCategory]}</strong>. Choose a basket to start with.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {baskets.map((basket, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx, duration: 0.4 }}
                  key={idx}
                  className="relative group bg-gradient-to-b from-gray-800/90 to-gray-900/90 border border-gray-700 hover:border-emerald-500/50 rounded-2xl p-6 shadow-xl hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.3)] transition-all duration-300 flex flex-col h-full overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <h4 className="font-extrabold text-emerald-400 mb-5 border-b border-gray-700/80 pb-3 text-base relative z-10 drop-shadow-sm">
                    {basket.title}
                  </h4>

                  <ul className="flex-1 space-y-4 mb-8 relative z-10">
                    {basket.funds.map((fundObj, fIdx) => {
                      const fund = fundObj.name;
                      const split = fundObj.split;
                      const perFund = investable > 0
                        ? Math.floor(investable * (split / 100))
                        : 0;
                      const isViable = perFund >= MIN_FUND;
                      return (
                        <li key={fIdx} className="text-xs text-gray-200 flex flex-col items-start gap-2 bg-gray-800/40 p-3 rounded-lg border border-gray-700/30">
                          <FundIcon 
                            fundName={fund} 
                            className="w-8 h-8 md:w-10 md:h-10 shadow-md p-1" 
                          />
                          <span className="leading-snug font-medium line-clamp-2">{fund} <span className="text-gray-400">({split}%)</span></span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isViable
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                            }`}>
                            {isViable
                              ? `₹${perFund.toLocaleString('en-IN')}/mo`
                              : `Need ≥ ₹${MIN_FUND.toLocaleString('en-IN')}/mo`
                            }
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <button
                    onClick={() => {
                      let strategyName = finalStrategy;
                      if (manualCategory === 'LOW RISK') strategyName = "Capital Stability Strategy";
                      if (manualCategory === 'HIGH RISK') strategyName = "High Growth Strategy";
                      if (manualCategory === 'MEDIUM RISK') strategyName = "Balanced Growth Strategy";

                      const basketData = {
                        name: basket.title,
                        funds: basket.funds.map(f => ({
                          name: f.name,
                          split: f.split
                        }))
                      };
                      handleComplete(strategyName, basketData);
                    }}
                    className="w-full mt-auto py-2.5 bg-gray-800/80 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all duration-300 shadow-sm group-hover:shadow-emerald-500/20 relative z-10 text-sm"
                  >
                    Select Basket {idx + 1}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  let progress = 0;
  if (step < INPUT_QUESTIONS.length) {
    progress = ((step + 1) / INPUT_QUESTIONS.length) * 100;
  } else if (step === INPUT_QUESTIONS.length) {
    progress = 100;
  } else if (step > INPUT_QUESTIONS.length && step <= ALL_QUESTIONS.length) {
    progress = ((step - INPUT_QUESTIONS.length) / RISK_QUESTIONS.length) * 100;
  } else {
    progress = 100;
  }

  return (
    <div className="min-h-screen bg-emerald-50 dark:bg-gray-900 transition-colors duration-300 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-8">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {step < INPUT_QUESTIONS.length && renderInputStep()}
      {step === INPUT_QUESTIONS.length && renderStatusTemplateStep()}
      {step > INPUT_QUESTIONS.length && step <= ALL_QUESTIONS.length && renderInputStep()}
      {step === ALL_QUESTIONS.length + 1 && renderFireSelectionStep()}
      {step === ALL_QUESTIONS.length + 2 && renderStrategyResultStep()}
    </div>
  );
};
