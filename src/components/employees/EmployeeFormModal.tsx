"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Field, { inputClass } from "@/components/ui/Field";
import { departments } from "@/lib/mockData";
import type {
  Department,
  Employee,
  EmployeeStatus,
  EmploymentStatus,
  Role,
  Shift,
} from "@/types";

export interface EmployeeFormState {
  name: string;
  email: string;
  phone: string;
  department: Department;
  position: string;
  dateJoined: string;
  status: EmployeeStatus;
  employmentStatus: EmploymentStatus;
  supervisorId: string;
  birthday: string;
  role: Role;
  shiftId: string;
}

export function employeeToForm(emp: Employee): EmployeeFormState {
  return {
    name: emp.name,
    email: emp.email,
    phone: emp.phone,
    department: emp.department,
    position: emp.position,
    dateJoined: emp.dateJoined,
    status: emp.status,
    employmentStatus: emp.employmentStatus,
    supervisorId: emp.supervisorId ?? "",
    birthday: emp.birthday,
    role: emp.role,
    shiftId: emp.shiftId,
  };
}

export default function EmployeeFormModal({
  open,
  onClose,
  title,
  submitLabel,
  initial,
  employees,
  shifts,
  excludeEmployeeId,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  submitLabel: string;
  initial: EmployeeFormState;
  employees: Employee[];
  shifts: Shift[];
  /** Don't offer this employee as their own supervisor (edit mode). */
  excludeEmployeeId?: string;
  onSubmit: (data: EmployeeFormState) => void;
}) {
  const [form, setForm] = useState(initial);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => setForm(initial), 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.position.trim()) return;
    onSubmit(form);
  }

  const supervisorChoices = employees.filter((e) => e.id !== excludeEmployeeId);

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full Name">
          <input
            required
            className={inputClass}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email">
            <input
              required
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="Phone">
            <input
              className={inputClass}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Department">
            <select
              className={inputClass}
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value as Department })}
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Position">
            <input
              required
              className={inputClass}
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Role">
            <select
              className={inputClass}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
            >
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
              <option value="HR">HR</option>
              <option value="Admin">Admin</option>
            </select>
          </Field>
          <Field label="Reports To">
            <select
              className={inputClass}
              value={form.supervisorId}
              onChange={(e) => setForm({ ...form, supervisorId: e.target.value })}
            >
              <option value="">— None —</option>
              {supervisorChoices.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Shift">
            <select
              className={inputClass}
              value={form.shiftId}
              onChange={(e) => setForm({ ...form, shiftId: e.target.value })}
            >
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.startTime}–{s.endTime})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as EmployeeStatus })}
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Date Joined">
            <input
              type="date"
              className={inputClass}
              value={form.dateJoined}
              onChange={(e) => setForm({ ...form, dateJoined: e.target.value })}
            />
          </Field>
          <Field label="Employment">
            <select
              className={inputClass}
              value={form.employmentStatus}
              onChange={(e) =>
                setForm({ ...form, employmentStatus: e.target.value as EmploymentStatus })
              }
            >
              <option value="Permanent">Permanent</option>
              <option value="Contract">Contract</option>
              <option value="Probation">Probation</option>
            </select>
          </Field>
          <Field label="Birthday">
            <input
              type="date"
              className={inputClass}
              value={`2000-${form.birthday}`}
              onChange={(e) => setForm({ ...form, birthday: e.target.value.slice(5) })}
            />
          </Field>
        </div>
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
            {submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
