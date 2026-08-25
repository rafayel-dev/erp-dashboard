"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAppData } from "@/context/AppDataContext";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Modal from "@/components/ui/Modal";
import { inputClass } from "@/components/ui/Field";
import EmployeeFormModal, {
  employeeToForm,
  type EmployeeFormState,
} from "@/components/employees/EmployeeFormModal";
import { departments } from "@/lib/mockData";
import { formatDate, toLocalDateStr } from "@/lib/format";
import { canAssignShift, canManageEmployees, findShift } from "@/lib/hr";
import type { Department, Employee } from "@/types";

const emptyForm: Omit<EmployeeFormState, "shiftId"> = {
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
};

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
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or code…"
            className={`${inputClass} sm:max-w-xs`}
          />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className={`${inputClass} sm:max-w-[200px]`}
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        {canManage && (
          <button
            onClick={() => setAddOpen(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + Add Employee
          </button>
        )}
      </div>

      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Position</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Shift</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((emp) => {
                const shift = findShift(shifts, emp.shiftId);
                const canEditThis = canManage;
                const canShiftThis = !canManage && canAssignShift(activeEmployee, emp);
                return (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link
                        href={`/employees/${emp.id}`}
                        className="flex items-center gap-2.5"
                      >
                        <Avatar name={emp.name} color={emp.avatarColor} size={30} />
                        <div>
                          <p className="font-medium text-slate-800">{emp.name}</p>
                          <p className="text-xs text-slate-400">{emp.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{emp.department}</td>
                    <td className="px-5 py-3 text-slate-500">{emp.position}</td>
                    <td className="px-5 py-3">
                      <Badge label={emp.role} />
                    </td>
                    <td className="px-5 py-3 text-slate-500">{shift.name}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {formatDate(emp.dateJoined)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge label={emp.status} />
                    </td>
                    <td className="px-5 py-3">
                      {canEditThis ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setEditTarget(emp)}
                            className="rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleActive(emp)}
                            className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${
                              emp.status === "Inactive"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                            }`}
                          >
                            {emp.status === "Inactive" ? "Reactivate" : "Deactivate"}
                          </button>
                        </div>
                      ) : canShiftThis ? (
                        <button
                          onClick={() => openShiftModal(emp)}
                          className="rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                        >
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
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-400">
                    No employees match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {!canManage && (
        <p className="text-xs text-slate-400">
          Viewing as {activeEmployee.name} ({activeEmployee.role}) —{" "}
          {activeEmployee.role === "Manager"
            ? "you can assign shifts for your direct reports; other fields are managed by HR."
            : "directory is read-only for your role."}
        </p>
      )}

      <EmployeeFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Employee"
        submitLabel="Add Employee"
        initial={{ ...emptyForm, shiftId: shifts[0]?.id ?? "" }}
        employees={employees}
        shifts={shifts}
        onSubmit={handleAdd}
      />

      {editTarget && (
        <EmployeeFormModal
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          title={`Edit ${editTarget.name}`}
          submitLabel="Save Changes"
          initial={employeeToForm(editTarget)}
          employees={employees}
          shifts={shifts}
          excludeEmployeeId={editTarget.id}
          onSubmit={handleEdit}
        />
      )}

      <Modal
        open={!!shiftTarget}
        onClose={() => setShiftTarget(null)}
        title={`Assign Shift — ${shiftTarget?.name ?? ""}`}
      >
        <form onSubmit={handleShiftSubmit} className="space-y-4">
          <select
            className={inputClass}
            value={shiftChoice}
            onChange={(e) => setShiftChoice(e.target.value)}
          >
            {shifts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.startTime}–{s.endTime})
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShiftTarget(null)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
