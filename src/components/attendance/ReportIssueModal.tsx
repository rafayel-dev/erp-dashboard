"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Field, { inputClass } from "@/components/ui/Field";
import { useAppData } from "@/context/AppDataContext";
import { formatDate } from "@/lib/format";
import type { AttendanceStatus } from "@/types";

export default function ReportIssueModal({
  open,
  onClose,
  employeeId,
  date,
  raisedBy,
}: {
  open: boolean;
  onClose: () => void;
  employeeId: string;
  date: string;
  raisedBy: string;
}) {
  const { raiseAttendanceIssue } = useAppData();
  const [description, setDescription] = useState("");
  const [reqCheckIn, setReqCheckIn] = useState("");
  const [reqCheckOut, setReqCheckOut] = useState("");
  const [reqStatus, setReqStatus] = useState<AttendanceStatus | "">("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    raiseAttendanceIssue({
      employeeId,
      date,
      description,
      requestedCheckIn: reqCheckIn || null,
      requestedCheckOut: reqCheckOut || null,
      requestedStatus: reqStatus || null,
      raisedBy,
    });
    setDescription("");
    setReqCheckIn("");
    setReqCheckOut("");
    setReqStatus("");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={`Report an Issue — ${formatDate(date)}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="What's wrong?">
          <textarea
            required
            rows={3}
            className={inputClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Forgot to check out, marked absent by mistake…"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Correct Check In (optional)">
            <input
              type="time"
              className={inputClass}
              value={reqCheckIn}
              onChange={(e) => setReqCheckIn(e.target.value)}
            />
          </Field>
          <Field label="Correct Check Out (optional)">
            <input
              type="time"
              className={inputClass}
              value={reqCheckOut}
              onChange={(e) => setReqCheckOut(e.target.value)}
            />
          </Field>
        </div>
        <Field label="Correct Status (optional)">
          <select
            className={inputClass}
            value={reqStatus}
            onChange={(e) => setReqStatus(e.target.value as AttendanceStatus | "")}
          >
            <option value="">No change</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
            <option value="On Leave">On Leave</option>
          </select>
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Submit
          </button>
        </div>
      </form>
    </Modal>
  );
}
