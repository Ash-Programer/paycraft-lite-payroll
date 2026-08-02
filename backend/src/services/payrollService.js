const taxUtil = require("../utils/payrollEngine.js");

exports.calculateMonthlyPayroll = (employee, lopDays, daysInMonth) => {
  // 1. Calculate Prorate Factor
  const prorateFactor = (daysInMonth - lopDays) / daysInMonth;

  // 2. Prorate Earnings
  const earnings = {
    basic: Math.round(employee.basic * prorateFactor),
    hra: Math.round(employee.hra * prorateFactor),
    specialAllowance: Math.round(employee.special_allowance * prorateFactor),
  };

  const grossEarnings =
    earnings.basic + earnings.hra + earnings.specialAllowance;

  // 3. Calculate Deductions
  const pfEmployee = taxUtil.calculatePF(earnings.basic);
  const professionalTax = 200; // Flat estimate (e.g., Maharashtra)

  // Calculate TDS (Tax) - Annualize the gross earnings first
  const annualGross = grossEarnings * 12;
  const tds = taxUtil.calculateMonthlyTDS(annualGross);

  const totalDeductions = pfEmployee + professionalTax + tds;

  return {
    earnings,
    deductions: {
      pfEmployee,
      professionalTax,
      tds,
    },
    netPay: Math.max(0, grossEarnings - totalDeductions),
  };
};
