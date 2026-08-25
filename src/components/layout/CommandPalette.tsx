"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/context/AppDataContext";
import Avatar from "@/components/ui/Avatar";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const { employees, projects, tasks, documents, activeEmployee } = useAppData();
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose(); // toggle if called from outside or handle state
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredEmployees = q
    ? employees.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q) ||
          e.position.toLowerCase().includes(q)
      ).slice(0, 4)
    : employees.slice(0, 3);

  const filteredProjects = q
    ? projects.filter(
        (p) => p.name.toLowerCase().includes(q) || p.department.toLowerCase().includes(q)
      ).slice(0, 3)
    : projects.slice(0, 2);

  const filteredTasks = q
    ? tasks.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const pages = [
    { label: "Dashboard Overview", href: "/", icon: "📊" },
    { label: "Employee Directory", href: "/employees", icon: "👥" },
    { label: "Attendance Logs & Punch", href: "/attendance", icon: "⏰" },
    { label: "Projects & Kanban Board", href: "/projects", icon: "🗂️" },
    ...(activeEmployee.role !== "Employee"
      ? [{ label: "Executive Reports & Analytics", href: "/reports", icon: "📈" }]
      : []),
    { label: "Leave Requests & Approvals", href: "/leave", icon: "📅" },
    { label: "Payroll Records", href: "/payroll", icon: "💳" },
    { label: "Company Assets", href: "/assets", icon: "💻" },
    { label: "Document Hub", href: "/documents", icon: "📁" },
    { label: "Performance Reviews", href: "/performance", icon: "⭐" },
  ];

  const filteredPages = q
    ? pages.filter((p) => p.label.toLowerCase().includes(q))
    : pages.slice(0, 4);

  function navigateTo(url: string) {
    router.push(url);
    onClose();
    setQuery("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 pt-20 backdrop-blur-xs transition-all animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-5 w-5 text-slate-400 shrink-0"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employees, projects, tasks, navigation..."
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          <kbd className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {/* Navigation Pages */}
          {filteredPages.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Pages & Navigation
              </p>
              <div className="space-y-0.5">
                {filteredPages.map((page) => (
                  <button
                    key={page.href}
                    onClick={() => navigateTo(page.href)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    <span className="text-base">{page.icon}</span>
                    <span className="flex-1">{page.label}</span>
                    <span className="text-xs text-slate-400">&rarr;</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Employees */}
          {filteredEmployees.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Employees
              </p>
              <div className="space-y-0.5">
                {filteredEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => navigateTo(`/employees/${emp.id}`)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-slate-50"
                  >
                    <Avatar name={emp.name} color={emp.avatarColor} size={28} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 leading-tight">
                        {emp.name}
                      </p>
                      <p className="text-xs text-slate-400 leading-tight">
                        {emp.position} · {emp.department}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      {emp.employeeCode}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {filteredProjects.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Projects
              </p>
              <div className="space-y-0.5">
                {filteredProjects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => navigateTo("/projects")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-slate-50"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold">
                      P
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 leading-tight">
                        {proj.name}
                      </p>
                      <p className="text-xs text-slate-400 leading-tight">
                        {proj.department} · Due {proj.dueDate}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {filteredTasks.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Tasks
              </p>
              <div className="space-y-0.5">
                {filteredTasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => navigateTo("/projects")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 leading-tight">
                        {t.title}
                      </p>
                      <p className="text-xs text-slate-400 leading-tight">
                        {t.status} · Priority: {t.priority}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {q &&
            filteredPages.length === 0 &&
            filteredEmployees.length === 0 &&
            filteredProjects.length === 0 &&
            filteredTasks.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No matching results found for &ldquo;{query}&rdquo;
              </div>
            )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-2 text-[11px] text-slate-400">
          <span>Navigate with mouse or arrow keys</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
