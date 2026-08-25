"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home" },
  { href: "/employees", label: "Employees" },
  { href: "/attendance", label: "Attendance" },
  { href: "/shifts", label: "Shifts" },
  { href: "/leave", label: "Leave" },
  { href: "/payroll", label: "Payroll" },
  { href: "/assets", label: "Assets" },
  { href: "/documents", label: "Documents" },
  { href: "/performance", label: "Performance" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 md:hidden">
      {items.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              active
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
