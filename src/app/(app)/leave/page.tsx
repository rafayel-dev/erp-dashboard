"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import ApplyLeaveModal from "@/components/leave/ApplyLeaveModal";
import { inputClass } from "@/components/ui/Field";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { canActOnLeaveStep, canManageEmployees, leaveBalances, visibleScope } from "@/lib/hr";
import type { LeaveApprovalStep } from "@/types";
import { CalendarPlus, Check, X, ArrowRight, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const stepBadgeClass: Record<LeaveApprovalStep["status"], string> = {
  Pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Rejected: "bg-rose-50 text-rose-700 ring-rose-600/20",
  Skipped: "bg-slate-100 text-slate-400 ring-slate-600/20",
};

function ApprovalChain({ steps }: { steps: LeaveApprovalStep[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {steps.map((s, i) => (
        <span key={s.level} className="flex items-center gap-1">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${stepBadgeClass[s.status]}`}
          >
            {s.role}: {s.status}
          </span>
          {i < steps.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-slate-300" />}
        </span>
      ))}
    </div>
  );
}

export default function LeavePage() {
  const { employees, leaveRequests, activeEmployee, actOnLeave } = useAppData();
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [open, setOpen] = useState(false);
  const canPickEmployee = canManageEmployees(activeEmployee.role);

  const scopeIds = useMemo(
    () => new Set(visibleScope(activeEmployee, employees).map((e) => e.id)),
    [activeEmployee, employees]
  );

  const myBalances = useMemo(
    () => leaveBalances(activeEmployee.id, leaveRequests),
    [activeEmployee.id, leaveRequests]
  );

  const pendingCount = useMemo(
    () => leaveRequests.filter((l) => l.status === "Pending").length,
    [leaveRequests]
  );

  const filtered = useMemo(() => {
    const sorted = [...leaveRequests]
      .filter((l) => scopeIds.has(l.employeeId))
      .sort((a, b) => (a.appliedOn < b.appliedOn ? 1 : -1));
    if (statusFilter === "All") return sorted;
    return sorted.filter((l) => l.status === "Pending" ? l.status === statusFilter : l.status === statusFilter);
  }, [leaveRequests, scopeIds, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Leave Balance Quotas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {myBalances
          .filter((b) => b.balance !== null)
          .map((b) => {
            const total = (b.balance ?? 0) + b.taken;
            const remaining = b.balance ?? 0;
            return (
              <Card key={b.type} className="border border-slate-200/80 p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {b.type} Leave
                  </p>
                  <span className="text-xs font-bold text-slate-500">
                    {b.taken} used
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-bold tracking-tight text-slate-900">{remaining}</span>
                  <span className="text-xs font-medium text-slate-400">/ {total} days left</span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      remaining <= 2
                        ? "bg-rose-500"
                        : remaining <= 5
                        ? "bg-amber-500"
                        : "bg-brand-500"
                    }`}
                    style={{ width: `${Math.min(100, (remaining / (total || 1)) * 100)}%` }}
                  />
                </div>
              </Card>
            );
          })}
        <Card className="border border-slate-200/80 p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pending Approvals
            </p>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight text-amber-600">{pendingCount}</span>
            <span className="text-xs font-medium text-slate-400">requests</span>
          </div>
          <p className="mt-3 text-xs text-slate-500 truncate">
            {canPickEmployee ? "Across organization" : "In your queue"}
          </p>
        </Card>
      </div>

      {/* Filter and Action Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:max-w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setOpen(true)} className="w-max">
          <CalendarPlus className="h-4 w-4 mr-1.5" />
          Apply for Leave
        </Button>
      </div>

      <p className="text-xs text-slate-400">
        Viewing as <span className="font-semibold text-slate-700">{activeEmployee.name}</span> ({activeEmployee.role}) —{" "}
        {canPickEmployee
          ? "showing requests for the whole company."
          : activeEmployee.role === "Manager"
            ? "showing your requests and direct reports."
            : "showing your own requests."}{" "}
        Requests with a Manager in the line require Manager review first, then HR sign-off.
      </p>

      {/* Table */}
      <Card padded={false} className="border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3 font-semibold">Employee</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Dates</th>
                <th className="px-5 py-3 font-semibold">Days</th>
                <th className="px-5 py-3 font-semibold">Approval Chain</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((lv) => {
                const emp = employees.find((e) => e.id === lv.employeeId);
                if (!emp) return null;
                const canAct = lv.status === "Pending" && canActOnLeaveStep(activeEmployee, lv);
                return (
                  <tr key={lv.id} className="hover:bg-slate-50/60 transition-colors">
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
                      <Badge label={lv.type} />
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 font-medium">
                      {formatDate(lv.startDate)} – {formatDate(lv.endDate)}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 font-bold">{lv.days}</td>
                    <td className="px-5 py-3.5">
                      <ApprovalChain steps={lv.approvalSteps} />
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge label={lv.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      {canAct ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => actOnLeave(lv.id, "Approved", activeEmployee.id)}
                            className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-150 active:scale-95 shadow-2xs cursor-pointer"
                          >
                            <Check className="h-3 w-3" />
                            Approve
                          </button>
                          <button
                            onClick={() => actOnLeave(lv.id, "Rejected", activeEmployee.id)}
                            className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition-all duration-150 active:scale-95 shadow-2xs cursor-pointer"
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-xs text-slate-400">
                    No leave requests match &ldquo;{statusFilter}&rdquo;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ApplyLeaveModal
        open={open}
        onClose={() => setOpen(false)}
        employees={employees}
        defaultEmployeeId={activeEmployee.id}
        canPickEmployee={canPickEmployee}
      />
    </div>
  );
}
