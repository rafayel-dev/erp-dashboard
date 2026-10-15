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
import { canManageHelpdesk, visibleScope } from "@/lib/hr";
import type { TicketCategory, TicketPriority, SupportTicket } from "@/types";
import {
  LifeBuoy,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  RotateCcw,
  Check,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories: TicketCategory[] = [
  "IT & Hardware",
  "Software & Access",
  "HR & Workplace",
  "Payroll & Benefits",
  "Facilities",
];

const priorities: TicketPriority[] = ["Low", "Medium", "High", "Urgent"];

const emptyTicket = {
  subject: "",
  category: "IT & Hardware" as TicketCategory,
  priority: "Medium" as TicketPriority,
  description: "",
};

export default function HelpdeskPage() {
  const { tickets, employees, activeEmployee, addTicket, updateTicketStatus } = useAppData();
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [form, setForm] = useState(emptyTicket);

  const canManage = canManageHelpdesk(activeEmployee.role);

  const scopeIds = useMemo(
    () => new Set(visibleScope(activeEmployee, employees).map((e) => e.id)),
    [activeEmployee, employees]
  );

  const visibleTickets = useMemo(() => {
    return tickets
      .filter((tkt) => scopeIds.has(tkt.employeeId))
      .filter((tkt) => statusFilter === "All" || tkt.status === statusFilter)
      .filter((tkt) => categoryFilter === "All" || tkt.category === categoryFilter)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [tickets, scopeIds, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    return {
      total: visibleTickets.length,
      open: visibleTickets.filter((t) => t.status === "Open").length,
      inProgress: visibleTickets.filter((t) => t.status === "In Progress").length,
      resolved: visibleTickets.filter((t) => t.status === "Resolved").length,
    };
  }, [visibleTickets]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) return;

    addTicket({
      employeeId: activeEmployee.id,
      subject: form.subject,
      category: form.category,
      priority: form.priority,
      description: form.description,
    });

    setForm(emptyTicket);
    setIsModalOpen(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Internal Helpdesk &amp; Support
          </h2>
          <p className="text-xs font-medium text-slate-500">
            Submit IT hardware issues, software access requests, HR queries, and office facility tickets.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="w-max">
          <Plus className="h-4 w-4 mr-1.5" />
          Raise Ticket
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-slate-200/80 p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Tickets</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <LifeBuoy className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{stats.total}</p>
          <p className="mt-1 text-xs text-slate-400">All submitted requests</p>
        </Card>

        <Card className="border border-slate-200/80 p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Open Tickets</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-amber-600">{stats.open}</p>
          <p className="mt-1 text-xs text-slate-400">Awaiting triage &amp; pickup</p>
        </Card>

        <Card className="border border-slate-200/80 p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">In Progress</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-brand-600">{stats.inProgress}</p>
          <p className="mt-1 text-xs text-slate-400">Being addressed by staff</p>
        </Card>

        <Card className="border border-slate-200/80 p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Resolved</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600">{stats.resolved}</p>
          <p className="mt-1 text-xs text-slate-400">Successfully closed out</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:max-w-[170px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="sm:max-w-[190px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-xs font-medium text-slate-400">
          Viewing as <span className="font-semibold text-slate-700">{activeEmployee.name}</span> ({activeEmployee.role})
        </p>
      </div>

      {/* Tickets Table */}
      <Card padded={false} className="border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3 font-semibold">Ticket ID</th>
                <th className="px-5 py-3 font-semibold">Requester</th>
                <th className="px-5 py-3 font-semibold">Subject &amp; Category</th>
                <th className="px-5 py-3 font-semibold">Priority</th>
                <th className="px-5 py-3 font-semibold">Raised Date</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleTickets.map((tkt) => {
                const requester = employees.find((e) => e.id === tkt.employeeId);
                if (!requester) return null;

                return (
                  <tr key={tkt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-700">
                      {tkt.ticketCode}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={requester.name} color={requester.avatarColor} size={28} />
                        <div>
                          <p className="font-semibold text-xs text-slate-800 leading-tight">{requester.name}</p>
                          <p className="text-[10px] text-slate-400">{requester.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 max-w-sm">
                      <button
                        onClick={() => setSelectedTicket(tkt)}
                        className="text-left font-semibold text-xs text-brand-600 hover:text-brand-800 hover:underline line-clamp-1"
                      >
                        {tkt.subject}
                      </button>
                      <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 mt-0.5 border border-slate-200/50">
                        {tkt.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge label={tkt.priority} />
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 font-medium">
                      {formatDate(tkt.createdAt.split("T")[0])}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge label={tkt.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {tkt.status === "Open" && (
                          <button
                            onClick={() => updateTicketStatus(tkt.id, "In Progress")}
                            className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors shadow-2xs"
                          >
                            <Clock className="h-3 w-3" />
                            Start Work
                          </button>
                        )}
                        {tkt.status === "In Progress" && (
                          <button
                            onClick={() => updateTicketStatus(tkt.id, "Resolved")}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-2xs"
                          >
                            <Check className="h-3 w-3" />
                            Resolve
                          </button>
                        )}
                        {tkt.status === "Resolved" && (
                          <button
                            onClick={() => updateTicketStatus(tkt.id, "Open")}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors shadow-2xs"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Reopen
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedTicket(tkt)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors shadow-2xs"
                        >
                          <Eye className="h-3 w-3 text-slate-400" />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {visibleTickets.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-xs text-slate-400">
                    No support tickets match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Ticket Details Modal */}
      <Modal
        open={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket ? `${selectedTicket.ticketCode} — Support Ticket Details` : ""}
      >
        {selectedTicket && (
          <div className="space-y-4 text-sm">
            <div className="flex items-start justify-between rounded-xl bg-slate-50 p-4 border border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {selectedTicket.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{selectedTicket.subject}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge label={selectedTicket.priority} />
                <Badge label={selectedTicket.status} />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Issue Description
              </p>
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed shadow-2xs">
                {selectedTicket.description}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs border-t border-slate-100 pt-3">
              <div>
                <span className="text-slate-400 block font-medium text-[11px]">Submitted On</span>
                <span className="text-slate-800 font-semibold mt-0.5 block">
                  {formatDate(selectedTicket.createdAt.split("T")[0])}
                </span>
              </div>
              {selectedTicket.resolvedAt && (
                <div>
                  <span className="text-slate-400 block font-medium text-[11px]">Resolved On</span>
                  <span className="text-emerald-700 font-semibold mt-0.5 block">
                    {formatDate(selectedTicket.resolvedAt.split("T")[0])}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                {selectedTicket.status === "Open" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      updateTicketStatus(selectedTicket.id, "In Progress");
                      setSelectedTicket(null);
                    }}
                  >
                    Set In Progress
                  </Button>
                )}
                {selectedTicket.status === "In Progress" && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      updateTicketStatus(selectedTicket.id, "Resolved");
                      setSelectedTicket(null);
                    }}
                  >
                    Mark Resolved
                  </Button>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedTicket(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Raise Ticket Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Raise Support Ticket">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Subject / Brief Summary">
            <input
              required
              placeholder="e.g. Broken laptop charger or VPN connection failing"
              className={inputClass}
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Category">
              <Select
                value={form.category}
                onValueChange={(val) => setForm({ ...form, category: val as TicketCategory })}
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

            <Field label="Priority Level">
              <Select
                value={form.priority}
                onValueChange={(val) => setForm({ ...form, priority: val as TicketPriority })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Detailed Description & Steps to Reproduce">
            <textarea
              required
              rows={4}
              placeholder="Explain the issue thoroughly so support engineers or HR can address it quickly..."
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Submit Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
