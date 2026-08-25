"use client";

import { useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ApplyLeaveModal from "@/components/leave/ApplyLeaveModal";
import { formatDate } from "@/lib/format";
import { leaveBalances } from "@/lib/hr";

export default function LeavePanel({ employeeId }: { employeeId: string }) {
  const { employees, leaveRequests } = useAppData();
  const [tab, setTab] = useState<"application" | "balance">("application");
  const [open, setOpen] = useState(false);

  const myLeave = leaveRequests
    .filter((l) => l.employeeId === employeeId)
    .sort((a, b) => (a.appliedOn < b.appliedOn ? 1 : -1));

  const balances = leaveBalances(employeeId, leaveRequests);

  return (
    <Card className="flex h-full flex-col">
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-xs font-medium">
        <button
          onClick={() => setTab("application")}
          className={`flex-1 rounded-md py-1.5 transition-colors ${
            tab === "application" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
        >
          Application
        </button>
        <button
          onClick={() => setTab("balance")}
          className={`flex-1 rounded-md py-1.5 transition-colors ${
            tab === "balance" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
        >
          Balance
        </button>
      </div>

      <button
        onClick={() => setOpen(true)}
        className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        + Apply Leave
      </button>

      {tab === "application" ? (
        <div className="mt-4 flex-1 space-y-2 overflow-y-auto text-xs">
          {myLeave.length === 0 && (
            <p className="py-6 text-center text-slate-400">No leave requests yet.</p>
          )}
          {myLeave.slice(0, 4).map((lv) => (
            <div
              key={lv.id}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
            >
              <div>
                <p className="font-medium text-slate-700">{lv.type}</p>
                <p className="text-slate-400">
                  {formatDate(lv.startDate)} → {formatDate(lv.endDate)}
                </p>
              </div>
              <Badge label={lv.status} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 flex-1 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-slate-400">
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Taken</th>
                <th className="pb-2 font-medium">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {balances.map((b) => (
                <tr key={b.type}>
                  <td className="py-2 font-medium text-slate-700">{b.type}</td>
                  <td className="py-2 text-slate-500">{b.taken}</td>
                  <td className="py-2 font-semibold text-slate-800">
                    {b.balance === null ? "Unlimited" : b.balance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[10px] text-slate-400">
            Entitlements reset each calendar year. Balance = allocation − approved days
            taken this year.
          </p>
        </div>
      )}

      <ApplyLeaveModal
        open={open}
        onClose={() => setOpen(false)}
        employees={employees}
        defaultEmployeeId={employeeId}
        canPickEmployee={false}
      />
    </Card>
  );
}
