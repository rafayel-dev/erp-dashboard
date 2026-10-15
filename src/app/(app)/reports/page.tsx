"use client";

import { useAppData } from "@/context/AppDataContext";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import { formatCurrency } from "@/lib/format";

export default function ReportsPage() {
  const { employees, attendance, leaveRequests, payrollRecords, assets, activeEmployee } = useAppData();

  if (activeEmployee.role === "Employee" || activeEmployee.role === "IT Admin") {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 font-bold text-xl mb-3">
          🔒
        </div>
        <h2 className="text-base font-bold text-slate-900">Access Restricted</h2>
        <p className="mt-1 text-xs text-slate-500 max-w-md leading-relaxed">
          The Executive Reports &amp; Analytics Hub is restricted to Admin, HR, Finance, and Management roles only.
        </p>
      </div>
    );
  }

  const totalMonthlyPayroll = payrollRecords.reduce((sum, p) => sum + p.netPay, 0);

  const presentCount = attendance.filter((a) => a.status === "Present").length;
  const lateCount = attendance.filter((a) => a.status === "Late").length;
  const absentCount = attendance.filter((a) => a.status === "Absent").length;
  const leaveCount = attendance.filter((a) => a.status === "On Leave").length;
  const totalAtt = attendance.length || 1;

  const punctualityRate = Math.round((presentCount / totalAtt) * 100);

  const deptCounts: Record<string, number> = {};
  employees.forEach((e) => {
    deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
  });

  const maxDept = Math.max(...Object.values(deptCounts), 1);

  const leaveTypesCount: Record<string, number> = {};
  leaveRequests.forEach((l) => {
    leaveTypesCount[l.type] = (leaveTypesCount[l.type] || 0) + 1;
  });

  function handleExportCSV() {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Employee,Department,Position,Status,JoinDate\n" +
      employees
        .map((e) => `"${e.name}","${e.department}","${e.position}","${e.status}","${e.dateJoined}"`)
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ERP_Executive_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Executive Reports & Analytics</h2>
          <p className="text-xs text-slate-500">
            Company-wide metrics, payroll distribution, and workforce productivity insights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4 text-slate-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export CSV
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:bg-indigo-700"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231a1.125 1.125 0 0 1-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M3 9.456V15.75c0 1.081.768 2.015 1.837 2.175a48.056 48.056 0 0 1 1.913.247m0-8.718c.24-.03.48-.062.72-.096m-.72.096a42.414 42.414 0 0 1 10.56 0m-10.56 0L6.34 3m10.94 4.171c.24-.03.48-.062.72-.096m-.72.096L17.66 3m0 0-.229-2.523A1.125 1.125 0 0 0 16.31 0H7.69a1.125 1.125 0 0 0-1.12 1.227L6.34 3" />
            </svg>
            Print Executive Summary
          </button>
        </div>
      </div>

      {/* Top Stat Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Monthly Payroll"
          value={formatCurrency(totalMonthlyPayroll)}
          accent="#6366F1"
          hint={`${payrollRecords.length} records processed`}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-6h6" />
            </svg>
          }
        />
        <StatCard
          label="Punctuality Score"
          value={`${punctualityRate}%`}
          accent="#10B981"
          hint={`${presentCount} present on time`}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          }
        />
        <StatCard
          label="Leave Applications"
          value={leaveRequests.length}
          accent="#F59E0B"
          hint={`${leaveRequests.filter((l) => l.status === "Approved").length} approved`}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25" />
            </svg>
          }
        />
        <StatCard
          label="Active Company Assets"
          value={assets.length}
          accent="#8B5CF6"
          hint={`${assets.filter((a) => a.status === "Allocated").length} assigned to staff`}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25" />
            </svg>
          }
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Department Headcount Chart */}
        <Card className="lg:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department Headcount & Allocation</h3>
              <p className="text-xs text-slate-400">Distribution of workforce across organizational divisions</p>
            </div>
            <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">
              {employees.length} Staff
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {Object.entries(deptCounts).map(([dept, count]) => {
              const pct = Math.round((count / maxDept) * 100);
              return (
                <div key={dept} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{dept}</span>
                    <span className="text-slate-900">{count} employees</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Attendance Breakdown Ring/Stats */}
        <Card className="lg:col-span-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Attendance Punctuality Breakdown</h3>
            <p className="text-xs text-slate-400">Historical check-in performance log records</p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-emerald-50/60 p-3.5 border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white font-bold text-xs">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-950">Present On Time</p>
                  <p className="text-[11px] text-emerald-700">Checked in within grace window</p>
                </div>
              </div>
              <span className="text-sm font-black text-emerald-700">{presentCount}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-amber-50/60 p-3.5 border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white font-bold text-xs">
                  !
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-950">Late Arrival Marks</p>
                  <p className="text-[11px] text-amber-700">Punched in after grace period</p>
                </div>
              </div>
              <span className="text-sm font-black text-amber-700">{lateCount}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-rose-50/60 p-3.5 border border-rose-100">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500 text-white font-bold text-xs">
                  &times;
                </div>
                <div>
                  <p className="text-xs font-bold text-rose-950">Absent Logs</p>
                  <p className="text-[11px] text-rose-700">No punch in recorded</p>
                </div>
              </div>
              <span className="text-sm font-black text-rose-700">{absentCount}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-indigo-50/60 p-3.5 border border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white font-bold text-xs">
                  🏖️
                </div>
                <div>
                  <p className="text-xs font-bold text-indigo-950">Approved Leave</p>
                  <p className="text-[11px] text-indigo-700">Authorized leave period</p>
                </div>
              </div>
              <span className="text-sm font-black text-indigo-700">{leaveCount}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Leave Types & Asset Status Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Leave Distribution by Type</h3>
            <p className="text-xs text-slate-400">Total requested leave requests breakdown</p>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {Object.entries(leaveTypesCount).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between py-2.5">
                <span className="text-xs font-semibold text-slate-700">{type} Leave</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-800">
                  {count} requests
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Asset Allocation Status</h3>
            <p className="text-xs text-slate-400">Inventory equipment deployment status</p>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-200/60">
              <p className="text-xs text-slate-500 font-medium">Allocated</p>
              <p className="mt-1 text-lg font-black text-indigo-600">
                {assets.filter((a) => a.status === "Allocated").length}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-200/60">
              <p className="text-xs text-slate-500 font-medium">Available</p>
              <p className="mt-1 text-lg font-black text-emerald-600">
                {assets.filter((a) => a.status === "Available").length}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-200/60">
              <p className="text-xs text-slate-500 font-medium">In Repair</p>
              <p className="mt-1 text-lg font-black text-amber-600">
                {assets.filter((a) => a.status === "In Repair").length}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
