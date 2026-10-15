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
import { formatTime } from "@/lib/format";
import { departments } from "@/lib/mockData";
import { todayStr } from "@/lib/hr";
import {
  Zap,
  CalendarPlus,
  Receipt,
  LifeBuoy,
  Kanban,
  Clock,
  ArrowRight,
  Users,
  CheckCircle2,
  FolderGit2,
  AlertTriangle,
} from "lucide-react";

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
      <div className="relative overflow-hidden flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800/90 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 p-4 px-6 shadow-soft-lg backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-500/10 blur-2xl" />
        
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400 ring-1 ring-brand-400/30 shadow-xs">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-white tracking-wide">Quick Navigation</span>
              <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-bold text-brand-300 ring-1 ring-brand-400/20">Self-Service</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Instant shortcuts for daily workforce workflows</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/leave"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-all duration-200 hover:bg-white/10 hover:text-white hover:-translate-y-0.5 active:scale-95 shadow-2xs"
          >
            <CalendarPlus className="h-3.5 w-3.5 text-brand-300" />
            <span>Request Leave</span>
          </Link>
          <Link
            href="/expenses"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-all duration-200 hover:bg-white/10 hover:text-white hover:-translate-y-0.5 active:scale-95 shadow-2xs"
          >
            <Receipt className="h-3.5 w-3.5 text-emerald-300" />
            <span>Claim Expense</span>
          </Link>
          <Link
            href="/helpdesk"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-all duration-200 hover:bg-white/10 hover:text-white hover:-translate-y-0.5 active:scale-95 shadow-2xs"
          >
            <LifeBuoy className="h-3.5 w-3.5 text-amber-300" />
            <span>Support Ticket</span>
          </Link>
          <Link
            href="/projects"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-brand-500/30 transition-all duration-200 hover:from-brand-500 hover:to-brand-600 hover:-translate-y-0.5 active:scale-95"
          >
            <Kanban className="h-3.5 w-3.5" />
            <span>My Tasks</span>
            {activeTasksCount > 0 && (
              <span className="ml-1 rounded-full bg-white/25 px-1.5 py-0.2 text-[10px] font-black text-white">
                {activeTasksCount}
              </span>
            )}
          </Link>
          <Link
            href="/attendance"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-all duration-200 hover:bg-white/10 hover:text-white hover:-translate-y-0.5 active:scale-95 shadow-2xs"
          >
            <Clock className="h-3.5 w-3.5 text-sky-300" />
            <span>Attendance Log</span>
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
        <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                  Executive Overview
                </h2>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-600/20">
                  Live Sync
                </span>
              </div>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                Real-time operational indicators across 100+ company personnel
              </p>
            </div>
            <Link
              href="/reports"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 shadow-2xs"
            >
              <span>View Analytics</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Workforce"
              value={employees.length}
              accent="#6366F1"
              trend={{ value: "100+ active", isPositive: true }}
              hint="All verified personnel"
              icon={<Users className="h-5 w-5" />}
            />
            <StatCard
              label="Today's Attendance"
              value={presentCount}
              accent="#10B981"
              trend={{ value: `${Math.round((presentCount / employees.length) * 100)}% rate`, isPositive: true }}
              hint={`${Math.round((presentCount / employees.length) * 100)}% present today`}
              icon={<CheckCircle2 className="h-5 w-5" />}
            />
            <StatCard
              label="Active Projects"
              value={projects.length}
              accent="#8B5CF6"
              trend={{ value: `${tasks.length} tasks`, isPositive: true }}
              hint={`${tasks.length} active tasks tracked`}
              icon={<FolderGit2 className="h-5 w-5" />}
            />
            <StatCard
              label="Pending Approvals"
              value={pendingLeave.length}
              accent="#F59E0B"
              trend={{ value: `${pendingLeave.length} queue`, isPositive: pendingLeave.length === 0 }}
              hint="Action required by Leads"
              icon={<AlertTriangle className="h-5 w-5" />}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <Card className="lg:col-span-4 border border-slate-200/70" padded={false}>
              <div className="border-b border-slate-100 p-5">
                <h3 className="text-sm font-bold text-slate-900">Department Distribution</h3>
                <p className="text-[11px] text-slate-400">Headcount allocation</p>
              </div>
              <div className="p-5 space-y-4">
                {deptCounts.map(({ dept, count }) => (
                  <div key={dept}>
                    <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-600">{dept}</span>
                      <span className="text-slate-900 font-bold">{count} members</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-600 to-indigo-400 transition-all duration-500 ease-out"
                        style={{ width: `${(count / maxDeptCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="lg:col-span-8 border border-slate-200/70 flex flex-col" padded={false}>
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Live Team Roster
                  </h3>
                  <p className="text-[11px] text-slate-400">Daily check-in / check-out records (100+ employees)</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600">Active Monitoring</span>
                </div>
              </div>
              <div className="max-h-[380px] overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-md z-10 border-b border-slate-100">
                    <tr className="uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-2.5 font-semibold text-[10px]">Employee</th>
                      <th className="px-6 py-2.5 font-semibold text-[10px]">Department</th>
                      <th className="px-6 py-2.5 font-semibold text-[10px]">Arrival</th>
                      <th className="px-6 py-2.5 font-semibold text-[10px]">Departure</th>
                      <th className="px-6 py-2.5 font-semibold text-[10px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employees.map((emp) => {
                      const rec = todaysRecords.find((a) => a.employeeId === emp.id);
                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/80 transition-all duration-150">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar name={emp.name} color={emp.avatarColor} size={30} />
                              <div>
                                <p className="font-bold text-xs text-slate-800">
                                  {emp.name}
                                </p>
                                <p className="text-[10px] text-slate-400">{emp.employeeCode}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-xs font-medium text-slate-500">{emp.department}</td>
                          <td className="px-6 py-3 text-xs font-semibold text-slate-700">
                            {formatTime(rec?.checkIn ?? null)}
                          </td>
                          <td className="px-6 py-3 text-xs font-semibold text-slate-700">
                            {formatTime(rec?.checkOut ?? null)}
                          </td>
                          <td className="px-6 py-3">
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
