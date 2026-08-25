import type { ReactNode } from "react";
import Card from "./Card";

export default function StatCard({
  label,
  value,
  icon,
  accent = "#6366F1",
  hint,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: string;
  hint?: string;
}) {
  return (
    <Card className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1.5 text-2xl font-semibold text-slate-900">{value}</p>
        {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      </div>
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${accent}1A`, color: accent }}
      >
        {icon}
      </div>
    </Card>
  );
}
