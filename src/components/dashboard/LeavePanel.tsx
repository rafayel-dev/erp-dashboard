"use client";

import { useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ApplyLeaveModal from "@/components/leave/ApplyLeaveModal";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { leaveBalances } from "@/lib/hr";
import { CalendarPlus, CalendarCheck2 } from "lucide-react";

export default function LeavePanel({ employeeId }: { employeeId: string }) {
  const { employees, leaveRequests } = useAppData();
  const [tab, setTab] = useState<"application" | "balance">("application");
  const [open, setOpen] = useState(false);

  const myLeave = leaveRequests
    .filter((l) => l.employeeId === employeeId)
    .sort((a, b) => (a.appliedOn < b.appliedOn ? 1 : -1));

  const balances = leaveBalances(employeeId, leaveRequests);

  return (
    <Card className="flex h-full flex-col border border-slate-200/80 shadow-soft">
      <div className="flex gap-1 rounded-xl bg-slate-100/80 p-1 text-xs font-semibold">
        <button
          onClick={() => setTab("application")}
          className={`flex-1 rounded-lg py-1.5 transition-all ${
            tab === "application"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Recent Requests
        </button>
        <button
          onClick={() => setTab("balance")}
          className={`flex-1 rounded-lg py-1.5 transition-all ${
            tab === "balance"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Leave Quotas
        </button>
      </div>

      <Button
        onClick={() => setOpen(true)}
        className="mt-3.5 w-full"
      >
        <CalendarPlus className="h-4 w-4 mr-1.5" />
        Apply for Leave
      </Button>

      {tab === "application" ? (
        <div className="mt-4 flex-1 space-y-2 overflow-y-auto text-xs">
          {myLeave.length === 0 && (
            <p className="py-8 text-center text-xs text-slate-400">No leave requests logged yet.</p>
          )}
          {myLeave.slice(0, 4).map((lv) => (
            <div
              key={lv.id}
              className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-slate-50/60 px-3 py-2.5 transition-colors hover:bg-slate-50"
            >
              <div>
                <p className="font-semibold text-slate-800">{lv.type}</p>
                <p className="text-[11px] text-slate-400">
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
              <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                <th className="pb-2 font-semibold">Type</th>
                <th className="pb-2 font-semibold">Taken</th>
                <th className="pb-2 font-semibold">Remaining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {balances.map((b) => (
                <tr key={b.type} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2.5 font-semibold text-slate-700">{b.type}</td>
                  <td className="py-2.5 text-slate-500">{b.taken} days</td>
                  <td className="py-2.5 font-bold text-slate-900">
                    {b.balance === null ? "Unlimited" : `${b.balance} days`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[10px] text-slate-400">
            Quotas reset annually. Balance = total allocation − approved days taken.
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
