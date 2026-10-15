"use client";

import { useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useAppData } from "@/context/AppDataContext";
import { buildMonthGrid, monthStats } from "@/lib/hr";
import { formatDate, formatTime, workHours } from "@/lib/format";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const cellStyles: Record<string, string> = {
  Present: "bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-1 ring-emerald-500/20",
  Late: "bg-amber-50 text-amber-700 border-amber-200/60 ring-1 ring-amber-500/20",
  "On Leave": "bg-sky-50 text-sky-700 border-sky-200/60 ring-1 ring-sky-500/20",
  Absent: "bg-rose-50 text-rose-700 border-rose-200/60 ring-1 ring-rose-500/20",
  Weekend: "bg-slate-50 text-slate-400 border-slate-100",
};

const recentBorder: Record<string, string> = {
  Present: "border-l-emerald-500",
  Late: "border-l-amber-500",
  "On Leave": "border-l-sky-500",
  Absent: "border-l-rose-500",
};

const statLegend: { key: keyof ReturnType<typeof monthStats>; label: string; dot: string }[] = [
  { key: "payable", label: "Payable", dot: "bg-slate-400" },
  { key: "present", label: "Present", dot: "bg-emerald-500" },
  { key: "late", label: "Late", dot: "bg-amber-500" },
  { key: "onLeave", label: "Leave", dot: "bg-sky-500" },
  { key: "absent", label: "Absent", dot: "bg-rose-500" },
];

export default function AttendanceCalendarCard({
  employeeId,
}: {
  employeeId: string;
}) {
  const { attendance } = useAppData();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [view, setView] = useState<"calendar" | "recent">("calendar");

  const grid = useMemo(
    () => buildMonthGrid(year, month, employeeId, attendance),
    [year, month, employeeId, attendance]
  );
  const stats = useMemo(
    () => monthStats(year, month, employeeId, attendance),
    [year, month, employeeId, attendance]
  );
  const recent = useMemo(
    () =>
      attendance
        .filter((a) => a.employeeId === employeeId)
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 8),
    [attendance, employeeId]
  );

  function shiftMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  }

  const monthName = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
  });

  return (
    <Card className="flex h-full flex-col border border-slate-200/80 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Attendance Log</h2>
            <p className="text-[10px] text-slate-400">Monthly schedule and daily logs</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {view === "calendar" && (
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => shiftMonth(-1)}
                aria-label="Previous month"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200/80 text-slate-600 hover:bg-slate-100 shadow-2xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[95px] text-center font-bold text-xs text-slate-800">
                {monthName} {year}
              </span>
              <button
                onClick={() => shiftMonth(1)}
                aria-label="Next month"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200/80 text-slate-600 hover:bg-slate-100 shadow-2xs"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="flex gap-1 rounded-xl bg-slate-100/80 p-1 text-xs font-semibold">
            <button
              onClick={() => setView("calendar")}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                view === "calendar"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setView("recent")}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                view === "recent"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Recent
            </button>
          </div>
        </div>
      </div>

      {view === "calendar" ? (
        <>
          <div className="mt-3.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
            {statLegend.map(({ key, label, dot }) => (
              <span key={key} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className={`h-2 w-2 rounded-full ${dot}`} />
                <span className="font-bold text-slate-800">{stats[key]}</span> {label}
              </span>
            ))}
          </div>

          <div className="mt-3.5 grid grid-cols-7 gap-1.5 text-center">
            {WEEKDAYS.map((d) => (
              <div key={d} className="pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {d}
              </div>
            ))}
            {grid.map((day, i) => {
              const style = day.status ? cellStyles[day.status] : "";
              return (
                <div
                  key={i}
                  className={`rounded-xl border px-1 py-1.5 text-xs transition-all ${
                    day.inMonth ? "" : "opacity-0 pointer-events-none"
                  } ${style || "border-slate-100 text-slate-300 bg-white"} ${
                    day.isToday ? "ring-2 ring-brand-500 font-bold" : ""
                  }`}
                >
                  <div className="font-bold text-[11px]">{day.date.getDate()}</div>
                  {day.status && (
                    <div className="mt-0.5 truncate text-[8px] font-bold uppercase tracking-wide">
                      {day.status}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">
          {recent.length === 0 && (
            <p className="py-8 text-center text-xs text-slate-400">
              No recent attendance logs recorded.
            </p>
          )}
          {recent.map((rec) => (
            <div
              key={rec.id}
              className={`flex items-center justify-between rounded-xl border border-slate-200/60 border-l-4 bg-slate-50/60 py-2.5 pl-3 pr-3 text-xs transition-colors hover:bg-slate-50 ${
                recentBorder[rec.status] ?? "border-l-slate-300"
              }`}
            >
              <div>
                <p className="font-bold text-xs text-slate-800">{formatDate(rec.date)}</p>
                <p className="text-[11px] text-slate-400">
                  {formatTime(rec.checkIn)} → {formatTime(rec.checkOut)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800 mb-0.5">
                  {workHours(rec.checkIn, rec.checkOut)}
                </p>
                <Badge label={rec.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
