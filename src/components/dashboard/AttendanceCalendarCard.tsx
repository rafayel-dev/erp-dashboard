"use client";

import { useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useAppData } from "@/context/AppDataContext";
import { buildMonthGrid, monthStats } from "@/lib/hr";
import { formatDate, formatTime, workHours } from "@/lib/format";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const cellStyles: Record<string, string> = {
  Present: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Late: "bg-amber-50 text-amber-700 border-amber-100",
  "On Leave": "bg-sky-50 text-sky-700 border-sky-100",
  Absent: "bg-rose-50 text-rose-700 border-rose-100",
  Weekend: "bg-slate-50 text-slate-400 border-slate-100",
};

const recentBorder: Record<string, string> = {
  Present: "border-l-emerald-500",
  Late: "border-l-amber-500",
  "On Leave": "border-l-sky-500",
  Absent: "border-l-rose-500",
};

const statLegend: { key: keyof ReturnType<typeof monthStats>; label: string; dot: string }[] = [
  { key: "payable", label: "Payable Days", dot: "bg-slate-400" },
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
    <Card className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900">Attendance Overview</h2>
        <div className="flex items-center gap-3">
          {view === "calendar" && (
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => shiftMonth(-1)}
                aria-label="Previous month"
                className="rounded-md border border-slate-200 px-2 py-1 text-slate-500 hover:bg-slate-50"
              >
                ‹
              </button>
              <span className="min-w-[110px] text-center font-medium text-slate-700">
                {monthName} {year}
              </span>
              <button
                onClick={() => shiftMonth(1)}
                aria-label="Next month"
                className="rounded-md border border-slate-200 px-2 py-1 text-slate-500 hover:bg-slate-50"
              >
                ›
              </button>
            </div>
          )}
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-xs font-medium">
            <button
              onClick={() => setView("calendar")}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                view === "calendar" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setView("recent")}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                view === "recent" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Recent Check-ins
            </button>
          </div>
        </div>
      </div>

      {view === "calendar" ? (
        <>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
            {statLegend.map(({ key, label, dot }) => (
              <span key={key} className="flex items-center gap-1.5 text-slate-500">
                <span className={`h-2 w-2 rounded-full ${dot}`} />
                <span className="font-semibold text-slate-800">{stats[key]}</span> {label}
              </span>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1.5 text-center">
            {WEEKDAYS.map((d) => (
              <div key={d} className="pb-1 text-[11px] font-medium uppercase text-slate-400">
                {d}
              </div>
            ))}
            {grid.map((day, i) => {
              const style = day.status ? cellStyles[day.status] : "";
              return (
                <div
                  key={i}
                  className={`rounded-lg border px-1 py-1.5 text-xs ${
                    day.inMonth ? "" : "opacity-0"
                  } ${style || "border-transparent text-slate-300"} ${
                    day.isToday ? "ring-2 ring-indigo-400" : ""
                  }`}
                >
                  <div className="font-medium">{day.date.getDate()}</div>
                  {day.status && (
                    <div className="mt-0.5 truncate text-[9px] font-semibold uppercase tracking-wide">
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
            <p className="py-6 text-center text-sm text-slate-400">
              No attendance recorded yet.
            </p>
          )}
          {recent.map((rec) => (
            <div
              key={rec.id}
              className={`flex items-center justify-between rounded-lg border-l-4 bg-slate-50 py-2 pl-3 pr-3 text-sm ${
                recentBorder[rec.status] ?? "border-l-slate-300"
              }`}
            >
              <div>
                <p className="font-medium text-slate-800">{formatDate(rec.date)}</p>
                <p className="text-xs text-slate-500">
                  {formatTime(rec.checkIn)} → {formatTime(rec.checkOut)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-700">
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
