import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatIndianCurrency } from '../utils/currency';

const INPUT_QUESTIONS = [
  {
    question: "What is your current age?",
    type: 'select',
    key: 'ageBracket',
    options: [
      { label: 'Under 25', value: 1 },
      { label: '25–34', value: 2 },
      { label: '35–44', value: 3 },
      { label: '45–54', value: 4 },
      { label: '55+', value: 5 }
    ]
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
    question: "What is your current investable portfolio size?",
    type: 'select',
    key: 'portfolioBracket',
    options: [
      { label: 'Under ₹10,000', value: 1 },
      { label: '₹10,000 – ₹50,000', value: 2 },
      { label: '₹50,000 – ₹2,50,000', value: 3 },
      { label: '₹2,50,000 – ₹10,00,000', value: 4 },
      { label: '₹1 Lakh+', value: 5 }
    ]
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

  const handleFireSelection = (goal: string) => {
    setAnswers({ ...answers, primaryGoal: goal });
    setStep(step + 1);
  };

  const handleComplete = (finalStrategy: string) => {
    const ageMap: Record<number, number> = { 1: 22, 2: 30, 3: 40, 4: 50, 5: 60 };
    const retireMap: Record<number, number> = { 1: 38, 2: 43, 3: 48, 4: 55, 5: 65 };

    const currentAge = ageMap[answers.ageBracket as number] || 25;
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

    const finalData = {
      ...answers,
      age: currentAge,
      targetRetirementAge: retireAge,
      timePressure,
      foundationLevel,
      riskProfile: finalStrategy,
      mostImportantMetric: 'Years to FIRE' as const
    };

    updateFinancialData(finalData);
    navigate('/profile', { state: { tutorialMode: true } });
  };

  const handleSelectOption = (value: number) => {
    const qIndex = step > INPUT_QUESTIONS.length ? step - 1 : step;
    const currentQ = ALL_QUESTIONS[qIndex];
    setAnswers({ ...answers, [currentQ.key]: value });
    setStep(step + 1);
  };

  const renderInputStep = () => {
    const qIndex = step > INPUT_QUESTIONS.length ? step - 1 : step;
    const q = ALL_QUESTIONS[qIndex];
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full transition-colors duration-300">
        <div className="text-center mb-6">
          <p className="text-emerald-600 dark:text-emerald-400 font-semibold">Step {qIndex + 1} of {ALL_QUESTIONS.length + 3}</p>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-2">{q.question}</h2>
        </div>

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
      </div>
    );
  };

  const renderStatusTemplateStep = () => {
    const ageMap: Record<number, number> = { 1: 22, 2: 30, 3: 40, 4: 50, 5: 60 };
    const retireMap: Record<number, number> = { 1: 38, 2: 43, 3: 48, 4: 55, 5: 65 };

    const currentAge = ageMap[answers.ageBracket as number] || 25;
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

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full transition-colors duration-300">
        <div className="text-center mb-6">
          <p className="text-emerald-600 dark:text-emerald-400 font-semibold">Status Template</p>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-2">Retirement Gap Readiness</h2>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Time Horizon (Years to Retire)</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{yearsToRetire} Years</p>
            <p className="text-sm font-medium mt-2">
              Time Pressure: <span className="text-emerald-600 dark:text-emerald-400">{timePressure}</span>
            </p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Financial Foundation Score</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{foundationAverage.toFixed(1)} <span className="text-base font-normal text-gray-500">/ 5.0</span></p>
            <p className="text-sm font-medium mt-2">
              Level: <span className="text-emerald-600 dark:text-emerald-400">{foundationLevel}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setStep(step + 1)}
          className="mt-8 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl transition duration-300"
        >
          Continue
        </button>
      </div>
    );
  };

  const renderFireSelectionStep = () => {
    const estimatedAnnualExpenses = 600000;
    const inflationRate = 0.06;

    const ageMap: Record<number, number> = { 1: 22, 2: 30, 3: 40, 4: 50, 5: 60 };
    const retireMap: Record<number, number> = { 1: 38, 2: 43, 3: 48, 4: 55, 5: 65 };
    const currentAge = ageMap[answers.ageBracket as number] || 25;
    const retirementAge = retireMap[answers.targetRetirementAgeBracket as number] || 60;

    const yearsToInvest = Math.max(0, retirementAge - currentAge);

    const futureAnnualExpenses = estimatedAnnualExpenses * Math.pow(1 + inflationRate, yearsToInvest);
    const leanFire = futureAnnualExpenses * 20;
    const tradFire = futureAnnualExpenses * 25;
    const fatFire = futureAnnualExpenses * 30;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full transition-colors duration-300">
        <div className="text-center mb-6">
          <p className="text-emerald-600 dark:text-emerald-400 font-semibold">Step {ALL_QUESTIONS.length + 2} of {ALL_QUESTIONS.length + 3}</p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose your FIRE Target</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Based on your estimated monthly expenses of {formatIndianCurrency(estimatedAnnualExpenses / 12)}
            <br />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              (Adjusted for 6% inflation over {yearsToInvest} years)
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleFireSelection('Lean FIRE')}
            className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition text-left group"
          >
            <div className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">Lean FIRE</div>
            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-1">{formatIndianCurrency(leanFire)}</div>
            <div className="text-sm text-gray-500 dark:text-gray-500">20x Future Annual Expenses</div>
          </button>

          <button
            onClick={() => handleFireSelection('Traditional FIRE')}
            className="p-6 border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-800/40 transition text-left relative"
          >
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs px-2 py-1 rounded-bl-lg font-bold">Recommended</div>
            <div className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-2">Traditional FIRE</div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-1">{formatIndianCurrency(tradFire)}</div>
            <div className="text-sm text-emerald-700 dark:text-emerald-500">25x Future Annual Expenses</div>
          </button>

          <button
            onClick={() => handleFireSelection('Fat FIRE')}
            className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition text-left group"
          >
            <div className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2 group-hover:text-purple-700 dark:group-hover:text-purple-400">Fat FIRE</div>
            <div className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-1">{formatIndianCurrency(fatFire)}</div>
            <div className="text-sm text-gray-500 dark:text-gray-500">30x Future Annual Expenses</div>
          </button>
        </div>
      </div>
    );
  };

  const renderStrategyResultStep = () => {
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
    const execScore = (a.income + a.method + a.activePref + a.global + a.style) / 5;

    let baseStrategy = "Capital Stability Strategy";
    if (riskScore > 1.7 && riskScore <= 2.4) baseStrategy = "Balanced Growth Strategy";
    else if (riskScore > 2.4) baseStrategy = "High Growth Strategy";

    let isFlag1 = (riskScore >= 2.5 && a.income === 1);
    let isFlag2 = (a.safeAlloc === 1 && a.goal === 3);
    let isFlag3 = (a.exp === 1 && a.smallcap === 3);

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

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-xl w-full transition-colors duration-300">
        <div className="text-center mb-6">
          <p className="text-emerald-600 dark:text-emerald-400 font-semibold">Final Step</p>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Your Indian Market Strategy</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl border border-emerald-200 dark:border-emerald-700">
            <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-300">{finalStrategy}</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">{description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-500">Risk Score</p>
              <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{riskScore.toFixed(2)} / 3.0</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-500">Execution Capacity</p>
              <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{execScore.toFixed(2)} / 3.0</p>
            </div>
          </div>

          {(isFlag1 || isFlag2 || isFlag3) && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-xl border border-amber-200 dark:border-amber-700 mt-4">
              <p className="text-amber-800 dark:text-amber-300 font-semibold text-sm mb-1">Strategy Adjustments Applied:</p>
              <ul className="text-xs text-amber-700 dark:text-amber-400 list-disc pl-4 space-y-1">
                {isFlag1 && <li>High growth preference with unstable income.</li>}
                {isFlag2 && <li>Conflicting safety and growth priorities.</li>}
                {isFlag3 && <li>Low experience with high volatility exposure.</li>}
              </ul>
            </div>
          )}
        </div>

        <button
          onClick={() => handleComplete(finalStrategy)}
          className="mt-8 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl transition duration-300 flex items-center justify-center"
        >
          Complete Setup
        </button>
      </div>
    );
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const progress = ((step + 1) / (ALL_QUESTIONS.length + 3)) * 100;

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
