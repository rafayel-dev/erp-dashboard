import type { ReactNode } from "react";

export default function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-700 tracking-tight">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-2xs transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";
