"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import ApplyLeaveModal from "@/components/leave/ApplyLeaveModal";
import { inputClass } from "@/components/ui/Field";
import { formatDate } from "@/lib/format";
import { canActOnLeaveStep, canManageEmployees, visibleScope } from "@/lib/hr";
import type { LeaveApprovalStep } from "@/types";

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
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${stepBadgeClass[s.status]}`}
          >
            {s.role}: {s.status}
          </span>
          {i < steps.length - 1 && <span className="text-slate-300">→</span>}
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

  const filtered = useMemo(() => {
    const sorted = [...leaveRequests]
      .filter((l) => scopeIds.has(l.employeeId))
      .sort((a, b) => (a.appliedOn < b.appliedOn ? 1 : -1));
    if (statusFilter === "All") return sorted;
    return sorted.filter((l) => l.status === statusFilter);
  }, [leaveRequests, statusFilter, scopeIds]);

  function handleReject(id: string) {
    const reason = window.prompt("Reason for rejecting this request (optional):") ?? "";
    actOnLeave(id, "Rejected", activeEmployee.id, reason);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${inputClass} sm:max-w-[200px]`}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Apply for Leave
        </button>
      </div>

      <p className="text-xs text-slate-400">
        Viewing as {activeEmployee.name} ({activeEmployee.role}) —{" "}
        {canPickEmployee
          ? "showing requests for the whole company."
          : activeEmployee.role === "Manager"
            ? "showing your requests and your direct reports'."
            : "showing your own requests."}{" "}
        Requests with a Manager in the reporting line need Manager approval
        first, then HR sign-off; everyone else goes straight to HR.
      </p>

      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Dates</th>
                <th className="px-5 py-3 font-medium">Days</th>
                <th className="px-5 py-3 font-medium">Approval Chain</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((lv) => {
                const emp = employees.find((e) => e.id === lv.employeeId);
                if (!emp) return null;
                const canAct = lv.status === "Pending" && canActOnLeaveStep(activeEmployee, lv);
                return (
                  <tr key={lv.id}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={emp.name} color={emp.avatarColor} size={28} />
                        <span className="font-medium text-slate-800">
                          {emp.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge label={lv.type} />
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {formatDate(lv.startDate)} – {formatDate(lv.endDate)}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{lv.days}</td>
                    <td className="px-5 py-3">
                      <ApprovalChain steps={lv.approvalSteps} />
                    </td>
                    <td className="px-5 py-3">
                      <Badge label={lv.status} />
                    </td>
                    <td className="px-5 py-3">
                      {canAct ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => actOnLeave(lv.id, "Approved", activeEmployee.id)}
                            className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(lv.id)}
                            className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                          >
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
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    No leave requests found.
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
