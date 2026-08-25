"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useAppData } from "@/context/AppDataContext";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { formatCurrency, formatDate, formatMonth, formatTime, workHours } from "@/lib/format";
import { findShift, serviceLength } from "@/lib/hr";

export default function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { employees, attendance, leaveRequests, payrollRecords, shifts } = useAppData();

  const employee = employees.find((e) => e.id === id);
  if (!employee) notFound();

  const empAttendance = attendance
    .filter((a) => a.employeeId === id)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 10);
  const empLeave = leaveRequests.filter((l) => l.employeeId === id);
  const empPayroll = payrollRecords
    .filter((p) => p.employeeId === id)
    .sort((a, b) => (a.month < b.month ? 1 : -1));
  const supervisor = employee.supervisorId
    ? employees.find((e) => e.id === employee.supervisorId)
    : undefined;

  return (
    <div className="space-y-6">
      <Link
        href="/employees"
        className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        ← Back to Employees
      </Link>

      <Card className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={employee.name} color={employee.avatarColor} size={64} />
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {employee.name}
            </h2>
            <p className="text-sm text-slate-500">
              {employee.position} · {employee.department}
            </p>
            <div className="mt-2 flex gap-2">
              <Badge label={employee.status} />
              <Badge label={employee.role} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
          <p className="min-w-0 text-slate-400">
            Employee Code{" "}
            <span className="block font-medium text-slate-700">
              {employee.employeeCode}
            </span>
          </p>
          <p className="min-w-0 text-slate-400">
            Email{" "}
            <span className="block break-all font-medium text-slate-700">
              {employee.email}
            </span>
          </p>
          <p className="min-w-0 text-slate-400">
            Phone{" "}
            <span className="block font-medium text-slate-700">
              {employee.phone}
            </span>
          </p>
          <p className="min-w-0 text-slate-400">
            Employment{" "}
            <span className="block font-medium text-slate-700">
              {employee.employmentStatus}
            </span>
          </p>
          <p className="min-w-0 text-slate-400">
            Date Joined{" "}
            <span className="block font-medium text-slate-700">
              {formatDate(employee.dateJoined)}
            </span>
          </p>
          <p className="min-w-0 text-slate-400">
            Service Length{" "}
            <span className="block font-medium text-slate-700">
              {serviceLength(employee.dateJoined)}
            </span>
          </p>
          <p className="min-w-0 text-slate-400">
            Shift{" "}
            <span className="block font-medium text-slate-700">
              {findShift(shifts, employee.shiftId).name} (
              {findShift(shifts, employee.shiftId).startTime}–
              {findShift(shifts, employee.shiftId).endTime})
            </span>
          </p>
          <p className="min-w-0 text-slate-400 sm:col-span-3">
            Reports To{" "}
            <span className="block font-medium text-slate-700">
              {supervisor ? supervisor.name : "— None (top of hierarchy) —"}
            </span>
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card padded={false}>
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Recent Attendance
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-2.5 font-medium">Date</th>
                  <th className="px-5 py-2.5 font-medium">In</th>
                  <th className="px-5 py-2.5 font-medium">Out</th>
                  <th className="px-5 py-2.5 font-medium">Hours</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {empAttendance.map((rec) => (
                  <tr key={rec.id}>
                    <td className="px-5 py-2.5 text-slate-600">
                      {formatDate(rec.date)}
                    </td>
                    <td className="px-5 py-2.5 text-slate-500">
                      {formatTime(rec.checkIn)}
                    </td>
                    <td className="px-5 py-2.5 text-slate-500">
                      {formatTime(rec.checkOut)}
                    </td>
                    <td className="px-5 py-2.5 text-slate-500">
                      {workHours(rec.checkIn, rec.checkOut)}
                    </td>
                    <td className="px-5 py-2.5">
                      <Badge label={rec.status} />
                    </td>
                  </tr>
                ))}
                {empAttendance.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                      No attendance history yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card padded={false}>
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Leave History
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-2.5 font-medium">Type</th>
                  <th className="px-5 py-2.5 font-medium">Dates</th>
                  <th className="px-5 py-2.5 font-medium">Days</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {empLeave.map((lv) => (
                  <tr key={lv.id}>
                    <td className="px-5 py-2.5">
                      <Badge label={lv.type} />
                    </td>
                    <td className="px-5 py-2.5 text-slate-500">
                      {formatDate(lv.startDate)} – {formatDate(lv.endDate)}
                    </td>
                    <td className="px-5 py-2.5 text-slate-500">{lv.days}</td>
                    <td className="px-5 py-2.5">
                      <Badge label={lv.status} />
                    </td>
                  </tr>
                ))}
                {empLeave.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                      No leave requests yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card padded={false} className="xl:col-span-2">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Payroll History
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-2.5 font-medium">Month</th>
                  <th className="px-5 py-2.5 font-medium">Basic</th>
                  <th className="px-5 py-2.5 font-medium">Gross</th>
                  <th className="px-5 py-2.5 font-medium">Deductions</th>
                  <th className="px-5 py-2.5 font-medium">Net Pay</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {empPayroll.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-2.5 text-slate-600">
                      {formatMonth(p.month)}
                    </td>
                    <td className="px-5 py-2.5 text-slate-500">
                      {formatCurrency(p.basicSalary)}
                    </td>
                    <td className="px-5 py-2.5 text-emerald-600">
                      {formatCurrency(p.grossPay)}
                    </td>
                    <td className="px-5 py-2.5 text-rose-600">
                      -{formatCurrency(p.totalDeductions)}
                    </td>
                    <td className="px-5 py-2.5 font-medium text-slate-800">
                      {formatCurrency(p.netPay)}
                    </td>
                    <td className="px-5 py-2.5">
                      <Badge label={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
