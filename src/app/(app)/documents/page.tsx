"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Modal from "@/components/ui/Modal";
import Field, { inputClass } from "@/components/ui/Field";
import { formatDate } from "@/lib/format";
import { canManageDocuments, canViewDocument } from "@/lib/hr";
import type { DocumentCategory } from "@/types";

const categories: DocumentCategory[] = [
  "Policy",
  "Offer Letter",
  "Certificate",
  "Contract",
  "Personal",
  "Other",
];

const emptyForm = {
  title: "",
  category: "Policy" as DocumentCategory,
  employeeId: "", // "" = company-wide
  fileName: "",
  fileSizeKb: 200,
};

function formatSize(kb: number): string {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}

export default function DocumentsPage() {
  const { documents, employees, activeEmployee, addDocument, deleteDocument } = useAppData();
  const canManage = canManageDocuments(activeEmployee.role);

  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const visible = useMemo(
    () =>
      documents
        .filter((d) => canViewDocument(activeEmployee, d, employees))
        .filter((d) => categoryFilter === "All" || d.category === categoryFilter)
        .sort((a, b) => (a.uploadedOn < b.uploadedOn ? 1 : -1)),
    [documents, employees, activeEmployee, categoryFilter]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    addDocument({
      title: form.title,
      category: form.category,
      uploadedBy: activeEmployee.id,
      employeeId: form.employeeId || null,
      fileName: form.fileName.trim() || `${form.title.toLowerCase().replace(/\s+/g, "-")}.pdf`,
      fileSizeKb: form.fileSizeKb,
    });
    setForm(emptyForm);
    setOpen(false);
  }

  function handleDownload(title: string) {
    window.alert(`"${title}" — this is a frontend demo, no real file is stored.`);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={`${inputClass} sm:max-w-[200px]`}
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {canManage && (
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + Upload Document
          </button>
        )}
      </div>

      <p className="text-xs text-slate-400">
        Company-wide documents (policies, contracts) are visible to everyone.
        Personal documents (offer letters, certificates) are only visible to
        that employee, their manager, and Admin/HR.
      </p>

      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Document</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Owner</th>
                <th className="px-5 py-3 font-medium">Uploaded</th>
                <th className="px-5 py-3 font-medium">Size</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((doc) => {
                const owner = doc.employeeId
                  ? employees.find((e) => e.id === doc.employeeId)
                  : undefined;
                return (
                  <tr key={doc.id}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">{doc.title}</p>
                      <p className="text-xs text-slate-400">{doc.fileName}</p>
                    </td>
                    <td className="px-5 py-3">
                      <Badge label={doc.category} />
                    </td>
                    <td className="px-5 py-3">
                      {owner ? (
                        <div className="flex items-center gap-2">
                          <Avatar name={owner.name} color={owner.avatarColor} size={24} />
                          <span className="text-slate-700">{owner.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">Company-wide</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(doc.uploadedOn)}</td>
                    <td className="px-5 py-3 text-slate-500">{formatSize(doc.fileSizeKb)}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(doc.title)}
                          className="rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                        >
                          Download
                        </button>
                        {canManage && (
                          <button
                            onClick={() => deleteDocument(doc.id)}
                            className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    No documents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Upload Document">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Title">
            <input
              required
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select
                className={inputClass}
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as DocumentCategory })
                }
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Owner">
              <select
                className={inputClass}
                value={form.employeeId}
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              >
                <option value="">Company-wide</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="File name (optional — demo only, no real upload)">
            <input
              className={inputClass}
              placeholder="e.g. offer-letter.pdf"
              value={form.fileName}
              onChange={(e) => setForm({ ...form, fileName: e.target.value })}
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
              Upload
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
