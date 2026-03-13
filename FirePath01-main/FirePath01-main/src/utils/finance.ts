
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

export const calculateFinancialAllocation = (income: number, expenses: number) => {
    const surplus = Math.max(0, income - expenses);
    const minSIPReserve = 3000;
    
    let splurgeMoney = 0;
    if (surplus > minSIPReserve) {
        splurgeMoney = (surplus - minSIPReserve) * 0.15;
    }
    
    const totalSIP = Math.max(0, surplus - splurgeMoney);
    
    return {
        surplus,
        splurgeMoney,
        totalSIP,
        minSIPReserve: surplus > 0 ? Math.min(surplus, minSIPReserve) : 0
    };
};

export const distributeSIPAcrossFunds = (totalSIP: number, funds: { name: string; split: number }[]) => {
    if (totalSIP === 0) {
        return funds.map(f => ({ ...f, amount: 0 }));
    }

    const fundCount = funds.length;
    const minPerFund = 1000;

    // RULE: If total SIP is close to or equal to ₹3,000, split evenly
    if (totalSIP <= (fundCount * minPerFund) + 100) { // +100 to handle "close to"
        const evenAmount = Math.floor(totalSIP / fundCount);
        const distributed = funds.map((f, i) => ({
            ...f,
            amount: i === 0 ? evenAmount + (totalSIP - evenAmount * fundCount) : evenAmount
        }));
        return distributed;
    }

    // Normal SIP Distribution (Above ₹3,000)
    let amounts = funds.map(f => Math.floor(totalSIP * (f.split / 100)));
    
    // Adjust for minimum ₹1,000 rule
    let needsAdjustment = amounts.some(a => a < minPerFund);
    
    if (needsAdjustment) {
        // Set all to at least 1000
        amounts = amounts.map(a => Math.max(a, minPerFund));
        let currentTotal = amounts.reduce((a, b) => a + b, 0);
        
        if (currentTotal > totalSIP) {
            let overflow = currentTotal - totalSIP;
            // Reduce from funds that are > 1000
            while (overflow > 0) {
                let maxVal = Math.max(...amounts);
                let maxIdx = amounts.indexOf(maxVal);
                if (maxVal > minPerFund) {
                    let reduction = Math.min(overflow, maxVal - minPerFund);
                    amounts[maxIdx] -= reduction;
                    overflow -= reduction;
                } else {
                    break;
                }
            }
        } else if (currentTotal < totalSIP) {
            let remainder = totalSIP - currentTotal;
            let maxSplit = Math.max(...funds.map(f => f.split));
            let maxIdx = funds.findIndex(f => f.split === maxSplit);
            amounts[maxIdx] += remainder;
        }
    } else {
        let currentTotal = amounts.reduce((a, b) => a + b, 0);
        let remainder = totalSIP - currentTotal;
        let maxSplit = Math.max(...funds.map(f => f.split));
        let maxIdx = funds.findIndex(f => f.split === maxSplit);
        amounts[maxIdx] += remainder;
    }

    return funds.map((f, i) => ({
        ...f,
        amount: amounts[i]
    }));
};
