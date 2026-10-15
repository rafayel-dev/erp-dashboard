"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home" },
  { href: "/employees", label: "Employees" },
  { href: "/attendance", label: "Attendance" },
  { href: "/leave", label: "Leave" },
  { href: "/projects", label: "Projects" },
  { href: "/payroll", label: "Payroll" },
  { href: "/expenses", label: "Expenses" },
  { href: "/helpdesk", label: "Helpdesk" },
  { href: "/performance", label: "Reviews" },
  { href: "/reports", label: "Reports" },
  { href: "/shifts", label: "Shifts" },
  { href: "/assets", label: "Assets" },
  { href: "/documents", label: "Docs" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-slate-200/80 bg-white/95 px-3.5 py-2.5 backdrop-blur-xl md:hidden scrollbar-none">
      {items.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
              active
                ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-sm shadow-brand-500/30"
                : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
