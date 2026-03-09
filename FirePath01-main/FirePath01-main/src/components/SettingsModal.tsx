import { useState, useEffect } from 'react';
import { useAuth, type UserFinancialData } from '../context/AuthContext';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onHardResetRequest?: () => void;
}

export const SettingsModal = ({ isOpen, onClose, onHardResetRequest }: SettingsModalProps) => {
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
        const numValue = Number(value);
        if (numValue < 0) {
            alert("Negative values are not allowed.");
            return;
        }
        setFormData(prev => ({ ...prev, [name]: numValue }));
    };

    const handleSubmit = () => {
        updateFinancialData(formData);
        onClose();
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 transition-colors duration-300">
                <div className="p-8 border-b dark:border-gray-700">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h2>
                    <p className="text-gray-600 dark:text-gray-400">Update your financial details and preferences.</p>
                </div>

                <div className="p-8 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-6">
                        {/* Primary Goal */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Goal</label>
                            <select name="primaryGoal" value={formData.primaryGoal} onChange={handleChange} className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                                <option>Retire early and travel</option>
                                <option>Build a safety net</option>
                                <option>Grow my wealth</option>
                                <option>Buy a home</option>
                            </select>
                        </div>

                        {/* Most Important Metric */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Most Important Metric</label>
                            <select name="mostImportantMetric" value={formData.mostImportantMetric} onChange={handleChange} className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                                <option>Savings Rate</option>
                                <option>Years to FIRE</option>
                                <option>Net Worth</option>
                            </select>
                        </div>

                        {/* Risk Profile */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Risk Profile</label>
                            <select name="riskProfile" value={formData.riskProfile} onChange={handleChange} className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                                <option value="safe">Safe</option>
                                <option value="medium">Medium</option>
                                <option value="risky">Risky</option>
                            </select>
                        </div>

                        {/* Sliders for financial data */}
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Details</h3>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-sm text-amber-600 dark:text-amber-400 mb-4 bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800/50">
                                        Core financial metrics are locked to ensure the integrity of your FIRE Number. <button type="button" onClick={() => { onClose(); onHardResetRequest?.(); }} className="font-bold underline text-amber-700 dark:text-amber-300 hover:text-amber-900 bg-transparent border-none p-0 cursor-pointer">Retake the questionnaire</button> to update these values. You can still manually update your Current Savings below.
                                    </p>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Savings</label>
                                        <div className="relative w-40">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">₹</span>
                                            <input
                                                type="number"
                                                name="currentSavings"
                                                value={formData.currentSavings}
                                                onChange={handleNumberChange}
                                                className="w-full pl-6 pr-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-right focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold text-emerald-700 dark:text-emerald-400 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <input type="range" name="currentSavings" min="0" max="50000000" step="10000" value={formData.currentSavings} onChange={handleNumberChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                                </div>

                                <div className="grid grid-cols-2 gap-4 opacity-70 cursor-not-allowed">
                                    <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Income</p>
                                        <p className="font-bold text-gray-800 dark:text-gray-200">₹{formData.monthlyIncome?.toLocaleString() || 0}</p>
                                    </div>
                                    <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Expenses</p>
                                        <p className="font-bold text-gray-800 dark:text-gray-200">₹{formData.monthlyExpenses?.toLocaleString() || 0}</p>
                                    </div>
                                    <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Current Age</p>
                                        <p className="font-bold text-gray-800 dark:text-gray-200">{formData.age}</p>
                                    </div>
                                    <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Target Ret. Age</p>
                                        <p className="font-bold text-gray-800 dark:text-gray-200">{formData.targetRetirementAge}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600 rounded-b-2xl flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-100 dark:hover:bg-gray-500 transition">
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
