
import type { UserFinancialData } from '../context/AuthContext';

export const calculateFIREMetrics = (financialData: UserFinancialData) => {
  if (!financialData) {
    return {
      annualExpenses: 0,
      annualIncome: 0,
      annualSurplus: 0,
      savingsRate: "0",
      fireNumber: 0,
      yearsToFire: Infinity,
      estimatedRetirementAge: 0,
      currentTotalWealth: 0,
      expectedReturnRate: 0.12
    };
  }

  // Use ONLY the baseline planning values from the Investments/Profile tab
  const monthlyExpenses = financialData.monthlyExpenses || 0;
  const monthlyIncome = financialData.monthlyIncome || 0;
  const age = financialData.age || 25;
  const targetRetirementAge = financialData.targetRetirementAge || 60;
  const currentSavings = financialData.currentSavings || 0;

  const annualExpenses = monthlyExpenses * 12;
  const annualIncome = monthlyIncome * 12;
  const annualSurplus = annualIncome - annualExpenses;
  const savingsRate = annualIncome > 0 ? ((annualSurplus / annualIncome) * 100).toFixed(1) : "0";

  const inflationRate = (financialData.inflationRate || 6) / 100;
  const yearsToInvest = Math.max(0, targetRetirementAge - age);
  const futureAnnualExpenses = annualExpenses * Math.pow(1 + inflationRate, yearsToInvest);

  // FIRE Target = 25 x Future Annual Expenses (unless a specific goal amount was selected)
  const fireNumber = financialData.selectedFireAmount && financialData.selectedFireAmount > 0 
      ? financialData.selectedFireAmount 
      : futureAnnualExpenses * 25;

  let expectedReturnRate = 0.12; 
  if (financialData.riskProfile?.includes("Capital Stability")) expectedReturnRate = 0.085; 
  else if (financialData.riskProfile?.includes("High Growth")) expectedReturnRate = 0.16;

  const r = expectedReturnRate;
  const portfolioHistory = financialData.portfolioHistory || [];
  const latestPortfolioValue = portfolioHistory.length > 0 ? portfolioHistory[portfolioHistory.length - 1].currentValue : 0;
  const currentTotalWealth = currentSavings + latestPortfolioValue;

  let yearsToFire = 0;
  if (currentTotalWealth >= fireNumber) {
    yearsToFire = 0;
  } else if (annualSurplus > 0) {
    yearsToFire = Math.max(0, Math.log((fireNumber * r + annualSurplus) / (currentTotalWealth * r + annualSurplus)) / Math.log(1 + r));
  } else if (currentTotalWealth > 0) {
    yearsToFire = Math.max(0, Math.log(fireNumber / currentTotalWealth) / Math.log(1 + r));
  } else {
    yearsToFire = Infinity;
  }

  const estimatedRetirementAge = age + yearsToFire;

  return {
    annualExpenses,
    annualIncome,
    annualSurplus,
    savingsRate,
    fireNumber,
    yearsToFire,
    estimatedRetirementAge,
    currentTotalWealth,
    expectedReturnRate
  };
};
