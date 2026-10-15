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
import { useAppData } from "@/context/AppDataContext";
import { formatDate } from "@/lib/format";
import type { AttendanceIssue, AttendanceRecord, AttendanceStatus } from "@/types";

function isoToTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function CorrectionModal({
  open,
  onClose,
  employeeId,
  date,
  existingRecord,
  issue,
  resolverId,
}: {
  open: boolean;
  onClose: () => void;
  employeeId: string;
  date: string;
  existingRecord: AttendanceRecord | undefined;
  /** Present when resolving a reported issue; omit for an ad-hoc correction. */
  issue?: AttendanceIssue | null;
  resolverId: string;
}) {
  const { correctAttendance, resolveAttendanceIssue } = useAppData();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [status, setStatus] = useState<AttendanceStatus>("Present");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => {
      setCheckIn(issue?.requestedCheckIn ?? isoToTime(existingRecord?.checkIn ?? null));
      setCheckOut(issue?.requestedCheckOut ?? isoToTime(existingRecord?.checkOut ?? null));
      setStatus(issue?.requestedStatus ?? existingRecord?.status ?? "Present");
      setNote("");
    }, 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const correction = { checkIn: checkIn || null, checkOut: checkOut || null, status };
    if (issue) {
      resolveAttendanceIssue(issue, "Resolved", resolverId, note, correction);
    } else {
      correctAttendance(employeeId, date, correction);
    }
    onClose();
  }

  function handleRejectIssue() {
    if (!issue) return;
    resolveAttendanceIssue(issue, "Rejected", resolverId, note);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={issue ? `Resolve Issue — ${formatDate(date)}` : `Correct Attendance — ${formatDate(date)}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {issue && (
          <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
            <p className="font-medium text-slate-700">Reported issue</p>
            <p>{issue.description}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Check In">
            <input
              type="time"
              className={inputClass}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </Field>
          <Field label="Check Out">
            <input
              type="time"
              className={inputClass}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </Field>
        </div>
        <Field label="Status">
          <Select
            value={status}
            onValueChange={(val) => setStatus(val as AttendanceStatus)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Present">Present</SelectItem>
              <SelectItem value="Late">Late</SelectItem>
              <SelectItem value="Absent">Absent</SelectItem>
              <SelectItem value="On Leave">On Leave</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Note">
          <textarea
            rows={2}
            className={inputClass}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason for this correction…"
          />
        </Field>
        <div className="flex items-center justify-end gap-3 pt-2">
          {issue && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRejectIssue}
              className="mr-auto border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
            >
              Reject Issue
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit">
            {issue ? "Resolve & Apply" : "Save Correction"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
