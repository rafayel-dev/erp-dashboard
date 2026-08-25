"use client";

import Link from "next/link";
import { useAppData } from "@/context/AppDataContext";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import ProfileBanner from "@/components/dashboard/ProfileBanner";
import AttendancePunchCard from "@/components/dashboard/AttendancePunchCard";
import AttendanceCalendarCard from "@/components/dashboard/AttendanceCalendarCard";
import NoticeBoard from "@/components/dashboard/NoticeBoard";
import LeavePanel from "@/components/dashboard/LeavePanel";
import AdvanceSalaryCard from "@/components/dashboard/AdvanceSalaryCard";
import BirthdaysAnniversariesCard from "@/components/dashboard/BirthdaysAnniversariesCard";
import { formatTime, workHours } from "@/lib/format";
import { departments } from "@/lib/mockData";
import { todayStr } from "@/lib/hr";

export default function DashboardPage() {
  const { employees, attendance, leaveRequests, activeEmployee, tasks, projects } = useAppData();

  const supervisor = activeEmployee.supervisorId
    ? employees.find((e) => e.id === activeEmployee.supervisorId)
    : undefined;

  const showCompanyOverview = activeEmployee.role !== "Employee";

  const today = todayStr();
  const todaysRecords = attendance.filter((a) => a.date === today);
  const presentCount = todaysRecords.filter(
    (a) => a.status === "Present" || a.status === "Late"
  ).length;
  const pendingLeave = leaveRequests.filter((l) => l.status === "Pending");
  const activeTasksCount = tasks.filter((t) => t.status === "In Progress" || t.status === "To Do").length;

  const deptCounts = departments.map((dept) => ({
    dept,
    count: employees.filter((e) => e.department === dept).length,
  }));
  const maxDeptCount = Math.max(...deptCounts.map((d) => d.count), 1);

  return (
    <div className="w-full space-y-6">
      {/* 👑 PROFILE BANNER */}
      <ProfileBanner employee={activeEmployee} supervisor={supervisor} />

      {/* ⚡ QUICK ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 p-4 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs">
            ⚡
          </span>
          <span className="text-sm font-bold text-white">Quick Actions</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/leave"
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-white/20 border border-white/10"
          >
            <span>📅 Request Leave</span>
          </Link>
          <Link
            href="/projects"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500"
          >
            <span>🗂️ My Projects</span>
            {activeTasksCount > 0 && (
              <span className="rounded-full bg-white px-1.5 py-0.2 text-[10px] font-bold text-indigo-700">
                {activeTasksCount}
              </span>
            )}
          </Link>
          <Link
            href="/attendance"
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-white/20 border border-white/10"
          >
            <span>⏰ Log History</span>
          </Link>
        </div>
      </div>

      {/* 🧩 CORE BENTO GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Box A: Live Punch Card (Takes 4 cols) */}
        <div className="lg:col-span-4 h-full">
          <AttendancePunchCard employeeId={activeEmployee.id} />
        </div>

        {/* Box B: Attendance Calendar (Takes 8 cols) */}
        <div className="lg:col-span-8 h-full">
          <AttendanceCalendarCard employeeId={activeEmployee.id} />
        </div>

        {/* Box C: Leave Panel (Takes 6 cols) */}
        <div className="lg:col-span-6 h-full">
          <LeavePanel employeeId={activeEmployee.id} />
        </div>

        {/* Box D: Advance Salary (Takes 6 cols) */}
        <div className="lg:col-span-6 h-full">
          <AdvanceSalaryCard employeeId={activeEmployee.id} />
        </div>
      </div>

      {/* 📰 NOTICES & CULTURE BENTO */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <NoticeBoard />
        </div>
        <div className="lg:col-span-4">
          <BirthdaysAnniversariesCard />
        </div>
      </div>

      {/* 📈 EXECUTIVE MANAGEMENT FLOOR */}
      {showCompanyOverview && (
        <div className="mt-8 rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-900/5">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                Executive Overview
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Real-time operational metrics for management
              </p>
            </div>
            <Link
              href="/reports"
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white"
            >
              View Full Reports <span>&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Workforce"
              value={employees.length}
              accent="#6366F1"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" />
                  <circle cx="10" cy="7" r="4" />
                </svg>
              }
            />
            <StatCard
              label="Live Attendance"
              value={presentCount}
              accent="#10B981"
              hint={`${Math.round((presentCount / employees.length) * 100)}% present`}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                </svg>
              }
            />
            <StatCard
              label="Active Projects"
              value={projects.length}
              accent="#8B5CF6"
              hint={`${tasks.length} tasks tracked`}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108" />
                </svg>
              }
            />
            <StatCard
              label="Pending Approvals"
              value={pendingLeave.length}
              accent="#F59E0B"
              hint="Action required"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <Card className="lg:col-span-4" padded={false}>
              <div className="border-b border-slate-100 p-5">
                <h3 className="text-sm font-bold text-slate-900">Department Setup</h3>
              </div>
              <div className="p-5 space-y-4">
                {deptCounts.map(({ dept, count }) => (
                  <div key={dept}>
                    <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-600">{dept}</span>
                      <span className="text-slate-900">{count} members</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600"
                        style={{ width: `${(count / maxDeptCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="lg:col-span-8" padded={false}>
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <h3 className="text-sm font-bold text-slate-900">
                  Live Team Roster
                </h3>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-3 font-semibold text-[10px]">Employee</th>
                      <th className="px-6 py-3 font-semibold text-[10px]">Department</th>
                      <th className="px-6 py-3 font-semibold text-[10px]">Arrival</th>
                      <th className="px-6 py-3 font-semibold text-[10px]">Departure</th>
                      <th className="px-6 py-3 font-semibold text-[10px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employees.map((emp) => {
                      const rec = todaysRecords.find((a) => a.employeeId === emp.id);
                      return (
                        <tr key={emp.id}>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar name={emp.name} color={emp.avatarColor} size={32} />
                              <span className="font-bold text-slate-800">
                                {emp.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-3.5 text-xs font-medium text-slate-500">{emp.department}</td>
                          <td className="px-6 py-3.5 text-xs font-semibold text-slate-700">
                            {formatTime(rec?.checkIn ?? null)}
                          </td>
                          <td className="px-6 py-3.5 text-xs font-semibold text-slate-700">
                            {formatTime(rec?.checkOut ?? null)}
                          </td>
                          <td className="px-6 py-3.5">
                            <Badge label={rec?.status ?? "Absent"} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
