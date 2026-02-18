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
                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h3>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-medium text-gray-700">Monthly Income</label>
                                        <div className="relative w-32">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                            <input
                                                type="number"
                                                name="monthlyIncome"
                                                value={formData.monthlyIncome}
                                                onChange={handleNumberChange}
                                                className="w-full pl-6 pr-2 py-1 border border-gray-300 rounded text-right focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold text-emerald-700"
                                            />
                                        </div>
                                    </div>
                                    <input type="range" name="monthlyIncome" min="10000" max="1000000" step="1000" value={formData.monthlyIncome} onChange={handleNumberChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-medium text-gray-700">Monthly Expenses</label>
                                        <div className="relative w-32">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                            <input
                                                type="number"
                                                name="monthlyExpenses"
                                                value={formData.monthlyExpenses}
                                                onChange={handleNumberChange}
                                                className="w-full pl-6 pr-2 py-1 border border-gray-300 rounded text-right focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold text-emerald-700"
                                            />
                                        </div>
                                    </div>
                                    <input type="range" name="monthlyExpenses" min="5000" max="500000" step="1000" value={formData.monthlyExpenses} onChange={handleNumberChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-medium text-gray-700">Current Savings</label>
                                        <div className="relative w-40">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                            <input
                                                type="number"
                                                name="currentSavings"
                                                value={formData.currentSavings}
                                                onChange={handleNumberChange}
                                                className="w-full pl-6 pr-2 py-1 border border-gray-300 rounded text-right focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold text-emerald-700"
                                            />
                                        </div>
                                    </div>
                                    <input type="range" name="currentSavings" min="0" max="50000000" step="10000" value={formData.currentSavings} onChange={handleNumberChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-medium text-gray-700">Age</label>
                                            <input
                                                type="number"
                                                name="age"
                                                value={formData.age}
                                                onChange={handleNumberChange}
                                                className="w-16 py-1 border border-gray-300 rounded text-center focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold text-gray-800"
                                            />
                                        </div>
                                        <input type="range" name="age" min="18" max="80" step="1" value={formData.age} onChange={handleNumberChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-medium text-gray-700">Target Age</label>
                                            <input
                                                type="number"
                                                name="targetRetirementAge"
                                                value={formData.targetRetirementAge}
                                                onChange={handleNumberChange}
                                                className="w-16 py-1 border border-gray-300 rounded text-center focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold text-gray-800"
                                            />
                                        </div>
                                        <input type="range" name="targetRetirementAge" min="30" max="90" step="1" value={formData.targetRetirementAge} onChange={handleNumberChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                                    </div>
                                </div>
                            </div>
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
