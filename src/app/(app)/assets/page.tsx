"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Modal from "@/components/ui/Modal";
import Field, { inputClass } from "@/components/ui/Field";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { canManageAssets } from "@/lib/hr";
import type { Asset, AssetCategory } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories: AssetCategory[] = [
  "Laptop",
  "Desktop",
  "Mobile",
  "Vehicle",
  "Furniture",
  "Accessory",
  "Other",
];

const emptyForm = {
  name: "",
  category: "Laptop" as AssetCategory,
  serialNumber: "",
  purchaseDate: new Date().toISOString().slice(0, 10),
  notes: "",
};

export default function AssetsPage() {
  const { assets, employees, activeEmployee, addAsset, assignAsset, returnAsset, updateAssetStatus } =
    useAppData();
  const canManage = canManageAssets(activeEmployee.role);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [addOpen, setAddOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<Asset | null>(null);
  const [assignEmployeeId, setAssignEmployeeId] = useState("");
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.serialNumber.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [assets, search, statusFilter]);

  const stats = {
    total: assets.length,
    allocated: assets.filter((a) => a.status === "Allocated").length,
    available: assets.filter((a) => a.status === "Available").length,
    inRepair: assets.filter((a) => a.status === "In Repair").length,
  };

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.serialNumber.trim()) return;
    addAsset({ ...form, status: "Available", assignedTo: null, assignedOn: null });
    setForm(emptyForm);
    setAddOpen(false);
  }

  function openAssign(asset: Asset) {
    setAssignTarget(asset);
    setAssignEmployeeId(asset.assignedTo ?? "");
  }

  function handleAssignSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!assignTarget || !assignEmployeeId) return;
    assignAsset(assignTarget.id, assignEmployeeId);
    setAssignTarget(null);
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-slate-500">Total Assets</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{stats.total}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Allocated</p>
          <p className="mt-1 text-2xl font-semibold text-indigo-600">{stats.allocated}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Available</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">{stats.available}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">In Repair</p>
          <p className="mt-1 text-2xl font-semibold text-amber-600">{stats.inRepair}</p>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or serial number…"
            className={`${inputClass} sm:max-w-xs`}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:max-w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Allocated">Allocated</SelectItem>
              <SelectItem value="In Repair">In Repair</SelectItem>
              <SelectItem value="Retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {canManage && (
          <Button onClick={() => setAddOpen(true)}>
            + Add Asset
          </Button>
        )}
      </div>

      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Asset</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Serial</th>
                <th className="px-5 py-3 font-medium">Assigned To</th>
                <th className="px-5 py-3 font-medium">Purchased</th>
                <th className="px-5 py-3 font-medium">Status</th>
                {canManage && <th className="px-5 py-3 font-medium">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((asset) => {
                const owner = asset.assignedTo
                  ? employees.find((e) => e.id === asset.assignedTo)
                  : undefined;
                return (
                  <tr key={asset.id}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">{asset.name}</p>
                      {asset.notes && (
                        <p className="max-w-[220px] truncate text-xs text-slate-400">
                          {asset.notes}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{asset.category}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">
                      {asset.serialNumber}
                    </td>
                    <td className="px-5 py-3">
                      {owner ? (
                        <div className="flex items-center gap-2">
                          <Avatar name={owner.name} color={owner.avatarColor} size={24} />
                          <span className="text-slate-700">{owner.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {formatDate(asset.purchaseDate)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge label={asset.status} />
                    </td>
                    {canManage && (
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-2">
                          {asset.status !== "Retired" && (
                            <button
                              onClick={() => openAssign(asset)}
                              className="rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                            >
                              {asset.assignedTo ? "Reassign" : "Assign"}
                            </button>
                          )}
                          {asset.status === "Allocated" && (
                            <button
                              onClick={() => returnAsset(asset.id)}
                              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                            >
                              Return
                            </button>
                          )}
                          {asset.status !== "In Repair" && asset.status !== "Retired" && (
                            <button
                              onClick={() => updateAssetStatus(asset.id, "In Repair")}
                              className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                            >
                              Send to Repair
                            </button>
                          )}
                          {asset.status === "In Repair" && (
                            <button
                              onClick={() => updateAssetStatus(asset.id, "Available")}
                              className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                            >
                              Mark Repaired
                            </button>
                          )}
                          {asset.status !== "Retired" && (
                            <button
                              onClick={() => updateAssetStatus(asset.id, "Retired")}
                              className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                            >
                              Retire
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="px-5 py-10 text-center text-slate-400">
                    No assets match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {!canManage && (
        <p className="text-xs text-slate-400">
          Viewing as {activeEmployee.name} ({activeEmployee.role}) — asset registry is
          read-only for your role.
        </p>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Asset">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Field label="Asset Name">
            <input
              required
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <Select
                value={form.category}
                onValueChange={(val) =>
                  setForm({ ...form, category: val as AssetCategory })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Serial Number">
              <input
                required
                className={inputClass}
                value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Purchase Date">
            <input
              type="date"
              className={inputClass}
              value={form.purchaseDate}
              onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
            />
          </Field>
          <Field label="Notes (optional)">
            <textarea
              rows={2}
              className={inputClass}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Add Asset
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!assignTarget}
        onClose={() => setAssignTarget(null)}
        title={`Assign ${assignTarget?.name ?? ""}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <Field label="Employee">
            <Select
              value={assignEmployeeId || "none"}
              onValueChange={(val) => setAssignEmployeeId(val === "none" ? "" : val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Select Employee —</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAssignTarget(null)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Assign
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
