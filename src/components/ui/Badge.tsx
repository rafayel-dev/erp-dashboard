const styles: Record<string, string> = {
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
  Manager: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  Employee: "bg-slate-100 text-slate-600 ring-slate-600/20",

  Available: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Allocated: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  "In Repair": "bg-amber-50 text-amber-700 ring-amber-600/20",
  Retired: "bg-slate-100 text-slate-500 ring-slate-600/20",

  Draft: "bg-slate-100 text-slate-600 ring-slate-600/20",
  Submitted: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Acknowledged: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",

  Skipped: "bg-slate-100 text-slate-400 ring-slate-600/20",
};

export default function Badge({ label }: { label: string }) {
  const style = styles[label] ?? "bg-slate-100 text-slate-700 ring-slate-600/20";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {label}
    </span>
  );
}
