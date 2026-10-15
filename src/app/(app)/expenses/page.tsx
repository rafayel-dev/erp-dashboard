"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Modal from "@/components/ui/Modal";
import Field, { inputClass } from "@/components/ui/Field";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, toLocalDateStr } from "@/lib/format";
import { canManageExpenses, visibleScope } from "@/lib/hr";
import type { ExpenseCategory, ExpenseClaim } from "@/types";
import {
  Receipt,
  Plus,
  Clock,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Check,
  X,
  CreditCard,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories: ExpenseCategory[] = [
  "Travel",
  "Meals & Entertainment",
  "Office Supplies",
  "Internet & Phone",
  "Training",
  "Other",
];

const emptyClaim = {
  title: "",
  category: "Travel" as ExpenseCategory,
  amount: "",
  date: toLocalDateStr(),
  description: "",
};

export default function ExpensesPage() {
  const { expenses, employees, activeEmployee, addExpense, updateExpenseStatus } = useAppData();
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyClaim);

  const canManage = canManageExpenses(activeEmployee.role);

  const scopeIds = useMemo(
    () => new Set(visibleScope(activeEmployee, employees).map((e) => e.id)),
    [activeEmployee, employees]
  );

  const visibleClaims = useMemo(() => {
    return expenses
      .filter((exp) => scopeIds.has(exp.employeeId))
      .filter((exp) => statusFilter === "All" || exp.status === statusFilter)
      .filter((exp) => categoryFilter === "All" || exp.category === categoryFilter)
      .sort((a, b) => (a.submittedOn < b.submittedOn ? 1 : -1));
  }, [expenses, scopeIds, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    const totalCount = visibleClaims.length;
    const totalAmount = visibleClaims.reduce((sum, e) => sum + e.amount, 0);
    const pendingCount = visibleClaims.filter((e) => e.status === "Pending").length;
    const reimbursedAmount = visibleClaims
      .filter((e) => e.status === "Reimbursed")
      .reduce((sum, e) => sum + e.amount, 0);

    return { totalCount, totalAmount, pendingCount, reimbursedAmount };
  }, [visibleClaims]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(form.amount);
    if (!form.title.trim() || !amt || amt <= 0) return;

    addExpense({
      employeeId: activeEmployee.id,
      title: form.title,
      category: form.category,
      amount: amt,
      date: form.date,
      description: form.description,
    });

    setForm(emptyClaim);
    setIsModalOpen(false);
  }

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Expense Claims &amp; Reimbursement
          </h2>
          <p className="text-xs font-medium text-slate-500">
            Submit business expense vouchers, travel allowances, and claim approvals.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="w-max">
          <Plus className="h-4 w-4 mr-1.5" />
          Submit Claim
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-slate-200/80 p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Claims</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{stats.totalCount}</p>
          <p className="mt-1 text-xs text-slate-400">{formatCurrency(stats.totalAmount)} claimed</p>
        </Card>

        <Card className="border border-slate-200/80 p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Review</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-amber-600">{stats.pendingCount}</p>
          <p className="mt-1 text-xs text-slate-400">Awaiting management sign-off</p>
        </Card>

        <Card className="border border-slate-200/80 p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Reimbursed</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600">
            {formatCurrency(stats.reimbursedAmount)}
          </p>
          <p className="mt-1 text-xs text-slate-400">Disbursed to employee accounts</p>
        </Card>

        <Card className="border border-slate-200/80 p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Policy Limit</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-brand-600">$500.00</p>
          <p className="mt-1 text-xs text-slate-400">Standard auto-approval threshold</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:max-w-[170px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Reimbursed">Reimbursed</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="sm:max-w-[190px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs font-medium text-slate-400">
          Viewing as <span className="font-semibold text-slate-700">{activeEmployee.name}</span> ({activeEmployee.role})
        </p>
      </div>

      {/* Claims Table */}
      <Card padded={false} className="border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3 font-semibold">Employee</th>
                <th className="px-5 py-3 font-semibold">Title &amp; Category</th>
                <th className="px-5 py-3 font-semibold">Expense Date</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Submitted</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleClaims.map((claim) => {
                const emp = employees.find((e) => e.id === claim.employeeId);
                if (!emp) return null;

                return (
                  <tr key={claim.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={emp.name} color={emp.avatarColor} size={30} />
                        <div>
                          <p className="font-semibold text-xs text-slate-800">{emp.name}</p>
                          <p className="text-[10px] text-slate-400">{emp.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-xs text-slate-800">{claim.title}</p>
                      <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 mt-0.5 border border-slate-200/50">
                        {claim.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 font-medium">{formatDate(claim.date)}</td>
                    <td className="px-5 py-3.5 text-xs font-bold text-slate-900">
                      {formatCurrency(claim.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{formatDate(claim.submittedOn)}</td>
                    <td className="px-5 py-3.5">
                      <Badge label={claim.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      {canManage && claim.status === "Pending" ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateExpenseStatus(claim.id, "Approved", activeEmployee.id)}
                            className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-150 active:scale-95 shadow-2xs cursor-pointer"
                          >
                            <Check className="h-3 w-3" />
                            Approve
                          </button>
                          <button
                            onClick={() => updateExpenseStatus(claim.id, "Rejected", activeEmployee.id)}
                            className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition-all duration-150 active:scale-95 shadow-2xs cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                            Reject
                          </button>
                        </div>
                      ) : canManage && claim.status === "Approved" ? (
                        <button
                          onClick={() => updateExpenseStatus(claim.id, "Reimbursed", activeEmployee.id)}
                          className="inline-flex items-center gap-1 rounded-xl border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 hover:bg-teal-100 hover:border-teal-300 transition-all duration-150 active:scale-95 shadow-2xs cursor-pointer"
                        >
                          <CreditCard className="h-3 w-3" />
                          Mark Paid
                        </button>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {visibleClaims.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-xs text-slate-400">
                    No expense claims match current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Claim Submission Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit Expense Voucher">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Claim Title / Purpose">
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Client Dinner with Tech Lead"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Category">
              <Select
                value={form.category}
                onValueChange={(val) => setForm({ ...form, category: val as ExpenseCategory })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Amount ($ USD)">
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="120.00"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Expense Date">
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={inputClass}
            />
          </Field>

          <Field label="Notes / Invoice Details">
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Attach bill reference or business justification..."
              className={inputClass}
            />
          </Field>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Submit Expense
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
