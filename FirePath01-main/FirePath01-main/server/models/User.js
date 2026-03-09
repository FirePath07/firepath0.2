const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    financialData: {
        monthlyIncome: { type: Number, default: 0 },
        currentSavings: { type: Number, default: 0 },
        monthlyExpenses: { type: Number, default: 0 },
        age: { type: Number, default: 25 },
        targetRetirementAge: { type: Number, default: 60 },
        riskProfile: {
            type: String,
            enum: ['safe', 'medium', 'risky'],
            default: 'medium'
        },
        primaryGoal: { type: String, default: '' },
        mostImportantMetric: {
            type: String,
            enum: ['Savings Rate', 'Years to FIRE', 'Net Worth'],
            default: 'Net Worth'
        },
        budget: { type: Number, default: 0 },
        expensesList: {
            type: [{
                id: String,
                amount: Number,
                description: String,
                date: String
            }],
            default: []
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
