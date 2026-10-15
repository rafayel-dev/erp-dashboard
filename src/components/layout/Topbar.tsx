"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppData } from "@/context/AppDataContext";
import { useNow } from "@/hooks/useNow";
import { isAdminOrHR } from "@/lib/hr";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import NotificationPopover from "./NotificationPopover";
import CommandPalette from "./CommandPalette";
import { Search, RotateCcw, LogOut, Eye, EyeOff, ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const titles: Record<string, string> = {
  "/": "Dashboard Overview",
  "/employees": "Employee Management",
  "/attendance": "Attendance Tracking",
  "/shifts": "Shift Schedules",
  "/leave": "Leave Approvals & Records",
  "/projects": "Projects & Kanban Board",
  "/reports": "Reports & Analytics Hub",
  "/payroll": "Payroll Operations",
  "/assets": "Asset Management",
  "/documents": "Document Repository",
  "/performance": "Performance Reviews",
  "/expenses": "Expense Claims & Reimbursements",
  "/helpdesk": "Internal Helpdesk & Support",
};

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    employees,
    session,
    logout,
    activeEmployeeId,
    activeEmployee,
    isImpersonating,
    setActiveEmployeeId,
    stopImpersonating,
    resetAllData,
  } = useAppData();
  const now = useNow(30_000);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!session) return null;

  const title =
    titles[pathname] ??
    (pathname.startsWith("/employees/") ? "Employee Profile" : "Office ERP");
  const canImpersonate = isAdminOrHR(session.role);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <>
      <header
        className={`flex shrink-0 flex-col justify-center gap-1.5 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-2xl md:px-8 z-30 select-none shadow-xs ${
          isImpersonating ? "min-h-16 py-2.5" : "h-16"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Title & Live Status */}
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight md:text-lg">
                  {title}
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 border border-slate-200/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live
                </span>
              </div>
              {now && (
                <p className="text-[11px] font-medium text-slate-400">
                  {now.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  ·{" "}
                  {now.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            {/* Quick Search Button */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="hidden items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/90 px-3 py-1.5 text-xs font-medium text-slate-400 transition-all duration-200 hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-600 sm:flex shadow-2xs group cursor-pointer"
            >
              <Search className="h-3.5 w-3.5 text-slate-400 transition-colors group-hover:text-brand-500" />
              <span>Search app...</span>
              <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-500 shadow-2xs group-hover:border-brand-200">
                ⌘K
              </kbd>
            </button>

            {/* Notification Bell */}
            <NotificationPopover />

            {/* Role & Impersonation Selector */}
            {canImpersonate ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white py-1 pl-1.5 pr-2.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-xs active:scale-[0.98] shadow-2xs cursor-pointer">
                    <Avatar
                      name={activeEmployee.name}
                      color={activeEmployee.avatarColor}
                      size={26}
                    />
                    <div className="flex flex-col text-left leading-tight">
                      <span className="font-bold text-slate-800 text-xs">{activeEmployee.name}</span>
                      <span className="text-[10px] text-brand-600 font-semibold">{activeEmployee.role}</span>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1 opacity-70 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-soft-lg">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-slate-400">
                    Switch Demo Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {employees.map((emp) => {
                    const isCurrent = emp.id === activeEmployeeId;
                    return (
                      <DropdownMenuItem
                        key={emp.id}
                        onClick={() => setActiveEmployeeId(emp.id)}
                        className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-xs cursor-pointer ${
                          isCurrent ? "bg-brand-50 font-bold text-brand-700" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar name={emp.name} color={emp.avatarColor} size={22} />
                          <span className="truncate">{emp.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge label={emp.role} />
                          {isCurrent && <Check className="h-3.5 w-3.5 text-brand-600" />}
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/80 p-1 pr-3">
                <Avatar name={session.name} color={session.avatarColor} size={28} />
                <div className="hidden leading-tight sm:block">
                  <p className="text-xs font-bold text-slate-800">{session.name}</p>
                </div>
                <Badge label={session.role} />
              </div>
            )}

            {/* Reset Demo button */}
            <button
              onClick={() => {
                if (window.confirm("Reset all modified demo data back to default initial values?")) {
                  resetAllData();
                }
              }}
              title="Reset mock data to initial defaults"
              className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200/80 px-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 shadow-2xs"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              title="Sign out of ERP"
              className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200/80 px-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 shadow-2xs"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Impersonation Banner */}
        {isImpersonating && (
          <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-800 border border-amber-200/70 shadow-2xs">
            <div className="flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 text-amber-600" />
              <span>
                Admin preview mode: Viewing interface as <strong>{activeEmployee.name}</strong> ({activeEmployee.role}).
              </span>
            </div>
            <button
              onClick={stopImpersonating}
              className="flex items-center gap-1 font-bold text-amber-900 hover:underline underline-offset-2"
            >
              <EyeOff className="h-3 w-3" />
              Exit preview
            </button>
          </div>
        )}
      </header>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  );
}
