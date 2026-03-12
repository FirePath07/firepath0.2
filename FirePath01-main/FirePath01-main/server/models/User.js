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
        riskProfile: { type: String, default: 'medium' },
        primaryGoal: { type: String, default: '' },
        selectedFireAmount: { type: Number, default: 0 },
        timePressure: { type: String, default: 'Low' },
        foundationLevel: { type: String, default: 'Weak' },
        mostImportantMetric: {
            type: String,
            enum: ['Savings Rate', 'Years to FIRE', 'Net Worth'],
            default: 'Net Worth'
        },
        inflationRate: { type: Number, default: 6 },
        budget: { type: Number, default: 0 },
        defaultMonthlySIP: { type: Number, default: 0 },
        lastNotifiedMilestone: { type: Number, default: 0 },
        selectedBasket: {
            type: {
                name: String,
                funds: [{ name: String, split: Number, risk: String }]
            },
            default: null
        },
        portfolio: {
            type: [{
                fundName: String,
                units: Number,
                totalInvested: Number,
                navAtPurchase: Number
            }],
            default: []
        },
        portfolioHistory: {
            type: [{
                date: String,
                totalInvested: Number,
                currentValue: Number
            }],
            default: []
        },
        monthlyContributions: {
            type: [{
                date: String,
                amount: Number
            }],
            default: []
        },
        expensesList: {
            type: [{
                id: String,
                amount: Number,
                description: String,
                date: String
            }],
            default: []
        },
        goals: {
            type: [{
                id: String,
                name: String,
                targetAmount: Number,
                currentSavings: Number,
                targetMonths: Number,
                category: String,
                createdAt: String
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
