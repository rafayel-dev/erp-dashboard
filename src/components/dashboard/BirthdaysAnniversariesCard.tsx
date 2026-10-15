"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import { daysUntil, formatMonthDay, relativeDayLabel } from "@/lib/hr";
import { Cake, Award } from "lucide-react";

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
    <Card className="flex h-full flex-col border border-slate-200/80 shadow-soft">
      <div className="flex gap-1 rounded-xl bg-slate-100/80 p-1 text-xs font-semibold">
        <button
          onClick={() => setTab("birthdays")}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all ${
            tab === "birthdays"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Cake className="h-3.5 w-3.5 text-pink-500" />
          <span>Birthdays</span>
        </button>
        <button
          onClick={() => setTab("anniversaries")}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all ${
            tab === "anniversaries"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Award className="h-3.5 w-3.5 text-amber-500" />
          <span>Anniversaries</span>
        </button>
      </div>

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
        {list.map(({ emp, days }) => (
          <div
            key={emp.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/60 bg-slate-50/50 p-2.5 transition-colors hover:bg-slate-50"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar name={emp.name} color={emp.avatarColor} size={32} />
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-800">{emp.name}</p>
                <p className="text-[10px] text-slate-400">
                  {tab === "birthdays"
                    ? formatMonthDay(emp.birthday)
                    : `Joined ${formatMonthDay(emp.dateJoined.slice(5))}`}
                </p>
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                days === 0
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                  : days <= 7
                  ? "bg-brand-50 text-brand-700 ring-1 ring-brand-500/20"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {relativeDayLabel(days)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
