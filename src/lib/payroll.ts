import type { PayComponent, PayrollRecord, PayrollStatus } from "@/types";

/** Standard earnings formula, applied on top of basic salary. Shared by
 *  the mock data seed and by "Run Payroll" so both stay consistent. */
export function computeEarnings(basicSalary: number): PayComponent[] {
  return [
    { label: "House Rent Allowance", amount: Math.round(basicSalary * 0.25) },
    { label: "Transport Allowance", amount: Math.round(basicSalary * 0.05) },
    { label: "Medical Allowance", amount: Math.round(basicSalary * 0.05) },
  ];
}

export function computeDeductions(basicSalary: number): PayComponent[] {
  return [
    { label: "Income Tax", amount: Math.round(basicSalary * 0.1) },
    { label: "Provident Fund", amount: Math.round(basicSalary * 0.08) },
    { label: "Health Insurance", amount: Math.round(basicSalary * 0.02) },
  ];
}

export function sumComponents(items: PayComponent[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

export function buildPayrollRecord(
  employeeId: string,
  month: string,
  basicSalary: number,
  status: PayrollStatus,
  paidOn: string | null
): PayrollRecord {
  const earnings = computeEarnings(basicSalary);
  const deductions = computeDeductions(basicSalary);
  const grossPay = basicSalary + sumComponents(earnings);
  const totalDeductions = sumComponents(deductions);
  return {
    id: `pr-${month}-${employeeId}`,
    employeeId,
    month,
    basicSalary,
    earnings,
    deductions,
    grossPay,
    totalDeductions,
    netPay: grossPay - totalDeductions,
    status,
    paidOn,
  };
}
