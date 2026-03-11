export const formatIndianCurrency = (value: number): string => {
    if (value >= 10000000) {
        return `₹${Number((value / 10000000).toFixed(2))} Cr`;
    }
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(value);
};
