import type { ReactNode } from "react";
import Card from "./Card";

export default function StatCard({
  label,
  value,
  icon,
  accent = "#6366F1",
  hint,
  trend,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: string;
  hint?: string;
  trend?: { value: string; isPositive: boolean };
}) {
  return (
    <Card className="group relative flex items-start justify-between gap-3 overflow-hidden border border-slate-200/80 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-soft-lg">
      {/* Ambient background glow on hover */}
      <div
        className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-20"
        style={{ backgroundColor: accent }}
      />

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
          {value}
        </p>
        <div className="mt-1 flex items-center gap-2">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                trend.isPositive
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20"
                  : "bg-rose-50 text-rose-700 ring-1 ring-rose-500/20"
              }`}
            >
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{trend.value}</span>
            </span>
          )}
          {hint && (
            <p className="text-xs font-medium text-slate-400 truncate">
              {hint}
            </p>
          )}
        </div>
      </div>

      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-2 shadow-xs"
        style={{
          backgroundColor: `${accent}12`,
          color: accent,
          border: `1px solid ${accent}25`,
        }}
      >
        {icon}
      </div>
    </Card>
  );
}
