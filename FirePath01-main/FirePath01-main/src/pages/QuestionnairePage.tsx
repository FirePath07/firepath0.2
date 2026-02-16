import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const questions = [
  {
    question: "What's your primary financial goal?",
    options: ["Retire early and travel", "Build a safety net", "Grow my wealth", "Buy a home"],
    key: 'primaryGoal'
  },
  {
    question: "Which metric is most important for you to track?",
    options: ["Savings Rate", "Years to FIRE", "Net Worth"],
    key: 'mostImportantMetric'
  },
  {
    question: "How do you feel about investment risk?",
    options: ["Safe", "Medium", "Risky"],
    key: 'riskProfile'
  },
  {
    question: "What's your current age?",
    type: 'number',
    key: 'age'
  },
  {
    question: "At what age do you want to retire?",
    type: 'number',
    key: 'targetRetirementAge'
  },
  {
    question: "What's your monthly income after tax?",
    type: 'number',
    key: 'monthlyIncome'
  },
  {
    question: "How much are your monthly expenses?",
    type: 'number',
    key: 'monthlyExpenses'
  },
  {
    question: "What are your current savings?",
    type: 'number',
    key: 'currentSavings'
  },
];

export const QuestionnairePage = () => {
  const navigate = useNavigate();
  const { user, updateFinancialData } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [inputValue, setInputValue] = useState('');

  const handleAnswer = (key: string, value: string | number) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);
    
    // For multiple choice questions, move to next question automatically
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.type !== 'number') {
      handleNext(newAnswers);
    }
  };

  const handleNext = (currentAnswers: any) => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setInputValue(''); // Reset input for next question
    } else {
      // Last question, save data and navigate to profile
      const financialData = {
        monthlyIncome: Number(currentAnswers.monthlyIncome) || 0,
        currentSavings: Number(currentAnswers.currentSavings) || 0,
        monthlyExpenses: Number(currentAnswers.monthlyExpenses) || 0,
        age: Number(currentAnswers.age) || 0,
        targetRetirementAge: Number(currentAnswers.targetRetirementAge) || 0,
        primaryGoal: currentAnswers.primaryGoal,
        mostImportantMetric: currentAnswers.mostImportantMetric,
        riskProfile: currentAnswers.riskProfile.toLowerCase() as 'safe' | 'medium' | 'risky',
      };
      updateFinancialData(financialData);
      navigate('/profile');
    }
  };
  
  if (!user) {
    // Redirect to login if no user is signed in
    navigate('/login');
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-4">
      {/* Progress Bar */}
      <div className="w-full max-w-md mb-4">
          <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{width: `${progress}%`}}
              />
          </div>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
            <p className="text-emerald-600 font-semibold">Question {currentQuestionIndex + 1} of {questions.length}</p>
            <h2 className="text-2xl font-bold text-gray-800 mt-2">{currentQuestion.question}</h2>
        </div>
        
        <div className="space-y-4">
          {currentQuestion.type === 'number' ? (
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={(e) => handleAnswer(currentQuestion.key, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter a number"
            />
          ) : (
            currentQuestion.options?.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(currentQuestion.key, option)}
                className="w-full text-left p-4 bg-gray-100 rounded-lg font-medium text-gray-700 hover:bg-emerald-100 hover:text-emerald-800 transition"
              >
                {option}
              </button>
            ))
          )}
        </div>
        
        {currentQuestion.type === 'number' && (
            <button
            onClick={() => handleNext(answers)}
            className="w-full mt-6 bg-emerald-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-emerald-700 transition"
            >
            Next
            </button>
        )}
      </div>
    </div>
  );
};
