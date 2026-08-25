"use client";

import { useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import Field, { inputClass } from "@/components/ui/Field";
import { formatShiftTime } from "@/lib/format";
import { canManageShifts } from "@/lib/hr";
import type { Shift } from "@/types";

const emptyForm = { name: "", startTime: "09:00", endTime: "17:00", graceMinutes: 15 };

export default function ShiftsPage() {
  const { shifts, employees, activeEmployee, addShift, updateShift, deleteShift } = useAppData();
  const canManage = canManageShifts(activeEmployee.role);

  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Shift | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  function headcountFor(shiftId: string): number {
    return employees.filter((e) => e.shiftId === shiftId).length;
  }

  function openCreate() {
    setForm(emptyForm);
    setError("");
    setOpen(true);
  }

  function openEdit(shift: Shift) {
    setEditTarget(shift);
    setForm({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      graceMinutes: shift.graceMinutes,
    });
    setError("");
  }

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    addShift(form);
    setOpen(false);
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget || !form.name.trim()) return;
    updateShift(editTarget.id, form);
    setEditTarget(null);
  }

  function handleDelete(shift: Shift) {
    const inUse = headcountFor(shift.id);
    if (inUse > 0) {
      setError(
        `Can't delete "${shift.name}" — ${inUse} employee${inUse > 1 ? "s are" : " is"} still on it. Reassign them first.`
      );
      return;
    }
    if (!window.confirm(`Delete the "${shift.name}" shift?`)) return;
    deleteShift(shift.id);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {canManage
            ? "Shifts assigned here are used to work out who's late when they check in."
            : `Viewing as ${activeEmployee.name} (${activeEmployee.role}) — shifts are read-only for your role.`}
        </p>
        {canManage && (
          <button
            onClick={openCreate}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + Add Shift
          </button>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shifts.map((shift) => (
          <Card key={shift.id} className="flex flex-col">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-900">{shift.name}</p>
                <p className="text-sm text-slate-500">
                  {formatShiftTime(shift.startTime)} – {formatShiftTime(shift.endTime)}
                </p>
              </div>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600">
                {headcountFor(shift.id)} {headcountFor(shift.id) === 1 ? "person" : "people"}
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              {shift.graceMinutes} min grace period before a check-in counts as Late.
            </p>
            {canManage && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openEdit(shift)}
                  className="rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(shift)}
                  className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                >
                  Delete
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Shift">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Field label="Shift Name">
            <input
              required
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Night Shift"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Time">
              <input
                type="time"
                className={inputClass}
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />
            </Field>
            <Field label="End Time">
              <input
                type="time"
                className={inputClass}
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Grace Period (minutes)">
            <input
              type="number"
              min={0}
              max={120}
              className={inputClass}
              value={form.graceMinutes}
              onChange={(e) => setForm({ ...form, graceMinutes: Number(e.target.value) })}
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
              Add Shift
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={`Edit ${editTarget?.name ?? ""}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Field label="Shift Name">
            <input
              required
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Time">
              <input
                type="time"
                className={inputClass}
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />
            </Field>
            <Field label="End Time">
              <input
                type="time"
                className={inputClass}
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Grace Period (minutes)">
            <input
              type="number"
              min={0}
              max={120}
              className={inputClass}
              value={form.graceMinutes}
              onChange={(e) => setForm({ ...form, graceMinutes: Number(e.target.value) })}
            />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditTarget(null)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
