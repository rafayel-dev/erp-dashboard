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
      <span className="mb-1 block text-sm font-medium text-text">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-text shadow-sm transition-colors placeholder:text-text-faint focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring";
