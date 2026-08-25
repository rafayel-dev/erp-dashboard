"use client";

import { useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Field, { inputClass } from "@/components/ui/Field";
import { formatCurrency, formatDate } from "@/lib/format";

export default function AdvanceSalaryCard({ employeeId }: { employeeId: string }) {
  const { advanceRequests, requestAdvance } = useAppData();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const myRequests = advanceRequests
    .filter((a) => a.employeeId === employeeId)
    .sort((a, b) => (a.requestedOn < b.requestedOn ? 1 : -1));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0 || !reason.trim()) return;
    requestAdvance({ employeeId, amount: amt, reason });
    setAmount("");
    setReason("");
    setOpen(false);
  }

  return (
    <Card className="flex h-full flex-col">
      <h2 className="text-sm font-semibold text-slate-900">Advance Salary</h2>

      <button
        onClick={() => setOpen(true)}
        className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        Request Advance
      </button>

      <div className="mt-4 flex-1 space-y-2 overflow-y-auto text-xs">
        {myRequests.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center py-6 text-center text-slate-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="mb-2 h-8 w-8 text-slate-300">
              <rect x="2" y="6" width="20" height="13" rx="2" />
              <circle cx="12" cy="12.5" r="2.5" />
            </svg>
            Need funds before payday? Request an advance from your salary.
          </div>
        )}
        {myRequests.slice(0, 3).map((req) => (
          <div key={req.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
            <div>
              <p className="font-medium text-slate-700">{formatCurrency(req.amount)}</p>
              <p className="text-slate-400">{formatDate(req.requestedOn)}</p>
            </div>
            <Badge label={req.status} />
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Request Salary Advance">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Amount (USD)">
            <input
              required
              type="number"
              min={1}
              className={inputClass}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
          <Field label="Reason">
            <textarea
              required
              rows={3}
              className={inputClass}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}
