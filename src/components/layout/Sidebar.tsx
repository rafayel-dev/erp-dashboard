"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppData } from "@/context/AppDataContext";
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  CalendarCheck2,
  Kanban,
  BarChart3,
  Banknote,
  Receipt,
  LifeBuoy,
  TrendingUp,
  Laptop,
  FileText,
  Building2,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const { leaveRequests, tasks, activeEmployee, expenses, tickets } = useAppData();

  const pendingLeaves = leaveRequests.filter((l) => l.status === "Pending").length;
  const activeTasks = tasks.filter((t) => t.status === "In Progress" || t.status === "To Do").length;
  const pendingExpenses = expenses.filter((e) => e.status === "Pending").length;
  const openTickets = tickets.filter((t) => t.status === "Open" || t.status === "In Progress").length;

  const sections: NavSection[] = [
    {
      title: "Core Operations",
      items: [
        {
          href: "/",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
        {
          href: "/employees",
          label: "Employees",
          icon: Users,
        },
        {
          href: "/attendance",
          label: "Attendance",
          icon: Clock,
        },
        {
          href: "/shifts",
          label: "Shifts",
          icon: CalendarDays,
        },
        {
          href: "/leave",
          label: "Leave Management",
          badge: pendingLeaves > 0 ? pendingLeaves : undefined,
          icon: CalendarCheck2,
        },
      ],
    },
    {
      title: "Projects & Analytics",
      items: [
        {
          href: "/projects",
          label: "Projects & Tasks",
          badge: activeTasks > 0 ? activeTasks : undefined,
          icon: Kanban,
        },
        {
          href: "/reports",
          label: "Reports & Analytics",
          icon: BarChart3,
        },
        {
          href: "/performance",
          label: "Performance",
          icon: TrendingUp,
        },
      ],
    },
    {
      title: "Finance & Support",
      items: [
        {
          href: "/payroll",
          label: "Payroll",
          icon: Banknote,
        },
        {
          href: "/expenses",
          label: "Expense Claims",
          badge: pendingExpenses > 0 ? pendingExpenses : undefined,
          icon: Receipt,
        },
        {
          href: "/helpdesk",
          label: "IT & HR Helpdesk",
          badge: openTickets > 0 ? openTickets : undefined,
          icon: LifeBuoy,
        },
        {
          href: "/assets",
          label: "Company Assets",
          icon: Laptop,
        },
        {
          href: "/documents",
          label: "Documents",
          icon: FileText,
        },
      ],
    },
  ];

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white/90 backdrop-blur-2xl md:flex shadow-xs select-none relative z-20">
      {/* Brand Logo Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5 bg-white/50">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-400 text-sm font-black text-white shadow-md shadow-brand-500/25 ring-1 ring-white/30 transition-transform duration-200 hover:scale-105">
          <Building2 className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-extrabold tracking-tight text-slate-900 leading-none">
              RMNR ERP
            </p>
            <span className="rounded-sm bg-brand-50 px-1 py-0.2 text-[9px] font-bold text-brand-600 ring-1 ring-brand-500/20">
              PRO
            </span>
          </div>
          <p className="text-[10px] font-semibold tracking-wide text-slate-400 leading-none mt-1 uppercase">
            Enterprise Suite
          </p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="flex items-center px-3 pb-1 pt-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
            </div>
            {section.items.map((item) => {
              if (
                item.href === "/reports" &&
                (activeEmployee.role === "Employee" || activeEmployee.role === "IT Admin")
              )
                return null;

              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/25"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 hover:translate-x-1"
                  }`}
                >
                  {/* Subtle active left glow pill */}
                  {active && (
                    <span className="absolute -left-2 top-2 bottom-2 w-1 rounded-r-full bg-brand-400 shadow-sm" />
                  )}

                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                        active
                          ? "text-white"
                          : "text-slate-400 group-hover:text-slate-800 group-hover:scale-110"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 transition-colors ${
                        active
                          ? "bg-white/20 text-white shadow-2xs"
                          : "bg-brand-50 text-brand-600 ring-1 ring-brand-500/20 group-hover:bg-brand-100/80"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-100/90 p-3.5 bg-slate-50/50">
        <div className="rounded-xl border border-slate-200/70 bg-white p-3 shadow-2xs transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-xs font-bold text-slate-800">RMNR Cloud</p>
            </div>
            <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-600/20">
              v2.4
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-400 mt-1">Enterprise High Availability</p>
        </div>
      </div>
    </aside>
  );
}
