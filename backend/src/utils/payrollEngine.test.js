const { calculateMonthlyTDS, calculatePF } = require("./payrollEngine");

// Mock Test for Tax Logic
console.log("--- Running Payroll Logic Tests ---");

// Test 1: Income below 7L (Taxable) should be 0 in New Regime
const tax1 = calculateMonthlyTDS(600000);
console.log(
  tax1 === 0 ? "✅ Test 1 Passed: Income 6L = 0 Tax" : "❌ Test 1 Failed",
);

// Test 2: PF Calculation Capping
const pf1 = calculatePF(10000); // 12% of 10k = 1200
const pf2 = calculatePF(20000); // 12% of 20k but capped at 15k = 1800
console.log(
  pf1 === 1200 ? "✅ Test 2a Passed: PF 10k = 1200" : "❌ Test 2a Failed",
);
console.log(
  pf2 === 1800
    ? "✅ Test 2b Passed: PF 20k (capped) = 1800"
    : "❌ Test 2b Failed",
);
