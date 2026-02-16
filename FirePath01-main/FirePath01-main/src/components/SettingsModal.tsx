import { useState, useEffect } from 'react';
import { useAuth, type UserFinancialData } from '../context/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { user, updateFinancialData } = useAuth();
  const [formData, setFormData] = useState<Partial<UserFinancialData>>({});

  useEffect(() => {
    if (user) {
      setFormData(user.financialData);
    }
  }, [user, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = () => {
    updateFinancialData(formData);
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4">
        <div className="p-8 border-b">
            <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
            <p className="text-gray-600">Update your financial details and preferences.</p>
        </div>
        
        <div className="p-8 max-h-[60vh] overflow-y-auto">
            <div className="space-y-6">
            {/* Primary Goal */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Goal</label>
                <select name="primaryGoal" value={formData.primaryGoal} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                    <option>Retire early and travel</option>
                    <option>Build a safety net</option>
                    <option>Grow my wealth</option>
                    <option>Buy a home</option>
                </select>
            </div>

            {/* Most Important Metric */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Most Important Metric</label>
                <select name="mostImportantMetric" value={formData.mostImportantMetric} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                    <option>Savings Rate</option>
                    <option>Years to FIRE</option>
                    <option>Net Worth</option>
                </select>
            </div>

            {/* Risk Profile */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Risk Profile</label>
                <select name="riskProfile" value={formData.riskProfile} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                    <option value="safe">Safe</option>
                    <option value="medium">Medium</option>
                    <option value="risky">Risky</option>
                </select>
            </div>
            
            {/* Sliders for financial data */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Income: <span className="text-emerald-700 font-bold">₹{Number(formData.monthlyIncome).toLocaleString()}</span>
                </label>
                <input type="range" name="monthlyIncome" min="10000" max="500000" step="5000" value={formData.monthlyIncome} onChange={handleNumberChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Savings: <span className="text-emerald-700 font-bold">₹{Number(formData.currentSavings).toLocaleString()}</span>
                </label>
                <input type="range" name="currentSavings" min="0" max="10000000" step="50000" value={formData.currentSavings} onChange={handleNumberChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Expenses: <span className="text-emerald-700 font-bold">₹{Number(formData.monthlyExpenses).toLocaleString()}</span>
                </label>
                <input type="range" name="monthlyExpenses" min="5000" max="200000" step="1000" value={formData.monthlyExpenses} onChange={handleNumberChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Age: <span className="text-emerald-700 font-bold">{formData.age}</span>
                </label>
                <input type="range" name="age" min="18" max="65" step="1" value={formData.age} onChange={handleNumberChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Retirement Age: <span className="text-emerald-700 font-bold">{formData.targetRetirementAge}</span>
                </label>
                <input type="range" name="targetRetirementAge" min={Number(formData.age) + 1} max="80" step="1" value={formData.targetRetirementAge} onChange={handleNumberChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            </div>
            </div>
        </div>
        <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-end gap-4">
            <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-100 transition">
                Cancel
            </button>
            <button onClick={handleSubmit} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition">
                Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};
