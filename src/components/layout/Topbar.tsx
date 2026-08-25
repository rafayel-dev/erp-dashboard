"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppData } from "@/context/AppDataContext";
import { useNow } from "@/hooks/useNow";
import { isAdminOrHR } from "@/lib/hr";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import NotificationPopover from "./NotificationPopover";
import CommandPalette from "./CommandPalette";

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
  } = useAppData();
  const now = useNow(30_000);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

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
      <header className="flex h-16 shrink-0 flex-col justify-center gap-1.5 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md md:px-8 z-30">
        <div className="flex items-center justify-between">
          {/* Title & Date */}
          <div>
            <h1 className="text-base font-bold text-slate-900 md:text-lg">{title}</h1>
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

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Quick Search Button */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-medium text-slate-400 transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-slate-600 sm:flex"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <span>Search app...</span>
              <kbd className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-500 shadow-xs">
                ⌘K
              </kbd>
            </button>

            {/* Notification Bell */}
            <NotificationPopover />

            {/* Role & Impersonation Selector */}
            {canImpersonate ? (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1 pr-3">
                <Avatar
                  name={activeEmployee.name}
                  color={activeEmployee.avatarColor}
                  size={28}
                />
                <select
                  value={activeEmployeeId}
                  onChange={(e) => setActiveEmployeeId(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Avatar name={session.name} color={session.avatarColor} size={28} />
                <div className="hidden leading-tight sm:block">
                  <p className="text-xs font-bold text-slate-800">{session.name}</p>
                </div>
                <Badge label={session.role} />
              </div>
            )}

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex h-9 items-center justify-center rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Impersonation Banner */}
        {isImpersonating && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1 text-xs text-amber-800 border border-amber-200/60">
            <span className="font-medium">
              Admin preview mode: Viewing interface as <strong>{activeEmployee.name}</strong>.
            </span>
            <button
              onClick={stopImpersonating}
              className="font-bold underline underline-offset-2 hover:text-amber-950"
            >
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
