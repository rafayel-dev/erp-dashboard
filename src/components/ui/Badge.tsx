import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-1 ring-inset",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/10 text-primary ring-primary/20 hover:bg-primary/20",
        secondary:
          "border-transparent bg-surface-2 text-text ring-border hover:bg-border",
        destructive:
          "border-transparent bg-rose-50 text-rose-700 ring-rose-600/20 hover:bg-rose-100",
        outline: "text-text border-border ring-border",
        success:
          "border-transparent bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        warning:
          "border-transparent bg-amber-50 text-amber-700 ring-amber-600/20",
        info: "border-transparent bg-sky-50 text-sky-700 ring-sky-600/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Present: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",

  Late: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  "On Leave": "bg-amber-50 text-amber-700 ring-amber-600/20",

  Absent: "bg-rose-50 text-rose-700 ring-rose-600/20",
  Rejected: "bg-rose-50 text-rose-700 ring-rose-600/20",
  Inactive: "bg-rose-50 text-rose-700 ring-rose-600/20",

  Sick: "bg-sky-50 text-sky-700 ring-sky-600/20",
  Casual: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  Annual: "bg-violet-50 text-violet-700 ring-violet-600/20",
  Unpaid: "bg-slate-100 text-slate-700 ring-slate-600/20",

  Admin: "bg-violet-50 text-violet-700 ring-violet-600/20",
  HR: "bg-sky-50 text-sky-700 ring-sky-600/20",
  Finance: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  "IT Admin": "bg-cyan-50 text-cyan-700 ring-cyan-600/20",
  Manager: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  Employee: "bg-slate-100 text-slate-600 ring-slate-600/20",

  Available: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Allocated: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  "In Repair": "bg-amber-50 text-amber-700 ring-amber-600/20",
  Retired: "bg-slate-100 text-slate-500 ring-slate-600/20",

  Draft: "bg-slate-100 text-slate-600 ring-slate-600/20",
  Submitted: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Acknowledged: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",

  Reimbursed: "bg-teal-50 text-teal-700 ring-teal-600/20",
  Open: "bg-amber-50 text-amber-700 ring-amber-600/20",
  "In Progress": "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",

  Urgent: "bg-rose-50 text-rose-700 ring-rose-600/20",
  High: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Medium: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  Low: "bg-slate-100 text-slate-600 ring-slate-600/20",

  Skipped: "bg-slate-100 text-slate-400 ring-slate-600/20",
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  label?: string;
  withDot?: boolean;
}

const dotColors: Record<string, string> = {
  Active: "bg-emerald-500 animate-pulse",
  Present: "bg-emerald-500 animate-pulse",
  Approved: "bg-emerald-500",
  Paid: "bg-emerald-500",
  Resolved: "bg-emerald-500",
  Available: "bg-emerald-500",

  Pending: "bg-amber-500 animate-pulse",
  "On Leave": "bg-amber-500",
  Late: "bg-amber-500",
  Open: "bg-amber-500 animate-pulse",
  Submitted: "bg-amber-500",

  Absent: "bg-rose-500",
  Rejected: "bg-rose-500",
  Inactive: "bg-rose-500",
  Urgent: "bg-rose-500 animate-pulse",

  "In Progress": "bg-indigo-500 animate-pulse",
  Allocated: "bg-indigo-500",
};

function Badge({ className, variant, label, withDot, children, ...props }: BadgeProps) {
  const text = label || (typeof children === "string" ? children : "");
  const dynamicStyle = text && statusStyles[text] ? statusStyles[text] : "";
  const dotColor = text && dotColors[text];
  const showDot = withDot !== undefined ? withDot : !!dotColor;

  return (
    <div
      className={cn(
        badgeVariants({ variant }),
        dynamicStyle,
        "transition-all duration-150 hover:brightness-95 select-none",
        className
      )}
      {...props}
    >
      {showDot && dotColor && (
        <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full shrink-0", dotColor)} />
      )}
      <span>{label || children}</span>
    </div>
  );
}

export default Badge;
export { Badge, badgeVariants };
