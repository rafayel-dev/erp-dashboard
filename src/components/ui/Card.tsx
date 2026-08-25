import type { ReactNode } from "react";

export default function Card({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-900/5 ${
        padded ? "p-6" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
