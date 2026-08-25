"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { inputClass } from "@/components/ui/Field";
import ReportIssueModal from "@/components/attendance/ReportIssueModal";
import CorrectionModal from "@/components/attendance/CorrectionModal";
import { formatDate, formatTime, workHours } from "@/lib/format";
import { canActOn, canResolveAttendanceIssue, todayStr } from "@/lib/hr";
import type { AttendanceIssue, AttendanceRecord, Employee } from "@/types";

export default function AttendancePage() {
  const { employees, attendance, attendanceIssues, activeEmployee, checkIn, checkOut } =
    useAppData();
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const isToday = selectedDate === todayStr();

  const [reportTarget, setReportTarget] = useState<Employee | null>(null);
  const [correctionTarget, setCorrectionTarget] = useState<{
    emp: Employee;
    record: AttendanceRecord | undefined;
    issue: AttendanceIssue | null;
  } | null>(null);

  const rows = useMemo(() => {
    return employees.map((emp) => {
      const record = attendance.find(
        (a) => a.employeeId === emp.id && a.date === selectedDate
      );
      return { emp, record };
    });
  }, [employees, attendance, selectedDate]);

  const presentToday = rows.filter(
    (r) => r.record?.status === "Present" || r.record?.status === "Late"
  ).length;
  const absentToday = rows.filter((r) => r.record?.status === "Absent" || !r.record).length;
  const lateToday = rows.filter((r) => r.record?.status === "Late").length;

  const visibleIssues = useMemo(() => {
    return attendanceIssues
      .filter((iss) => {
        const emp = employees.find((e) => e.id === iss.employeeId);
        if (!emp) return false;
        return (
          iss.employeeId === activeEmployee.id ||
          canResolveAttendanceIssue(activeEmployee, emp)
        );
      })
      .sort((a, b) => (a.raisedOn < b.raisedOn ? 1 : -1));
  }, [attendanceIssues, employees, activeEmployee]);

  const openIssues = visibleIssues.filter((i) => i.status === "Open");

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm font-semibold text-slate-500">Present Today</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{presentToday}</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-slate-500">Late Arrivals</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{lateToday}</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-slate-500">Absent</p>
          <p className="mt-1 text-2xl font-bold text-rose-600">{absentToday}</p>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <input
          type="date"
          value={selectedDate}
          max={todayStr()}
          onChange={(e) => setSelectedDate(e.target.value)}
          className={`${inputClass} max-w-[180px]`}
        />
        {!isToday && (
          <span className="text-xs text-slate-400">
            Viewing historical record — check-in/out is only available for today.
          </span>
        )}
      </div>

      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-semibold">Employee</th>
                <th className="px-5 py-3 font-semibold">Department</th>
                <th className="px-5 py-3 font-semibold">Check In</th>
                <th className="px-5 py-3 font-semibold">Check Out</th>
                <th className="px-5 py-3 font-semibold">Method &amp; Location</th>
                <th className="px-5 py-3 font-semibold">Hours</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(({ emp, record }) => {
                const canPunch = isToday && canActOn(activeEmployee, emp);
                const canReport = emp.id === activeEmployee.id || canActOn(activeEmployee, emp);
                const canCorrect = canResolveAttendanceIssue(activeEmployee, emp);

                const method = record?.punchMethod ?? "Manual";
                const dist = record?.location?.distanceMeters;

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={emp.name} color={emp.avatarColor} size={28} />
                        <span className="font-bold text-slate-800">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{emp.department}</td>
                    <td className="px-5 py-3 text-slate-600 font-medium">
                      {formatTime(record?.checkIn ?? null)}
                    </td>
                    <td className="px-5 py-3 text-slate-600 font-medium">
                      {formatTime(record?.checkOut ?? null)}
                    </td>
                    <td className="px-5 py-3">
                      {record ? (
                        <div className="flex flex-col gap-0.5">
                          <span
                            className={`inline-flex items-center gap-1 w-max rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                              method === "Geo-Fenced"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : method === "QR Scan"
                                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {method === "Geo-Fenced" ? "📍 Geo-Fenced" : method === "QR Scan" ? "📷 QR Code" : "⌨️ Manual"}
                          </span>
                          {dist !== undefined && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              HQ Dist: {dist}m
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-600 font-medium">
                      {workHours(record?.checkIn ?? null, record?.checkOut ?? null)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge label={record?.status ?? "Absent"} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-2">
                        {canPunch && (
                          <>
                            <button
                              onClick={() => checkIn(emp.id)}
                              disabled={!!record}
                              className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-300"
                            >
                              In
                            </button>
                            <button
                              onClick={() => checkOut(emp.id)}
                              disabled={!record || !!record?.checkOut}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                            >
                              Out
                            </button>
                          </>
                        )}
                        {canReport && (
                          <button
                            onClick={() => setReportTarget(emp)}
                            className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                          >
                            Report Issue
                          </button>
                        )}
                        {canCorrect && (
                          <button
                            onClick={() => setCorrectionTarget({ emp, record, issue: null })}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            Correct
                          </button>
                        )}
                        {!canPunch && !canReport && !canCorrect && (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card padded={false}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-bold text-slate-900">Attendance Issues</h2>
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
            {openIssues.length} open
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-semibold">Employee</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Description</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleIssues.map((issue) => {
                const emp = employees.find((e) => e.id === issue.employeeId);
                if (!emp) return null;
                const record = attendance.find(
                  (a) => a.employeeId === issue.employeeId && a.date === issue.date
                );
                const canResolve =
                  issue.status === "Open" && canResolveAttendanceIssue(activeEmployee, emp);
                return (
                  <tr key={issue.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={emp.name} color={emp.avatarColor} size={26} />
                        <span className="font-bold text-slate-800">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{formatDate(issue.date)}</td>
                    <td className="max-w-[280px] px-5 py-3 text-slate-600 font-medium">
                      {issue.description}
                      {issue.status !== "Open" && issue.resolutionNote && (
                        <p className="mt-1 text-[11px] italic text-slate-400">
                          Resolution: {issue.resolutionNote}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Badge label={issue.status} />
                    </td>
                    <td className="px-5 py-3">
                      {canResolve ? (
                        <button
                          onClick={() => setCorrectionTarget({ emp, record, issue })}
                          className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {visibleIssues.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    No attendance issues reported.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {reportTarget && (
        <ReportIssueModal
          open={!!reportTarget}
          onClose={() => setReportTarget(null)}
          employeeId={reportTarget.id}
          date={selectedDate}
          raisedBy={activeEmployee.id}
        />
      )}

      {correctionTarget && (
        <CorrectionModal
          open={!!correctionTarget}
          onClose={() => setCorrectionTarget(null)}
          employeeId={correctionTarget.emp.id}
          date={correctionTarget.issue?.date ?? selectedDate}
          existingRecord={correctionTarget.record}
          issue={correctionTarget.issue}
          resolverId={activeEmployee.id}
        />
      )}
    </div>
  );
}
