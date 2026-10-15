"use client";

import { useState } from "react";
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
          <Select
            value={reqStatus || "none"}
            onValueChange={(val) =>
              setReqStatus(val === "none" ? "" : (val as AttendanceStatus))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="No change" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No change</SelectItem>
              <SelectItem value="Present">Present</SelectItem>
              <SelectItem value="Late">Late</SelectItem>
              <SelectItem value="Absent">Absent</SelectItem>
              <SelectItem value="On Leave">On Leave</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit">
            Submit
          </Button>
        </div>
      </form>
    </Modal>
  );
}
