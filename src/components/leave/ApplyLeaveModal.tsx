"use client";

import { useEffect, useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import Modal from "@/components/ui/Modal";
import Field, { inputClass } from "@/components/ui/Field";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    if (!form.employeeId || !form.reason.trim() || form.startDate > form.endDate) return;
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
            <Select
              value={form.employeeId}
              onValueChange={(val) => setForm({ ...form, employeeId: val })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className={`${inputClass} bg-slate-50 text-slate-500`}>
              {employees.find((e) => e.id === form.employeeId)?.name ?? "—"}
            </div>
          )}
        </Field>
        <Field label="Leave Type">
          <Select
            value={form.type}
            onValueChange={(val) => setForm({ ...form, type: val as LeaveType })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Leave Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sick">Sick</SelectItem>
              <SelectItem value="Casual">Casual</SelectItem>
              <SelectItem value="Annual">Annual</SelectItem>
              <SelectItem value="Unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Start Date">
            <input
              type="date"
              className={inputClass}
              value={form.startDate}
              onChange={(e) => {
                const newStart = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  startDate: newStart,
                  endDate: prev.endDate < newStart ? newStart : prev.endDate,
                }));
              }}
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
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Submit Request
          </Button>
        </div>
      </form>
    </Modal>
  );
}
