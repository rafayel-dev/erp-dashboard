"use client";

import { useMemo } from "react";
import { useAppData } from "@/context/AppDataContext";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import { formatDate } from "@/lib/format";

const WINDOW_DAYS = 30;

export default function RecentlyJoinedCard() {
  const { employees } = useAppData();

  const recent = useMemo(() => {
    const cutoff = new Date().getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000;
    return employees
      .filter((e) => new Date(e.dateJoined).getTime() >= cutoff)
      .sort((a, b) => (a.dateJoined < b.dateJoined ? 1 : -1));
  }, [employees]);

  return (
    <Card className="flex h-full flex-col">
      <h2 className="text-sm font-semibold text-slate-900">Recently Joined</h2>
      <div className="mt-4 flex-1">
        {recent.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-6 text-center text-sm text-slate-400">
            No recent joiners
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((emp) => (
              <div key={emp.id} className="flex items-center gap-3">
                <Avatar name={emp.name} color={emp.avatarColor} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {emp.name}
                  </p>
                  <p className="text-xs text-slate-400">{emp.position}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">
                  {formatDate(emp.dateJoined)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
