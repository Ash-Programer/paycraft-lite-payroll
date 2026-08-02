/**
 * Data-driven tax slabs for New Tax Regime (FY 2024-25)
 */
const TAX_SLABS = [
  { upTo: 300000, rate: 0 },
  { upTo: 700000, rate: 0.05 },
  { upTo: 1000000, rate: 0.1 },
  { upTo: 1200000, rate: 0.15 },
  { upTo: 1500000, rate: 0.2 },
  { upTo: Infinity, rate: 0.3 },
];

const STANDARD_DEDUCTION = 75000;

// This is the function the error is looking for
const calculateMonthlyTDS = (annualGross) => {
  let taxableIncome = Math.max(0, annualGross - STANDARD_DEDUCTION);

  // Section 87A Rebate: No tax if taxable income <= 7L
  if (taxableIncome <= 700000) return 0;

  let totalTax = 0;
  let previousLimit = 0;

  for (const slab of TAX_SLABS) {
    if (taxableIncome > previousLimit) {
      const amountInSlab = Math.min(taxableIncome, slab.upTo) - previousLimit;
      totalTax += amountInSlab * slab.rate;
      previousLimit = slab.upTo;
    } else {
      break;
    }
  }

  const taxWithCess = totalTax * 1.04; // 4% Health & Education Cess
  return Math.round(taxWithCess / 12);
};

const calculatePF = (monthlyBasic) => {
  // Capped at 15000 statutory limit
  const pfWage = Math.min(monthlyBasic, 15000);
  return Math.round(pfWage * 0.12);
};

// EXPORT THEM CLEARLY
module.exports = {
  calculateMonthlyTDS,
  calculatePF,
};
