import { useState } from 'react';
import { useAuth, type User } from '../context/AuthContext';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignInModal = ({ isOpen, onClose }: SignInModalProps) => {
  const { signIn } = useAuth();
  const [step, setStep] = useState<'form' | 'slider'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Financial sliders
  const [monthlyIncome, setMonthlyIncome] = useState(50000);
  const [currentSavings, setCurrentSavings] = useState(500000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(30000);
  const [age, setAge] = useState(30);
  const [targetRetirementAge, setTargetRetirementAge] = useState(50);

  if (!isOpen) return null;

  const handleFormSubmit = () => {
    if (name.trim() && email.trim()) {
      setStep('slider');
    }
  };

  const handleSliderSubmit = () => {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      financialData: {
        monthlyIncome,
        currentSavings,
        monthlyExpenses,
        age,
        targetRetirementAge,
      },
      createdAt: new Date(),
    };
    signIn(user);
    onClose();
    setStep('form');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-8">
        {step === 'form' ? (
          <>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Welcome to FIREPath</h2>
            <p className="text-gray-600 mb-8">Let's start by getting to know you and your financial goals.</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleFormSubmit}
              className="w-full bg-emerald-700 text-white py-3 rounded-lg font-bold hover:bg-emerald-800 transition"
            >
              Next: Financial Details
            </button>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Financial Profile</h2>
            <p className="text-gray-600 mb-8">Help us understand your current financial situation. You can adjust these anytime.</p>

            <div className="space-y-6 mb-8 max-h-96 overflow-y-auto">
              {/* Monthly Income */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Income: <span className="text-emerald-700 font-bold">₹{monthlyIncome.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="10000"
                  max="500000"
                  step="5000"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-xs text-gray-500 mt-1">₹10,000 - ₹500,000</div>
              </div>

              {/* Current Savings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Savings: <span className="text-emerald-700 font-bold">₹{currentSavings.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10000000"
                  step="50000"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-xs text-gray-500 mt-1">₹0 - ₹1,00,00,000</div>
              </div>

              {/* Monthly Expenses */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Expenses: <span className="text-emerald-700 font-bold">₹{monthlyExpenses.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="5000"
                  max="200000"
                  step="1000"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-xs text-gray-500 mt-1">₹5,000 - ₹2,00,000</div>
              </div>

              {/* Current Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Age: <span className="text-emerald-700 font-bold">{age}</span>
                </label>
                <input
                  type="range"
                  min="18"
                  max="65"
                  step="1"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-xs text-gray-500 mt-1">18 - 65 years</div>
              </div>

              {/* Target Retirement Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Retirement Age: <span className="text-emerald-700 font-bold">{targetRetirementAge}</span>
                </label>
                <input
                  type="range"
                  min={age + 1}
                  max="80"
                  step="1"
                  value={targetRetirementAge}
                  onChange={(e) => setTargetRetirementAge(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-xs text-gray-500 mt-1">{age + 1} - 80 years</div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-blue-50 rounded-lg p-4 mb-8 border border-blue-200">
              <p className="text-sm text-gray-700 mb-3">
                <strong>Financial Summary:</strong>
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Annual Income: <strong className="text-blue-700">₹{(monthlyIncome * 12).toLocaleString()}</strong></li>
                <li>• Current Savings: <strong className="text-blue-700">₹{currentSavings.toLocaleString()}</strong></li>
                <li>• Annual Expenses: <strong className="text-blue-700">₹{(monthlyExpenses * 12).toLocaleString()}</strong></li>
                <li>• Years Until Retirement: <strong className="text-blue-700">{targetRetirementAge - age}</strong></li>
                <li>• Annual Surplus: <strong className="text-blue-700">₹{((monthlyIncome - monthlyExpenses) * 12).toLocaleString()}</strong></li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep('form' as any)}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                onClick={handleSliderSubmit}
                className="flex-1 bg-emerald-700 text-white py-3 rounded-lg font-bold hover:bg-emerald-800 transition"
              >
                Complete Profile
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
