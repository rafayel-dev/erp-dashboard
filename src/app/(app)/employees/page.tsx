"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAppData } from "@/context/AppDataContext";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Modal from "@/components/ui/Modal";
import { inputClass } from "@/components/ui/Field";
import { Button } from "@/components/ui/button";
import EmployeeFormModal, {
  employeeToForm,
  type EmployeeFormState,
} from "@/components/employees/EmployeeFormModal";
import { departments } from "@/lib/mockData";
import { formatDate, toLocalDateStr } from "@/lib/format";
import { canAssignShift, canManageEmployees, findShift } from "@/lib/hr";
import type { Department, Employee } from "@/types";
import { Search, UserPlus, CalendarClock, Edit2, UserCheck, UserX } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const createEmptyForm = (shiftId: string): EmployeeFormState => ({
  name: "",
  email: "",
  phone: "",
  department: departments[0] as Department,
  position: "",
  dateJoined: toLocalDateStr(),
  status: "Active",
  employmentStatus: "Permanent",
  supervisorId: "",
  birthday: "01-01",
  role: "Employee",
  shiftId,
});

export default function EmployeesPage() {
  const { employees, shifts, addEmployee, updateEmployee, assignShift, activeEmployee } =
    useAppData();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("All");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [shiftTarget, setShiftTarget] = useState<Employee | null>(null);
  const [shiftChoice, setShiftChoice] = useState("");
  const canManage = canManageEmployees(activeEmployee.role);

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const matchesSearch =
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase()) ||
        e.employeeCode.toLowerCase().includes(search.toLowerCase());
      const matchesDept = deptFilter === "All" || e.department === deptFilter;
      return matchesSearch && matchesDept;
    });
  }, [employees, search, deptFilter]);

  function handleAdd(data: EmployeeFormState) {
    addEmployee({ ...data, supervisorId: data.supervisorId || null });
    setAddOpen(false);
  }

  function handleEdit(data: EmployeeFormState) {
    if (!editTarget) return;
    updateEmployee(editTarget.id, { ...data, supervisorId: data.supervisorId || null });
    setEditTarget(null);
  }

  function toggleActive(emp: Employee) {
    updateEmployee(emp.id, { status: emp.status === "Inactive" ? "Active" : "Inactive" });
  }

  function openShiftModal(emp: Employee) {
    setShiftTarget(emp);
    setShiftChoice(emp.shiftId);
  }

  function handleShiftSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shiftTarget) return;
    assignShift(shiftTarget.id, shiftChoice);
    setShiftTarget(null);
  }

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or ID…"
              className={`${inputClass} pl-9`}
            />
          </div>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="sm:max-w-[190px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {canManage && (
          <Button onClick={() => setAddOpen(true)} className="w-max">
            <UserPlus className="h-4 w-4 mr-1.5" />
            Add Employee
          </Button>
        )}
      </div>

      {/* Employees Table */}
      <Card padded={false} className="border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3 font-semibold">Employee</th>
                <th className="px-5 py-3 font-semibold">Department</th>
                <th className="px-5 py-3 font-semibold">Position</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Shift</th>
                <th className="px-5 py-3 font-semibold">Joined</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((emp) => {
                const shift = findShift(shifts, emp.shiftId);
                const canEditThis = canManage;
                const canShiftThis = !canManage && canAssignShift(activeEmployee, emp);
                return (
                  <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/employees/${emp.id}`}
                        className="flex items-center gap-2.5 group"
                      >
                        <Avatar name={emp.name} color={emp.avatarColor} size={32} />
                        <div>
                          <p className="font-semibold text-xs text-slate-800 group-hover:text-brand-600 transition-colors">
                            {emp.name}
                          </p>
                          <p className="text-[10px] text-slate-400">{emp.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 font-medium">{emp.department}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 font-medium">{emp.position}</td>
                    <td className="px-5 py-3.5">
                      <Badge label={emp.role} />
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 font-medium">{shift.name}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 font-medium">
                      {formatDate(emp.dateJoined)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge label={emp.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      {canEditThis ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            onClick={() => setEditTarget(emp)}
                            className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors shadow-2xs"
                          >
                            <Edit2 className="h-3 w-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => toggleActive(emp)}
                            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors shadow-2xs ${
                              emp.status === "Inactive"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                            }`}
                          >
                            {emp.status === "Inactive" ? (
                              <>
                                <UserCheck className="h-3 w-3" />
                                Activate
                              </>
                            ) : (
                              <>
                                <UserX className="h-3 w-3" />
                                Deactivate
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => openShiftModal(emp)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors shadow-2xs"
                          >
                            <CalendarClock className="h-3 w-3 text-slate-400" />
                            Shift
                          </button>
                        </div>
                      ) : canShiftThis ? (
                        <button
                          onClick={() => openShiftModal(emp)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors shadow-2xs"
                        >
                          <CalendarClock className="h-3 w-3 text-slate-400" />
                          Assign Shift
                        </button>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-xs text-slate-400">
                    No employees found matching &ldquo;{search}&rdquo;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Employee Modal */}
      {addOpen && (
        <EmployeeFormModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onSubmit={handleAdd}
          title="Add New Employee"
          submitLabel="Add Employee"
          initial={createEmptyForm(shifts[0]?.id ?? "")}
          employees={employees}
          shifts={shifts}
        />
      )}

      {/* Edit Employee Modal */}
      {editTarget && (
        <EmployeeFormModal
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={handleEdit}
          title={`Edit ${editTarget.name}`}
          submitLabel="Save Changes"
          initial={employeeToForm(editTarget)}
          employees={employees}
          shifts={shifts}
          excludeEmployeeId={editTarget.id}
        />
      )}

      {/* Reassign Shift Modal */}
      {shiftTarget && (
        <Modal
          open={!!shiftTarget}
          onClose={() => setShiftTarget(null)}
          title={`Reassign Shift — ${shiftTarget.name}`}
        >
          <form onSubmit={handleShiftSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Select Shift Schedule
              </label>
              <Select value={shiftChoice} onValueChange={(val) => setShiftChoice(val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select shift schedule" />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.startTime} – {s.endTime})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShiftTarget(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Shift</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
