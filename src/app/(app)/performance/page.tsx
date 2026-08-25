"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Modal from "@/components/ui/Modal";
import Field, { inputClass } from "@/components/ui/Field";
import { canCreateReviewFor, canViewReview } from "@/lib/hr";
import type { KpiItem, PerformanceReview } from "@/types";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-500" aria-label={`${rating} out of 5`}>
      {"★".repeat(Math.round(rating))}
      <span className="text-slate-200">{"★".repeat(5 - Math.round(rating))}</span>
    </span>
  );
}

const emptyKpi = (): KpiItem => ({ title: "", target: "", achieved: "", score: 3 });

export default function PerformancePage() {
  const {
    employees,
    performanceReviews,
    activeEmployee,
    addReview,
    setEmployeeComments,
  } = useAppData();

  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<PerformanceReview | null>(null);
  const [employeeComment, setEmployeeComment] = useState("");

  const [targetEmployeeId, setTargetEmployeeId] = useState("");
  const [period, setPeriod] = useState("2026 Q3");
  const [managerComments, setManagerComments] = useState("");
  const [kpis, setKpis] = useState<KpiItem[]>([emptyKpi()]);

  const assignableEmployees = useMemo(
    () => employees.filter((e) => canCreateReviewFor(activeEmployee, e)),
    [employees, activeEmployee]
  );
  const canCreate = assignableEmployees.length > 0;

  const visible = useMemo(
    () =>
      performanceReviews
        .filter((r) => canViewReview(activeEmployee, r, employees))
        .sort((a, b) => (a.createdOn < b.createdOn ? 1 : -1)),
    [performanceReviews, employees, activeEmployee]
  );

  function openCreate() {
    setTargetEmployeeId(assignableEmployees[0]?.id ?? "");
    setPeriod("2026 Q3");
    setManagerComments("");
    setKpis([emptyKpi()]);
    setOpen(true);
  }

  function updateKpi(index: number, patch: Partial<KpiItem>) {
    setKpis((prev) => prev.map((k, i) => (i === index ? { ...k, ...patch } : k)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!targetEmployeeId || kpis.length === 0) return;
    addReview({
      employeeId: targetEmployeeId,
      reviewerId: activeEmployee.id,
      period,
      kpis,
      managerComments,
      employeeComments: "",
      status: "Submitted",
    });
    setOpen(false);
  }

  function openDetail(review: PerformanceReview) {
    setDetail(review);
    setEmployeeComment(review.employeeComments);
  }

  function handleAcknowledge() {
    if (!detail) return;
    setEmployeeComments(detail.id, employeeComment);
    setDetail(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">
          Viewing as {activeEmployee.name} ({activeEmployee.role}) —{" "}
          {canCreate
            ? "you can create reviews for your team."
            : "showing reviews about you."}
        </p>
        {canCreate && (
          <button
            onClick={openCreate}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + New Review
          </button>
        )}
      </div>

      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-5 py-3 font-medium">Reviewer</th>
                <th className="px-5 py-3 font-medium">Period</th>
                <th className="px-5 py-3 font-medium">Rating</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((review) => {
                const emp = employees.find((e) => e.id === review.employeeId);
                const reviewer = employees.find((e) => e.id === review.reviewerId);
                if (!emp) return null;
                return (
                  <tr key={review.id}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={emp.name} color={emp.avatarColor} size={28} />
                        <span className="font-medium text-slate-800">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{reviewer?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-slate-500">{review.period}</td>
                    <td className="px-5 py-3">
                      <Stars rating={review.overallRating} />
                    </td>
                    <td className="px-5 py-3">
                      <Badge label={review.status} />
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => openDetail(review)}
                        className="rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    No performance reviews found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create review */}
      <Modal open={open} onClose={() => setOpen(false)} title="New Performance Review">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Employee">
              <select
                className={inputClass}
                value={targetEmployeeId}
                onChange={(e) => setTargetEmployeeId(e.target.value)}
              >
                {assignableEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Period">
              <input
                required
                className={inputClass}
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="e.g. 2026 Q3"
              />
            </Field>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">KPIs</span>
              <button
                type="button"
                onClick={() => setKpis((prev) => [...prev, emptyKpi()])}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                + Add KPI
              </button>
            </div>
            <div className="space-y-3">
              {kpis.map((kpi, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 rounded-lg bg-slate-50 p-2">
                  <input
                    required
                    placeholder="KPI title"
                    className={`${inputClass} col-span-4`}
                    value={kpi.title}
                    onChange={(e) => updateKpi(i, { title: e.target.value })}
                  />
                  <input
                    placeholder="Target"
                    className={`${inputClass} col-span-3`}
                    value={kpi.target}
                    onChange={(e) => updateKpi(i, { target: e.target.value })}
                  />
                  <input
                    placeholder="Achieved"
                    className={`${inputClass} col-span-3`}
                    value={kpi.achieved}
                    onChange={(e) => updateKpi(i, { achieved: e.target.value })}
                  />
                  <select
                    className={`${inputClass} col-span-1`}
                    value={kpi.score}
                    onChange={(e) => updateKpi(i, { score: Number(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setKpis((prev) => prev.filter((_, idx) => idx !== i))}
                    disabled={kpis.length === 1}
                    className="col-span-1 rounded-md text-xs text-rose-500 hover:text-rose-700 disabled:opacity-30"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Field label="Manager Comments">
            <textarea
              rows={3}
              className={inputClass}
              value={managerComments}
              onChange={(e) => setManagerComments(e.target.value)}
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
              Submit Review
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail / acknowledge */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Performance Review">
        {detail && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">
                  {employees.find((e) => e.id === detail.employeeId)?.name}
                </p>
                <p className="text-xs text-slate-400">
                  {detail.period} · Reviewed by{" "}
                  {employees.find((e) => e.id === detail.reviewerId)?.name}
                </p>
              </div>
              <Badge label={detail.status} />
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 uppercase tracking-wide text-slate-400">
                    <th className="px-3 py-2 font-medium">KPI</th>
                    <th className="px-3 py-2 font-medium">Target</th>
                    <th className="px-3 py-2 font-medium">Achieved</th>
                    <th className="px-3 py-2 font-medium">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detail.kpis.map((kpi, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 font-medium text-slate-700">{kpi.title}</td>
                      <td className="px-3 py-2 text-slate-500">{kpi.target}</td>
                      <td className="px-3 py-2 text-slate-500">{kpi.achieved}</td>
                      <td className="px-3 py-2">
                        <Stars rating={kpi.score} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Overall
              </span>
              <Stars rating={detail.overallRating} />
              <span className="text-slate-500">({detail.overallRating}/5)</span>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                Manager Comments
              </p>
              <p className="rounded-lg bg-slate-50 p-3 text-slate-600">
                {detail.managerComments || "—"}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                Employee Comments
              </p>
              {activeEmployee.id === detail.employeeId && detail.status !== "Draft" ? (
                <textarea
                  rows={2}
                  className={inputClass}
                  value={employeeComment}
                  onChange={(e) => setEmployeeComment(e.target.value)}
                  placeholder="Add your comments before acknowledging…"
                />
              ) : (
                <p className="rounded-lg bg-slate-50 p-3 text-slate-600">
                  {detail.employeeComments || "—"}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDetail(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              {activeEmployee.id === detail.employeeId && detail.status === "Submitted" && (
                <button
                  onClick={handleAcknowledge}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Acknowledge
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
