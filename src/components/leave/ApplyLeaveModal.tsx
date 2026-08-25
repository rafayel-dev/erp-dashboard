"use client";

import { useEffect, useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import Modal from "@/components/ui/Modal";
import Field, { inputClass } from "@/components/ui/Field";
import { toLocalDateStr } from "@/lib/format";
import type { Employee, LeaveType } from "@/types";

function daysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diff + 1, 1);
}

function buildEmptyForm(employeeId: string) {
  const today = toLocalDateStr();
  return {
    employeeId,
    type: "Casual" as LeaveType,
    startDate: today,
    endDate: today,
    reason: "",
  };
}

export default function ApplyLeaveModal({
  open,
  onClose,
  employees,
  defaultEmployeeId,
  canPickEmployee,
}: {
  open: boolean;
  onClose: () => void;
  employees: Employee[];
  defaultEmployeeId: string;
  canPickEmployee: boolean;
}) {
  const { applyLeave } = useAppData();
  const [form, setForm] = useState(buildEmptyForm(defaultEmployeeId));

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => setForm(buildEmptyForm(defaultEmployeeId)), 0);
    return () => clearTimeout(id);
  }, [open, defaultEmployeeId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.employeeId || !form.reason.trim()) return;
    applyLeave({
      employeeId: form.employeeId,
      type: form.type,
      startDate: form.startDate,
      endDate: form.endDate,
      days: daysBetween(form.startDate, form.endDate),
      reason: form.reason,
    });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Apply for Leave">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Employee">
          {canPickEmployee ? (
            <select
              className={inputClass}
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          ) : (
            <div className={`${inputClass} bg-slate-50 text-slate-500`}>
              {employees.find((e) => e.id === form.employeeId)?.name ?? "—"}
            </div>
          )}
        </Field>
        <Field label="Leave Type">
          <select
            className={inputClass}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as LeaveType })}
          >
            <option value="Sick">Sick</option>
            <option value="Casual">Casual</option>
            <option value="Annual">Annual</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Start Date">
            <input
              type="date"
              className={inputClass}
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </Field>
          <Field label="End Date">
            <input
              type="date"
              className={inputClass}
              value={form.endDate}
              min={form.startDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Reason">
          <textarea
            required
            rows={3}
            className={inputClass}
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
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
  );
}
