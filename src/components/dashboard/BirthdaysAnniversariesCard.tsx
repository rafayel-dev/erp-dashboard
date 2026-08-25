"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import { daysUntil, formatMonthDay, relativeDayLabel } from "@/lib/hr";

export default function BirthdaysAnniversariesCard() {
  const { employees } = useAppData();
  const [tab, setTab] = useState<"birthdays" | "anniversaries">("birthdays");

  const birthdays = useMemo(
    () =>
      employees
        .map((e) => ({ emp: e, days: daysUntil(e.birthday) }))
        .sort((a, b) => a.days - b.days)
        .slice(0, 4),
    [employees]
  );

  const anniversaries = useMemo(
    () =>
      employees
        .map((e) => ({ emp: e, days: daysUntil(e.dateJoined.slice(5)) }))
        .sort((a, b) => a.days - b.days)
        .slice(0, 4),
    [employees]
  );

  const list = tab === "birthdays" ? birthdays : anniversaries;

  return (
    <Card className="flex h-full flex-col">
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-xs font-medium">
        <button
          onClick={() => setTab("birthdays")}
          className={`flex-1 rounded-md py-1.5 transition-colors ${
            tab === "birthdays" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
        >
          Birthdays
        </button>
        <button
          onClick={() => setTab("anniversaries")}
          className={`flex-1 rounded-md py-1.5 transition-colors ${
            tab === "anniversaries" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
        >
          Work Anniversary
        </button>
      </div>

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
        {list.map(({ emp, days }) => (
          <div key={emp.id} className="flex items-center gap-3">
            <Avatar name={emp.name} color={emp.avatarColor} size={32} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{emp.name}</p>
              <p className="text-xs text-slate-400">
                {tab === "birthdays"
                  ? formatMonthDay(emp.birthday)
                  : `${(new Date().getFullYear() - new Date(emp.dateJoined).getFullYear())} years`}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
              {relativeDayLabel(days)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
