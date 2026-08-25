"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import { useAppData } from "@/context/AppDataContext";
import { formatDate } from "@/lib/format";

export default function CompanyPolicyCard() {
  const { documents } = useAppData();
  const policies = documents
    .filter((d) => d.employeeId === null)
    .sort((a, b) => (a.uploadedOn < b.uploadedOn ? 1 : -1))
    .slice(0, 4);

  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Company Policy</h2>
        <Link
          href="/documents"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
        >
          View all
        </Link>
      </div>

      {policies.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="mb-3 h-9 w-9 text-slate-300"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
          </svg>
          <p className="text-sm font-medium text-slate-600">No published policies yet</p>
          <p className="mt-1 text-xs text-slate-400">
            Company policies and official regulations will appear here when available.
          </p>
        </div>
      ) : (
        <div className="mt-4 flex-1 space-y-2 overflow-y-auto">
          {policies.map((doc) => (
            <div key={doc.id} className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="truncate text-sm font-medium text-slate-700">{doc.title}</p>
              <p className="text-xs text-slate-400">{formatDate(doc.uploadedOn)}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
