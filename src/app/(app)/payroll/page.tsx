"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Modal from "@/components/ui/Modal";
import { inputClass } from "@/components/ui/Field";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, formatMonth } from "@/lib/format";
import { canManagePayroll, visibleScope } from "@/lib/hr";
import { sumComponents } from "@/lib/payroll";
import type { PayrollRecord } from "@/types";
import { CreditCard, HandCoins, Play, Check, X, FileText, ArrowRight, Wallet } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function nextMonthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function PayrollPage() {
  const {
    employees,
    payrollRecords,
    activeEmployee,
    markPayrollPaid,
    generatePayrollForMonth,
    advanceRequests,
    updateAdvanceStatus,
    requestAdvance,
  } = useAppData();
  const [activeTab, setActiveTab] = useState<"payroll" | "advances">("payroll");
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [advanceReason, setAdvanceReason] = useState("");
  const months = useMemo(
    () => Array.from(new Set(payrollRecords.map((p) => p.month))).sort().reverse(),
    [payrollRecords]
  );
  const [month, setMonth] = useState(months[0]);
  const [payslip, setPayslip] = useState<PayrollRecord | null>(null);
  const canManage = canManagePayroll(activeEmployee.role);

  const scopeIds = useMemo(
    () => new Set(visibleScope(activeEmployee, employees).map((e) => e.id)),
    [activeEmployee, employees]
  );

  const pendingAdvancesCount = useMemo(
    () => advanceRequests.filter((a) => a.status === "Pending").length,
    [advanceRequests]
  );

  const visibleAdvances = useMemo(() => {
    return advanceRequests
      .filter((a) => scopeIds.has(a.employeeId))
      .sort((a, b) => (a.requestedOn < b.requestedOn ? 1 : -1));
  }, [advanceRequests, scopeIds]);

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

  const latestKnownMonth = months[0] ?? "2026-03";
  const upcomingMonth = nextMonthLabel(latestKnownMonth);
  const alreadyRunUpcoming = payrollRecords.some((p) => p.month === upcomingMonth);

  function handleRunPayroll() {
    if (!upcomingMonth || alreadyRunUpcoming) return;
    generatePayrollForMonth(upcomingMonth);
    setMonth(upcomingMonth);
  }

  const payslipEmployee = payslip
    ? employees.find((e) => e.id === payslip.employeeId)
    : undefined;

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveTab("payroll")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "payroll"
              ? "bg-brand-600 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Monthly Payroll</span>
        </button>
        <button
          onClick={() => setActiveTab("advances")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "advances"
              ? "bg-brand-600 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <HandCoins className="h-4 w-4" />
          <span>Advance Salary Queue</span>
          {pendingAdvancesCount > 0 && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                activeTab === "advances"
                  ? "bg-white/25 text-white"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {pendingAdvancesCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === "payroll" ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="max-w-[200px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>
                    {formatMonth(m)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {canManage && upcomingMonth && !alreadyRunUpcoming && (
              <Button onClick={handleRunPayroll}>
                <Play className="h-4 w-4 mr-1.5" />
                Run Payroll for {formatMonth(upcomingMonth)}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border border-slate-200/80 p-5 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Basic Salaries</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                {formatCurrency(totals.basic)}
              </p>
            </Card>
            <Card className="border border-slate-200/80 p-5 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Allowances &amp; Earnings</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600">
                +{formatCurrency(totals.earnings)}
              </p>
            </Card>
            <Card className="border border-slate-200/80 p-5 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Deductions</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-rose-600">
                -{formatCurrency(totals.deductions)}
              </p>
            </Card>
            <Card className="border border-slate-200/80 p-5 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Net Disbursement</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-brand-600">
                {formatCurrency(totals.net)}
              </p>
            </Card>
          </div>

          {!canManage && (
            <p className="text-xs text-slate-400">
              Viewing as <span className="font-semibold text-slate-700">{activeEmployee.name}</span> ({activeEmployee.role}) —{" "}
              {activeEmployee.role === "Manager"
                ? "showing your payslip and your direct reports'."
                : "showing your own payslip only."}
            </p>
          )}

          <Card padded={false} className="border border-slate-200/80 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3 font-semibold">Employee</th>
                    <th className="px-5 py-3 font-semibold">Department</th>
                    <th className="px-5 py-3 font-semibold">Basic</th>
                    <th className="px-5 py-3 font-semibold">Gross</th>
                    <th className="px-5 py-3 font-semibold">Deductions</th>
                    <th className="px-5 py-3 font-semibold">Net Pay</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((p) => {
                    const emp = employees.find((e) => e.id === p.employeeId);
                    if (!emp) return null;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={emp.name} color={emp.avatarColor} size={30} />
                            <div>
                              <p className="font-semibold text-xs text-slate-800">{emp.name}</p>
                              <p className="text-[10px] text-slate-400">{emp.employeeCode}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500 font-medium">{emp.department}</td>
                        <td className="px-5 py-3.5 text-xs text-slate-500 font-medium">
                          {formatCurrency(p.basicSalary)}
                        </td>
                        <td className="px-5 py-3.5 text-xs font-semibold text-emerald-600">
                          {formatCurrency(p.grossPay)}
                        </td>
                        <td className="px-5 py-3.5 text-xs font-semibold text-rose-600">
                          -{formatCurrency(p.totalDeductions)}
                        </td>
                        <td className="px-5 py-3.5 text-xs font-bold text-slate-900">
                          {formatCurrency(p.netPay)}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge label={p.status} />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              onClick={() => setPayslip(p)}
                              className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors shadow-2xs"
                            >
                              <FileText className="h-3 w-3" />
                              Payslip
                            </button>
                            {canManage && p.status === "Pending" && (
                              <button
                                onClick={() => markPayrollPaid(p.id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-2xs"
                              >
                                <Check className="h-3 w-3" />
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
                      <td colSpan={8} className="px-5 py-12 text-center text-xs text-slate-400">
                        No payroll records for this month yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border border-slate-200/80 p-5 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Advance Requests</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{visibleAdvances.length}</p>
            </Card>
            <Card className="border border-slate-200/80 p-5 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Review</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-amber-600">{pendingAdvancesCount}</p>
            </Card>
            <Card className="border border-slate-200/80 p-5 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Approved Advances</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600">
                {visibleAdvances.filter((a) => a.status === "Approved").length}
              </p>
            </Card>
          </div>

          <Card padded={false} className="border border-slate-200/80 shadow-soft overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Advance Salary Application Queue
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Review and approve emergency salary requests submitted by employees.
                </p>
              </div>
              <Button onClick={() => setAdvanceModalOpen(true)}>
                <HandCoins className="h-4 w-4 mr-1.5" />
                Request Advance
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3 font-semibold">Employee</th>
                    <th className="px-5 py-3 font-semibold">Department</th>
                    <th className="px-5 py-3 font-semibold">Amount</th>
                    <th className="px-5 py-3 font-semibold">Requested Date</th>
                    <th className="px-5 py-3 font-semibold">Reason</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleAdvances.map((adv) => {
                    const emp = employees.find((e) => e.id === adv.employeeId);
                    if (!emp) return null;
                    return (
                      <tr key={adv.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={emp.name} color={emp.avatarColor} size={28} />
                            <div>
                              <p className="font-semibold text-xs text-slate-800">{emp.name}</p>
                              <p className="text-[10px] text-slate-400">{emp.employeeCode}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500 font-medium">{emp.department}</td>
                        <td className="px-5 py-3.5 text-xs font-bold text-slate-900">
                          {formatCurrency(adv.amount)}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500 font-medium">{formatDate(adv.requestedOn)}</td>
                        <td className="px-5 py-3.5 text-xs text-slate-600 max-w-xs truncate" title={adv.reason}>
                          {adv.reason}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge label={adv.status} />
                        </td>
                        <td className="px-5 py-3.5">
                          {canManage && adv.status === "Pending" ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => updateAdvanceStatus(adv.id, "Approved")}
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-2xs"
                              >
                                <Check className="h-3 w-3" />
                                Approve
                              </button>
                              <button
                                onClick={() => updateAdvanceStatus(adv.id, "Rejected")}
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors shadow-2xs"
                              >
                                <X className="h-3 w-3" />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {visibleAdvances.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-xs text-slate-400">
                        No advance salary requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Advance Request Modal */}
      <Modal
        open={advanceModalOpen}
        onClose={() => setAdvanceModalOpen(false)}
        title="Request Salary Advance"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const amt = Number(advanceAmount);
            if (!amt || amt <= 0 || !advanceReason.trim()) return;
            requestAdvance({
              employeeId: activeEmployee.id,
              amount: amt,
              reason: advanceReason,
            });
            setAdvanceAmount("");
            setAdvanceReason("");
            setAdvanceModalOpen(false);
          }}
          className="space-y-4"
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Advance Amount ($ USD)
            </label>
            <input
              type="number"
              required
              min={50}
              step={10}
              value={advanceAmount}
              onChange={(e) => setAdvanceAmount(e.target.value)}
              placeholder="e.g. 500"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Reason for Emergency Advance
            </label>
            <textarea
              required
              rows={3}
              value={advanceReason}
              onChange={(e) => setAdvanceReason(e.target.value)}
              placeholder="Provide a brief explanation for emergency financial assistance..."
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAdvanceModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Submit Request</Button>
          </div>
        </form>
      </Modal>

      {/* Payslip Modal */}
      <Modal
        open={!!payslip}
        onClose={() => setPayslip(null)}
        title={`Payslip — ${formatMonth(payslip?.month ?? "")}`}
      >
        {payslip && payslipEmployee && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-slate-50/80 p-3.5 border border-slate-100">
              <div className="flex items-center gap-3">
                <Avatar
                  name={payslipEmployee.name}
                  color={payslipEmployee.avatarColor}
                  size={36}
                />
                <div>
                  <p className="font-bold text-xs text-slate-800">{payslipEmployee.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {payslipEmployee.employeeCode} · {payslipEmployee.department}
                  </p>
                </div>
              </div>
              <Badge label={payslip.status} />
            </div>

            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Earnings
              </p>
              <div className="overflow-hidden rounded-xl border border-slate-200/80">
                <table className="w-full text-left text-xs">
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-3.5 py-2 text-slate-600">Basic Salary</td>
                      <td className="px-3.5 py-2 text-right font-semibold text-slate-700">
                        {formatCurrency(payslip.basicSalary)}
                      </td>
                    </tr>
                    {payslip.earnings.map((line) => (
                      <tr key={line.label}>
                        <td className="px-3.5 py-2 text-slate-600">{line.label}</td>
                        <td className="px-3.5 py-2 text-right font-semibold text-slate-700">
                          {formatCurrency(line.amount)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-emerald-50/70">
                      <td className="px-3.5 py-2 font-bold text-emerald-800">
                        Gross Pay
                      </td>
                      <td className="px-3.5 py-2 text-right font-bold text-emerald-800">
                        {formatCurrency(payslip.grossPay)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Deductions
              </p>
              <div className="overflow-hidden rounded-xl border border-slate-200/80">
                <table className="w-full text-left text-xs">
                  <tbody className="divide-y divide-slate-100">
                    {payslip.deductions.map((line) => (
                      <tr key={line.label}>
                        <td className="px-3.5 py-2 text-slate-600">{line.label}</td>
                        <td className="px-3.5 py-2 text-right font-semibold text-slate-700">
                          -{formatCurrency(line.amount)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-rose-50/70">
                      <td className="px-3.5 py-2 font-bold text-rose-800">
                        Total Deductions
                      </td>
                      <td className="px-3.5 py-2 text-right font-bold text-rose-800">
                        -{formatCurrency(payslip.totalDeductions)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3 border border-brand-200/60">
              <span className="font-bold text-xs text-brand-900">Net Disbursement</span>
              <span className="text-base font-bold text-brand-900">
                {formatCurrency(payslip.netPay)}
              </span>
            </div>

            {payslip.paidOn && (
              <p className="text-[11px] text-slate-400">Disbursed on {formatDate(payslip.paidOn)}.</p>
            )}

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPayslip(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
