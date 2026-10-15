"use client";

import { useEffect, useState } from "react";
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
            <Select
              value={form.department}
              onValueChange={(val) => setForm({ ...form, department: val as Department })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Select
              value={form.role}
              onValueChange={(val) => setForm({ ...form, role: val as Role })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Employee">Employee</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="IT Admin">IT Admin</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Reports To">
            <Select
              value={form.supervisorId || "none"}
              onValueChange={(val) =>
                setForm({ ...form, supervisorId: val === "none" ? "" : val })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Supervisor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {supervisorChoices.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Shift">
            <Select
              value={form.shiftId}
              onValueChange={(val) => setForm({ ...form, shiftId: val })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Shift" />
              </SelectTrigger>
              <SelectContent>
                {shifts.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.startTime}–{s.endTime})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onValueChange={(val) => setForm({ ...form, status: val as EmployeeStatus })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
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
            <Select
              value={form.employmentStatus}
              onValueChange={(val) =>
                setForm({ ...form, employmentStatus: val as EmploymentStatus })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Employment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Permanent">Permanent</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Probation">Probation</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Birthday">
            <input
              type="date"
              className={inputClass}
              value={form.birthday ? `2000-${form.birthday}` : ""}
              onChange={(e) => setForm({ ...form, birthday: e.target.value ? e.target.value.slice(5) : "01-01" })}
            />
          </Field>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </Modal>
  );
}
