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
import { canManageDocuments, canViewDocument } from "@/lib/hr";
import type { DocumentCategory } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="sm:max-w-[190px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {canManage && (
          <Button onClick={() => setOpen(true)}>
            + Upload Document
          </Button>
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
              <Select
                value={form.category}
                onValueChange={(val) =>
                  setForm({ ...form, category: val as DocumentCategory })
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
            <Field label="Owner">
              <Select
                value={form.employeeId || "company-wide"}
                onValueChange={(val) =>
                  setForm({ ...form, employeeId: val === "company-wide" ? "" : val })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company-wide">Company-wide</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Upload
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
