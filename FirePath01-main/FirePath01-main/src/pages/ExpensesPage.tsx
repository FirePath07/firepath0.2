import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { formatIndianCurrency } from '../utils/currency';

export const ExpensesPage = () => {
    const { user, updateFinancialData } = useAuth();
    const navigate = useNavigate();

    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [budgetInput, setBudgetInput] = useState('');

    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseDesc, setExpenseDesc] = useState('');

    if (!user) {
        navigate('/');
        return null;
    }

    const { financialData } = user;
    const budget = financialData.budget || 0;
    const expensesList = financialData.expensesList || [];

    const totalExpenses = expensesList.reduce((sum, exp) => sum + exp.amount, 0);
    const remainingBudget = budget - totalExpenses;

    // On first visit, require entering the budget
    const needsInitialBudget = budget === 0 && !isEditingBudget;

    const handleUpdateBudget = async (e: React.FormEvent) => {
        e.preventDefault();
        const newBudget = Number(budgetInput);
        if (newBudget > 0) {
            await updateFinancialData({ budget: newBudget });
            setIsEditingBudget(false);
            setBudgetInput('');
        }
    };

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = Number(expenseAmount);
        if (amount > 0 && expenseDesc.trim()) {
            const newExpense = {
                id: Date.now().toString(),
                amount,
                description: expenseDesc.trim(),
                date: new Date().toISOString()
            };
            const newExpensesList = [...expensesList, newExpense];
            await updateFinancialData({ expensesList: newExpensesList });
            setExpenseAmount('');
            setExpenseDesc('');
        }
    };

    const handleDeleteExpense = async (id: string) => {
        const newExpensesList = expensesList.filter(exp => exp.id !== id);
        await updateFinancialData({ expensesList: newExpensesList });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Navigation showFullNav={true} />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Expenses & Budget Tracking</h1>
                        <p className="text-gray-600 dark:text-gray-300">Manage your monthly budget and log your expenses.</p>
                    </div>
                    <button
                        onClick={() => navigate('/profile')}
                        className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                {needsInitialBudget ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-lg mx-auto border-t-4 border-emerald-500">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Set Your Monthly Budget</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Before you can start tracking expenses, please enter your total budget for the month.</p>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const newBudget = Number(budgetInput);
                            if (newBudget > 0) {
                                updateFinancialData({ budget: newBudget });
                            }
                        }}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Budget</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">₹</span>
                                    <input
                                        type="number"
                                        value={budgetInput}
                                        onChange={(e) => setBudgetInput(e.target.value)}
                                        className="pl-8 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Enter amount"
                                        required
                                        min="1"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-700 transition"
                            >
                                Set Budget & Start Tracking
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1 space-y-6">
                            {/* Budget Overview Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-emerald-500">
                                <div className="flex justify-between items-start mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Budget Overview</h2>
                                    <button
                                        onClick={() => {
                                            setIsEditingBudget(!isEditingBudget);
                                            setBudgetInput(budget.toString());
                                        }}
                                        className="text-sm text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
                                    >
                                        Edit
                                    </button>
                                </div>

                                {isEditingBudget ? (
                                    <form onSubmit={handleUpdateBudget} className="mb-6">
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Update Budget</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                value={budgetInput}
                                                onChange={(e) => setBudgetInput(e.target.value)}
                                                className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                min="1"
                                                required
                                            />
                                            <button type="submit" className="bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700">Save</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="mb-6 space-y-2">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Budget</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatIndianCurrency(budget)}</p>
                                    </div>
                                )}

                                <div className="space-y-2 mb-6">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Remaining Budget</p>
                                    <p className={`text-3xl font-bold ${remainingBudget >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {formatIndianCurrency(remainingBudget)}
                                    </p>
                                </div>

                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${remainingBudget >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                                        style={{ width: `${Math.min((totalExpenses / budget) * 100, 100)}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                                    {((totalExpenses / budget) * 100).toFixed(1)}% used
                                </p>
                            </div>

                            {/* Add Expense Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Expense</h2>
                                <form onSubmit={handleAddExpense} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                                            <input
                                                type="number"
                                                value={expenseAmount}
                                                onChange={(e) => setExpenseAmount(e.target.value)}
                                                className="pl-8 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
                                                required
                                                min="1"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                        <input
                                            type="text"
                                            value={expenseDesc}
                                            onChange={(e) => setExpenseDesc(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
                                            placeholder="e.g. Groceries"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Add Expense
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Expenses</h2>

                                {expensesList.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        <p className="text-4xl mb-3">🧾</p>
                                        <p>No expenses added yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {[...expensesList].reverse().map((expense) => (
                                            <div key={expense.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{expense.description}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(expense.date).toLocaleDateString(undefined, {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="font-bold text-gray-900 dark:text-white">
                                                        - {formatIndianCurrency(expense.amount)}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteExpense(expense.id)}
                                                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                                                        title="Delete"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
