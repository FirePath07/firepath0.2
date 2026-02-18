
export const calculateSIP = (targetAmount: number, years: number, expectedReturnRate: number): number => {
    const months = years * 12;
    const monthlyRate = expectedReturnRate / 100 / 12;

    // Formula: P = M * [((1 + i)^n - 1) / i] * (1 + i)
    // Where M is the monthly investment, but here we solve for M
    // M = P / ([((1 + i)^n - 1) / i] * (1 + i))

    const factor = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate * (1 + monthlyRate);
    return Math.ceil(targetAmount / factor);
};

export const calculateStepUpSIP = (
    targetAmount: number,
    years: number,
    expectedReturnRate: number,
    stepUpRate: number = 10 // Default 10% annual step-up
): { initialMonthlyInvestment: number } => {
    // This is a complex calculation. Since we need to solve for the initial investment,
    // we can iterate or use an approximation. A direct formula is complex for Step-up SIP integration.
    // For simplicity and speed, we will approximate or use a loop to solve for X (initial amount).

    // Let's use a binary search approach to find the required initial amount.
    let low = 100;
    let high = targetAmount; // Upper bound, assuming you just saving the target amount directly is more than enough
    let initialAmount = 0;

    for (let i = 0; i < 50; i++) { // 50 iterations is plenty for precision
        const mid = (low + high) / 2;
        // Calculate Future Value with this initial amount
        let futureValue = 0;
        let currentMonthlyInvestment = mid;
        const monthlyRate = expectedReturnRate / 100 / 12;

        for (let y = 1; y <= years; y++) {
            // For each year
            for (let m = 1; m <= 12; m++) {
                // Add investment and compound
                futureValue += currentMonthlyInvestment;
                futureValue *= (1 + monthlyRate);
                // Correcting the compounding: 
                // Each monthly installment grows for remaining time.
                // Actually, easier to just simulate month by month accumulation.
            }
            // Increase investment for next year
            currentMonthlyInvestment *= (1 + stepUpRate / 100);
        }

        // However, the above loop compounds the WHOLE corpus every month, which is correct.
        // Let's refine the simulation loop.
        let simulatedCorpus = 0;
        let monthlyInv = mid;

        for (let m = 1; m <= years * 12; m++) {
            simulatedCorpus += monthlyInv;
            simulatedCorpus *= (1 + monthlyRate);

            if (m % 12 === 0) {
                monthlyInv *= (1 + stepUpRate / 100);
            }
        }

        if (simulatedCorpus >= targetAmount) {
            initialAmount = mid;
            high = mid;
        } else {
            low = mid;
        }
    }

    return { initialMonthlyInvestment: Math.ceil(initialAmount) };
};

export const checkFeasibility = (requiredInvestment: number, monthlySurplus: number): { feasible: boolean; gap: number } => {
    const gap = requiredInvestment - monthlySurplus;
    return {
        feasible: requiredInvestment <= monthlySurplus,
        gap: gap > 0 ? gap : 0
    };
};

export const calculateCorpus = (
    initialMonthlyInvestment: number,
    years: number,
    expectedReturnRate: number,
    stepUpRate: number = 10
): number => {
    let corpus = 0;
    let currentMonthlyInvestment = initialMonthlyInvestment;
    const monthlyRate = expectedReturnRate / 100 / 12;

    for (let m = 1; m <= years * 12; m++) {
        corpus += currentMonthlyInvestment;
        corpus *= (1 + monthlyRate);

        if (m % 12 === 0) {
            currentMonthlyInvestment *= (1 + stepUpRate / 100);
        }
    }
    return Math.round(corpus);
};
