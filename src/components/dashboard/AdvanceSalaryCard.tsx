"use client";

import { useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Field, { inputClass } from "@/components/ui/Field";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/format";
import { Banknote, HandCoins } from "lucide-react";

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
    <Card className="flex h-full flex-col border border-slate-200/80 shadow-soft">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <HandCoins className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Advance Salary</h2>
            <p className="text-[10px] text-slate-400">Emergency payroll draw</p>
          </div>
        </div>
      </div>

      <Button
        onClick={() => setOpen(true)}
        className="mt-3.5 w-full bg-emerald-600 hover:bg-emerald-700"
      >
        <Banknote className="h-4 w-4 mr-1.5" />
        Request Advance
      </Button>

      <div className="mt-4 flex-1 space-y-2 overflow-y-auto text-xs">
        {myRequests.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center py-8 text-center text-slate-400">
            <Banknote className="mb-2 h-8 w-8 text-slate-300 stroke-1" />
            <p className="max-w-[200px] text-[11px] leading-relaxed">
              Need emergency funds before payday? Request an advance from next cycle.
            </p>
          </div>
        )}
        {myRequests.slice(0, 3).map((req) => (
          <div
            key={req.id}
            className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-slate-50/60 px-3 py-2.5 transition-colors hover:bg-slate-50"
          >
            <div>
              <p className="font-bold text-xs text-slate-800">{formatCurrency(req.amount)}</p>
              <p className="text-[11px] text-slate-400">{formatDate(req.requestedOn)}</p>
            </div>
            <Badge label={req.status} />
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Request Salary Advance">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Advance Amount ($ USD)">
            <input
              type="number"
              min="100"
              max="5000"
              required
              className={inputClass}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 500"
            />
          </Field>
          <Field label="Business or Personal Reason">
            <textarea
              required
              rows={3}
              className={inputClass}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State why advance is needed..."
            />
          </Field>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}
