import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatIndianCurrency } from '../utils/currency';
import { motion } from 'framer-motion';
import { Clock, Shield, ArrowRight, TrendingUp, AlertTriangle } from 'lucide-react';

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
      { label: 'Comfortable staying invested for several years', value: 2 },
      { label: 'Comfortable staying invested long-term', value: 3 }
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
];

const ALL_QUESTIONS = [...INPUT_QUESTIONS, ...RISK_QUESTIONS];

export const QuestionnairePage = () => {
  const navigate = useNavigate();
  const { user, updateFinancialData } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [manualCategory, setManualCategory] = useState<string | null>(null);

  const getFundIcon = (fundName: string): string => {
    const name = fundName.toLowerCase();
    // Gold funds
    if (name.includes('gold')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Gold_symbol.svg/120px-Gold_symbol.svg.png';
    // Overnight / Liquid / Debt
    if (name.includes('overnight') || name.includes('liquid') || name.includes('debt') || name.includes('bond'))
      return 'https://cdn-icons-png.flaticon.com/512/2942/2942079.png';
    // Index / Nifty / Sensex
    if (name.includes('index') || name.includes('nifty') || name.includes('sensex'))
      return 'https://cdn-icons-png.flaticon.com/512/4521/4521576.png';
    // ICICI Prudential
    if (name.includes('icici')) return 'https://www.icicipruamc.com/images/icici-pru-amc-logo.png';
    // HDFC MF
    if (name.includes('hdfc')) return 'https://www.hdfcfund.com/Content/images/hdfcbank-logo.png';
    // SBI MF
    if (name.includes('sbi')) return 'https://www.sbimf.com/SBIMFLogo.svg';
    // Kotak MF
    if (name.includes('kotak')) return 'https://assetmanagement.kotak.com/images/kotak-logo.png';
    // Nippon India
    if (name.includes('nippon')) return 'https://mf.nipponindiaim.com/NipponIndiaLogo.png';
    // UTI MF
    if (name.includes('uti')) return 'https://www.utimf.com/uti-logo.png';
    // Parag Parikh
    if (name.includes('parag parikh') || name.includes('ppfas')) return 'https://amc.ppfas.com/images/ppfas-logo.png';
    // Axis MF
    if (name.includes('axis')) return 'https://www.axismf.com/images/axismflogo.png';
    // Mirae
    if (name.includes('mirae')) return 'https://www.miraeassetmf.co.in/images/logo.png';
    // Quant
    if (name.includes('quant')) return 'https://quantmutual.com/images/logo.png';
    // Mid cap / Small cap / Flexi / Multi icon fallback
    if (name.includes('mid cap') || name.includes('midcap')) return 'https://cdn-icons-png.flaticon.com/512/2278/2278442.png';
    if (name.includes('small cap') || name.includes('smallcap')) return 'https://cdn-icons-png.flaticon.com/512/2278/2278393.png';
    // Generic equity / growth fund
    return 'https://cdn-icons-png.flaticon.com/512/4521/4521576.png';
  };

  const handleFireSelection = (goal: string, fireAmount: number) => {
    setAnswers({ ...answers, primaryGoal: goal, selectedFireAmount: fireAmount });
    setStep(step + 1);
  };

  const handleComplete = (finalStrategy: string) => {
    const retireMap: Record<number, number> = { 1: 38, 2: 43, 3: 48, 4: 55, 5: 65 };

    const currentAge = answers.exactAge ? Number(answers.exactAge) : 25;
    const retireAge = retireMap[answers.targetRetirementAgeBracket as number] || 60;
    const monthlyIncome = answers.monthlyIncome ? Number(answers.monthlyIncome) : 0;
    const monthlyExpenses = answers.monthlyExpenses ? Number(answers.monthlyExpenses) : 0;
    const currentSavings = answers.currentSavings ? Number(answers.currentSavings) : 0;
    const selectedFireAmount = answers.selectedFireAmount ? Number(answers.selectedFireAmount) : 0;

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
      mostImportantMetric: 'Years to FIRE' as const
    };

    updateFinancialData(finalData);
    navigate('/strategy-explanation');
  };

  const handleSelectOption = (value: number) => {
    const qIndex = step > INPUT_QUESTIONS.length ? step - 1 : step;
    const currentQ = ALL_QUESTIONS[qIndex];
    setAnswers({ ...answers, [currentQ.key]: value });
    setStep(step + 1);
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
                className="w-full text-left px-6 py-4 bg-gray-50 dark:bg-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900 border border-gray-200 dark:border-gray-600 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl transition-all duration-200 text-gray-800 dark:text-white font-medium shadow-sm hover:shadow-md"
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
              className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 rounded-xl transition-all duration-200 text-gray-800 dark:text-white font-medium shadow-sm outline-none"
              placeholder={(q as any).placeholder || "Enter value..."}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e') {
                  e.preventDefault();
                }
                if (e.key === 'Enter' && e.currentTarget.value) {
                  const val = Number(e.currentTarget.value);
                  if (val < 0) {
                    alert("Negative values are not allowed! Please enter a valid non-negative number.");
                    return;
                  }
                  if (q.key === 'exactAge' && val < 18) {
                    alert("You must be at least 18 years old to proceed.");
                    return;
                  }
                  handleSelectOption(val);
                }
              }}
            />
            <p className="text-xs text-gray-500 text-center mt-2">Press Enter to continue</p>
          </div>
        )}
      </div>
    );
  };

  const renderStatusTemplateStep = () => {
    // ── NEW: income split logic ──────────────────────────────────────
    const income = answers.monthlyIncome ? Number(answers.monthlyIncome) : 0;
    const expenses = answers.monthlyExpenses ? Number(answers.monthlyExpenses) : 0;
    const surplus = Math.max(0, income - expenses);
    // Minimum savings buffer recommendation: at least 10% of income or ₹2,000, whichever is bigger
    const minSavings = Math.max(2000, income * 0.10);
    const investable = Math.max(0, surplus - minSavings);
    const canInvest = investable >= 1000; // need at least 1k to invest in any single fund

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
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-3xl w-full border border-white/20 dark:border-gray-700/50 relative overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="text-center mb-8 relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl mb-4"
          >
            <Shield className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </motion.div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400">
            Initial Analysis Complete
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-3 max-w-md mx-auto">
            Before we move on to risk assessment, here is a snapshot of your current financial baseline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {/* Time Horizon Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 rounded-lg ${pressureBg}`}>
                <PressureIcon className={`w-5 h-5 ${pressureColor}`} />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Time Horizon</h3>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  {yearsToRetire} <span className="text-xl font-normal text-gray-500">Yrs</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">to Target Retirement</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Action Pressure:</span>
                <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${pressureBg} ${pressureColor}`}>
                  {timePressure}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Foundation Score Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 rounded-lg ${foundationBg}`}>
                <Shield className={`w-5 h-5 ${foundationColor}`} />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Capital Foundation</h3>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  {foundationAverage.toFixed(1)} <span className="text-xl font-normal text-gray-500">/ 5.0</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Health Score</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${foundationProgress}%` }}
                  transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${foundationColor.replace('text-', 'bg-')}`}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-500 font-medium">Rating:</span>
                <span className={`text-xs font-bold ${foundationColor}`}>{foundationLevel}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Income Split Breakdown ─────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 relative z-10"
        >
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">Monthly Income Breakdown</h3>
          {income > 0 ? (
            <div className="space-y-2">
              {/* Expenses bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-rose-500">Expenses</span>
                  <span className="font-bold text-rose-600">₹{expenses.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((expenses / income) * 100, 100)}%` }} transition={{ delay: 0.6, duration: 1 }} className="h-full bg-rose-400 rounded-full" />
                </div>
              </div>
              {/* Savings buffer bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-amber-500">Savings Buffer (recommended)</span>
                  <span className="font-bold text-amber-600">₹{minSavings.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((minSavings / income) * 100, 100)}%` }} transition={{ delay: 0.75, duration: 1 }} className="h-full bg-amber-400 rounded-full" />
                </div>
              </div>
              {/* Investable bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-emerald-600">Investable Surplus</span>
                  <span className="font-bold text-emerald-700">₹{investable.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((investable / income) * 100, 100)}%` }} transition={{ delay: 0.9, duration: 1 }} className={`h-full rounded-full ${canInvest ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No income data provided.</p>
          )}

          {/* Advisory suggestion */}
          <div className={`mt-4 p-4 rounded-xl border text-sm font-medium leading-relaxed ${canInvest
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
            : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
            }`}>
            {canInvest ? (
              <>
                ✅ <strong>Great!</strong> You can invest <strong>₹{investable.toLocaleString('en-IN')}/month</strong> after expenses and a safety buffer. This covers at least <strong>{Math.floor(investable / 1000)}</strong> funds at the ₹1,000 minimum each.
              </>
            ) : (
              <>
                ⚠️ <strong>Action needed:</strong> Your current surplus leaves less than ₹1,000 to invest. We recommend saving at least <strong>₹{(expenses + minSavings + 1000).toLocaleString('en-IN')}/month</strong> in total or reducing expenses to unlock investing capacity.
              </>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8 flex justify-center relative z-10"
        >
          <button
            onClick={() => setStep(step + 1)}
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gray-900 dark:bg-white dark:text-gray-900 font-pj rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            <span>Proceed to Risk Assessment</span>
            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </motion.div>
    );
  };

  const renderFireSelectionStep = () => {
    const income = answers.monthlyIncome ? Number(answers.monthlyIncome) : 0;
    const expenses = answers.monthlyExpenses ? Number(answers.monthlyExpenses) : 0;
    // Use actual expenses for FIRE calculation; fallback to a placeholder if user skipped
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
            onClick={() => handleFireSelection('Lean FIRE', leanFire)}
            className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition text-left group"
          >
            <div className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">Lean FIRE 🌿</div>
            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-1">{formatIndianCurrency(leanFire)}</div>
            <div className="text-sm text-gray-500 dark:text-gray-500">20x Future Annual Expenses</div>
          </button>

          <button
            onClick={() => handleFireSelection('Traditional FIRE', tradFire)}
            className="p-6 border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-800/40 transition text-left relative"
          >
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs px-2 py-1 rounded-bl-lg font-bold">Recommended</div>
            <div className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-2">Traditional FIRE 🔥</div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-1">{formatIndianCurrency(tradFire)}</div>
            <div className="text-sm text-emerald-700 dark:text-emerald-500">25x Future Annual Expenses</div>
          </button>

          <button
            onClick={() => handleFireSelection('Fat FIRE', fatFire)}
            className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition text-left group"
          >
            <div className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2 group-hover:text-purple-700 dark:group-hover:text-purple-400">Fat FIRE 💎</div>
            <div className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-1">{formatIndianCurrency(fatFire)}</div>
            <div className="text-sm text-gray-500 dark:text-gray-500">30x Future Annual Expenses</div>
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
    const minSavings = Math.max(2000, income * 0.10);
    const investable = Math.max(0, surplus - minSavings);
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

    const getBaskets = (category: string) => {
      if (category === 'LOW RISK') {
        return [
          {
            title: "Basket 1 (Conservative)",
            funds: ["ICICI Prudential Corporate Bond Fund"]
          },
          {
            title: "Basket 2 (Balanced)",
            funds: ["HDFC Corporate Bond Fund"]
          },
          {
            title: "Basket 3 (Growth)",
            funds: ["Kotak Corporate Bond Fund"]
          }
        ];
      } else if (category === 'HIGH RISK') {
        return [
          {
            title: "Basket 1 (Aggressive Focus)",
            funds: ["SBI Focused Equity Fund", "Nippon India Small Cap Fund", "UTI Nifty 50 Index Fund"]
          },
          {
            title: "Basket 2 (Dynamic High Risk)",
            funds: ["ICICI Prudential Focused Equity Fund", "SBI Small Cap Fund", "ICICI Prudential Nifty 50 Index Fund"]
          },
          {
            title: "Basket 3 (Steady Aggressive)",
            funds: ["HDFC Focused Fund", "Kotak Small Cap Fund", "HDFC Nifty 50 Index Fund"]
          }
        ];
      } else {
        // MEDIUM RISK
        return [
          {
            title: "Basket 1 (Core Growth)",
            funds: ["UTI Nifty 50 Index Fund", "Parag Parikh Flexi Cap Fund", "Nippon India ETF Gold BeES"]
          },
          {
            title: "Basket 2 (Balanced Mix)",
            funds: ["ICICI Prudential Nifty 50 Index Fund", "HDFC Flexi Cap Fund", "Nippon India ETF Gold BeES"]
          },
          {
            title: "Basket 3 (Steady Medium)",
            funds: ["HDFC Nifty 50 Index Fund", "Kotak Flexicap Fund", "Nippon India ETF Gold BeES"]
          }
        ];
      }
    };

    const displayCategory = manualCategory || riskCategory;
    const baskets = getBaskets(displayCategory);

    // Default estimated growth rates
    const growthRates: Record<string, string> = {
      'LOW RISK': '7-9% p.a.',
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
          {/* Investable amount summary */}
          <div className={`mt-4 inline-flex gap-2 items-center px-5 py-2.5 rounded-full text-sm font-bold border ${investable >= MIN_FUND
            ? 'bg-emerald-900/30 border-emerald-500/40 text-emerald-300'
            : 'bg-amber-900/30 border-amber-500/40 text-amber-300'
            }`}>
            {investable >= MIN_FUND
              ? `💰 Investable surplus: ₹${investable.toLocaleString('en-IN')}/mo · ${Math.floor(investable / MIN_FUND)} fund slots @ ₹${MIN_FUND.toLocaleString('en-IN')} min each`
              : `⚠️ Surplus too low to invest (₹${investable.toLocaleString('en-IN')}). Aim to save ≥ ₹${(expenses + minSavings + MIN_FUND).toLocaleString('en-IN')}/mo`
            }
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          <div className="space-y-6 lg:col-span-1 border-b pb-8 lg:pb-0 lg:border-b-0 lg:border-r border-gray-700/50 lg:pr-6">
            <div className="p-6 bg-gradient-to-br from-emerald-900/60 to-gray-900 rounded-2xl border border-emerald-500/30 shadow-xl overflow-hidden relative group transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 pointer-events-none transition-transform duration-700 group-hover:scale-150" />
              <h3 className="text-2xl font-bold text-emerald-400 mb-3 drop-shadow-sm relative z-10">{finalStrategy}</h3>
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

            <button
              onClick={() => {
                let strategyName = finalStrategy;
                if (manualCategory === 'LOW RISK') strategyName = "Capital Stability Strategy";
                if (manualCategory === 'HIGH RISK') strategyName = "High Growth Strategy";
                if (manualCategory === 'MEDIUM RISK') strategyName = "Balanced Growth Strategy";
                handleComplete(strategyName);
              }}
              className="mt-6 w-full bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-bold py-4 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] rounded-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Finish Setup <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="lg:col-span-2 space-y-6 relative z-10">
            <div className="flex bg-gray-800/60 p-1.5 rounded-2xl mb-2 backdrop-blur-md border border-gray-700/50 overflow-x-auto no-scrollbar">
              {['LOW RISK', 'MEDIUM RISK', 'HIGH RISK'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setManualCategory(cat)}
                  className={`flex-1 min-w-[120px] py-3 text-sm font-bold rounded-xl transition-all duration-300 ${displayCategory === cat
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-lg shadow-emerald-900/50 transform scale-[1.02]'
                    : 'text-gray-500 hover:text-white hover:bg-gray-800/50'
                    }`}
                >
                  {cat} {riskCategory === cat && '✨'}
                </button>
              ))}
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
                    {basket.funds.map((fund, fIdx) => {
                      const perFund = basket.funds.length > 0
                        ? Math.floor(investable / basket.funds.length)
                        : 0;
                      const isViable = perFund >= MIN_FUND;
                      return (
                        <li key={fIdx} className="text-xs text-gray-200 flex flex-col items-start gap-2 bg-gray-800/40 p-3 rounded-lg border border-gray-700/30">
                          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md p-0.5 shrink-0 overflow-hidden">
                            <img src={getFundIcon(fund)} alt="amc logo" className="w-full h-full rounded-full object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                          </div>
                          <span className="leading-snug font-medium line-clamp-2">{fund}</span>
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
                      handleComplete(strategyName);
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
