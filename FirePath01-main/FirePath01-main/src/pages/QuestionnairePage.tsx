import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatIndianCurrency } from '../utils/currency';

const INPUT_QUESTIONS = [
  {
    question: "What's your current age?",
    type: 'number',
    key: 'age',
    placeholder: "e.g. 25"
  },
  {
    question: "At what age do you want to retire?",
    type: 'number',
    key: 'targetRetirementAge',
    placeholder: "e.g. 45"
  },
  {
    question: "What's your monthly income after tax?",
    type: 'number',
    key: 'monthlyIncome',
    placeholder: "₹"
  },
  {
    question: "How much are your monthly expenses?",
    type: 'number',
    key: 'monthlyExpenses',
    placeholder: "₹"
  },
  {
    question: "What are your current savings?",
    type: 'number',
    key: 'currentSavings',
    placeholder: "Total investments, cash, etc."
  },
];

export const QuestionnairePage = () => {
  const navigate = useNavigate();
  const { user, updateFinancialData } = useAuth();

  const [step, setStep] = useState(0); // 0 to N-1 for inputs, N for FIRE selection, N+1 for Risk
  const [answers, setAnswers] = useState<any>({});
  const [inputValue, setInputValue] = useState('');

  // Derived state for FIRE calculation
  const annualExpenses = (Number(answers.monthlyExpenses) || 0) * 12;

  const handleInputNext = (val: string) => {
    if (!val) return;
    const currentQ = INPUT_QUESTIONS[step];
    setAnswers({ ...answers, [currentQ.key]: Number(val) });
    setInputValue('');
    setStep(step + 1);
  };

  const handleFireSelection = (goal: string) => {
    setAnswers({ ...answers, primaryGoal: goal });
    setStep(step + 1);
  };

  const handleRiskSelection = (risk: string) => {
    // Final save
    const finalData = {
      ...answers,
      riskProfile: risk.toLowerCase() as 'safe' | 'medium' | 'risky',
      // Default metric if not asked
      mostImportantMetric: 'Years to FIRE' as const
    };

    updateFinancialData(finalData);
    navigate('/profile', { state: { tutorialMode: true } });
  };

  const renderInputStep = () => {
    const q = INPUT_QUESTIONS[step];
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <p className="text-emerald-600 font-semibold">Step {step + 1} of {INPUT_QUESTIONS.length + 2}</p>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">{q.question}</h2>
        </div>

        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleInputNext(inputValue)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-emerald-500 mb-6"
          placeholder={q.placeholder}
          autoFocus
        />

        <button
          onClick={() => handleInputNext(inputValue)}
          disabled={!inputValue}
          className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-emerald-700 transition disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  };

  const renderFireSelectionStep = () => {
    // Calculate Future Value of Expenses
    // Formula: Future Expense = Present Expense * (1 + inflation)^years
    // Assuming 6% inflation standard
    const inflationRate = 0.06;
    const currentAge = Number(answers.age) || 25;
    const retirementAge = Number(answers.targetRetirementAge) || 60;
    const yearsToInvest = Math.max(0, retirementAge - currentAge);

    // Calculate Annual Expenses at Retirement Age
    const futureAnnualExpenses = annualExpenses * Math.pow(1 + inflationRate, yearsToInvest);

    const leanFire = futureAnnualExpenses * 20;
    const tradFire = futureAnnualExpenses * 25;
    const fatFire = futureAnnualExpenses * 30;

    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <p className="text-emerald-600 font-semibold">Step {step + 1}</p>
          <h2 className="text-2xl font-bold text-gray-900">Choose your FIRE Target</h2>
          <p className="text-gray-600 mt-2">
            Based on your monthly expenses of {formatIndianCurrency(Number(answers.monthlyExpenses))}
            <br />
            <span className="text-xs text-gray-500">
              (Adjusted for 6% inflation over {yearsToInvest} years)
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleFireSelection('Lean FIRE')}
            className="p-6 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition text-left group"
          >
            <div className="text-lg font-semibold text-gray-600 mb-2">Lean FIRE</div>
            <div className="text-xl font-bold text-emerald-700 mb-1">{formatIndianCurrency(leanFire)}</div>
            <div className="text-sm text-gray-500">20x Future Annual Expenses</div>
          </button>

          <button
            onClick={() => handleFireSelection('Traditional FIRE')}
            className="p-6 border-2 border-emerald-500 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition text-left relative"
          >
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs px-2 py-1 rounded-bl-lg font-bold">Recommended</div>
            <div className="text-lg font-bold text-emerald-800 mb-2">Traditional FIRE</div>
            <div className="text-2xl font-bold text-emerald-700 mb-1">{formatIndianCurrency(tradFire)}</div>
            <div className="text-sm text-emerald-700">25x Future Annual Expenses</div>
          </button>

          <button
            onClick={() => handleFireSelection('Fat FIRE')}
            className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition text-left group"
          >
            <div className="text-lg font-semibold text-gray-600 mb-2 group-hover:text-purple-700">Fat FIRE</div>
            <div className="text-xl font-bold text-purple-700 mb-1">{formatIndianCurrency(fatFire)}</div>
            <div className="text-sm text-gray-500">30x Future Annual Expenses</div>
          </button>
        </div>
      </div>
    );
  };

  const renderRiskStep = () => {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-xl w-full">
        <div className="text-center mb-6">
          <p className="text-emerald-600 font-semibold">Final Step</p>
          <h2 className="text-2xl font-bold text-gray-800">What's your risk tolerance?</h2>
        </div>

        <div className="space-y-3">
          {[
            { id: 'Safe', icon: '🛡️', desc: 'Preserve capital, lower returns' },
            { id: 'Medium', icon: '⚖️', desc: 'Balanced growth and stability' },
            { id: 'Risky', icon: '🚀', desc: 'Max growth, higher volatility' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => handleRiskSelection(opt.id)}
              className="w-full flex items-center p-4 border border-gray-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 transition text-left"
            >
              <span className="text-3xl mr-4">{opt.icon}</span>
              <div>
                <div className="font-bold text-lg text-gray-800">{opt.id}</div>
                <div className="text-sm text-gray-500">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const progress = ((step + 1) / (INPUT_QUESTIONS.length + 2)) * 100;

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-8">
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {step < INPUT_QUESTIONS.length && renderInputStep()}
      {step === INPUT_QUESTIONS.length && renderFireSelectionStep()}
      {step === INPUT_QUESTIONS.length + 1 && renderRiskStep()}
    </div>
  );
};
