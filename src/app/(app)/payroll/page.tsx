"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Modal from "@/components/ui/Modal";
import { inputClass } from "@/components/ui/Field";
import { formatCurrency, formatDate, formatMonth } from "@/lib/format";
import { canManageEmployees, visibleScope } from "@/lib/hr";
import { sumComponents } from "@/lib/payroll";
import type { PayrollRecord } from "@/types";

function nextMonthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m, 1); // m is already "next month" in 0-indexed terms
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function PayrollPage() {
  const {
    employees,
    payrollRecords,
    activeEmployee,
    markPayrollPaid,
    generatePayrollForMonth,
  } = useAppData();
  const months = useMemo(
    () => Array.from(new Set(payrollRecords.map((p) => p.month))).sort().reverse(),
    [payrollRecords]
  );
  const [month, setMonth] = useState(months[0]);
  const [payslip, setPayslip] = useState<PayrollRecord | null>(null);
  const canManage = canManageEmployees(activeEmployee.role);

  const scopeIds = useMemo(
    () => new Set(visibleScope(activeEmployee, employees).map((e) => e.id)),
    [activeEmployee, employees]
  );

  const rows = useMemo(
    () =>
      payrollRecords.filter((p) => p.month === month && scopeIds.has(p.employeeId)),
    [payrollRecords, month, scopeIds]
  );

  const totals = rows.reduce(
    (acc, r) => ({
      basic: acc.basic + r.basicSalary,
      earnings: acc.earnings + sumComponents(r.earnings),
      deductions: acc.deductions + r.totalDeductions,
      net: acc.net + r.netPay,
    }),
    { basic: 0, earnings: 0, deductions: 0, net: 0 }
  );

  const upcomingMonth = months[0] ? nextMonthLabel(months[0]) : undefined;
  const alreadyRunUpcoming = upcomingMonth ? months.includes(upcomingMonth) : true;

  function handleRunPayroll() {
    if (!upcomingMonth) return;
    generatePayrollForMonth(upcomingMonth);
    setMonth(upcomingMonth);
  }

  const payslipEmployee = payslip
    ? employees.find((e) => e.id === payslip.employeeId)
    : undefined;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className={`${inputClass} max-w-[220px]`}
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {formatMonth(m)}
            </option>
          ))}
        </select>
        {canManage && upcomingMonth && !alreadyRunUpcoming && (
          <button
            onClick={handleRunPayroll}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Run Payroll for {formatMonth(upcomingMonth)}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-slate-500">Basic Salaries</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {formatCurrency(totals.basic)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Earnings</p>
          <p className="mt-1 text-xl font-semibold text-emerald-600">
            +{formatCurrency(totals.earnings)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Deductions</p>
          <p className="mt-1 text-xl font-semibold text-rose-600">
            -{formatCurrency(totals.deductions)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Net Payout</p>
          <p className="mt-1 text-xl font-semibold text-indigo-600">
            {formatCurrency(totals.net)}
          </p>
        </Card>
      </div>

      {!canManage && (
        <p className="text-xs text-slate-400">
          Viewing as {activeEmployee.name} ({activeEmployee.role}) —{" "}
          {activeEmployee.role === "Manager"
            ? "showing your payslip and your direct reports'."
            : "showing your own payslip only."}
        </p>
      )}

      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Basic</th>
                <th className="px-5 py-3 font-medium">Gross</th>
                <th className="px-5 py-3 font-medium">Deductions</th>
                <th className="px-5 py-3 font-medium">Net Pay</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((p) => {
                const emp = employees.find((e) => e.id === p.employeeId);
                if (!emp) return null;
                return (
                  <tr key={p.id}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={emp.name} color={emp.avatarColor} size={28} />
                        <span className="font-medium text-slate-800">
                          {emp.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{emp.department}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {formatCurrency(p.basicSalary)}
                    </td>
                    <td className="px-5 py-3 text-emerald-600">
                      {formatCurrency(p.grossPay)}
                    </td>
                    <td className="px-5 py-3 text-rose-600">
                      -{formatCurrency(p.totalDeductions)}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {formatCurrency(p.netPay)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge label={p.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setPayslip(p)}
                          className="rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                        >
                          Payslip
                        </button>
                        {canManage && p.status === "Pending" && (
                          <button
                            onClick={() => markPayrollPaid(p.id)}
                            className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-400">
                    No payroll records for this month yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={!!payslip}
        onClose={() => setPayslip(null)}
        title={`Payslip — ${formatMonth(payslip?.month ?? "")}`}
      >
        {payslip && payslipEmployee && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <div className="flex items-center gap-3">
                <Avatar
                  name={payslipEmployee.name}
                  color={payslipEmployee.avatarColor}
                  size={36}
                />
                <div>
                  <p className="font-medium text-slate-800">{payslipEmployee.name}</p>
                  <p className="text-xs text-slate-400">
                    {payslipEmployee.employeeCode} · {payslipEmployee.department}
                  </p>
                </div>
              </div>
              <Badge label={payslip.status} />
            </div>

            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                Earnings
              </p>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-3 py-2 text-slate-600">Basic Salary</td>
                      <td className="px-3 py-2 text-right text-slate-700">
                        {formatCurrency(payslip.basicSalary)}
                      </td>
                    </tr>
                    {payslip.earnings.map((line) => (
                      <tr key={line.label}>
                        <td className="px-3 py-2 text-slate-600">{line.label}</td>
                        <td className="px-3 py-2 text-right text-slate-700">
                          {formatCurrency(line.amount)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-emerald-50/60">
                      <td className="px-3 py-2 font-semibold text-emerald-700">
                        Gross Pay
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-emerald-700">
                        {formatCurrency(payslip.grossPay)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                Deductions
              </p>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {payslip.deductions.map((line) => (
                      <tr key={line.label}>
                        <td className="px-3 py-2 text-slate-600">{line.label}</td>
                        <td className="px-3 py-2 text-right text-slate-700">
                          -{formatCurrency(line.amount)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-rose-50/60">
                      <td className="px-3 py-2 font-semibold text-rose-700">
                        Total Deductions
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-rose-700">
                        -{formatCurrency(payslip.totalDeductions)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-indigo-50 px-4 py-3">
              <span className="font-semibold text-indigo-900">Net Pay</span>
              <span className="text-lg font-bold text-indigo-900">
                {formatCurrency(payslip.netPay)}
              </span>
            </div>

            {payslip.paidOn && (
              <p className="text-xs text-slate-400">Paid on {formatDate(payslip.paidOn)}.</p>
            )}
            <p className="text-xs text-slate-400">
              This is a frontend demo — the payslip is generated from mock data, not a
              real document.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
