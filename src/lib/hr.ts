import { toLocalDateStr } from "@/lib/format";
import type {
  AttendanceRecord,
  AttendanceStatus,
  CompanyDocument,
  Employee,
  LeaveApprovalStep,
  LeaveRequest,
  LeaveStatus,
  LeaveType,
  PerformanceReview,
  Role,
  Shift,
} from "@/types";

// ---------- Permissions ----------
// Role model, tied to whichever employee is currently selected in the
// "Viewing as" switcher (there's no real login yet, this is a frontend demo):
//   Admin / HR — full access across the company.
//   Manager    — scoped to their direct reports (via `supervisorId`).
//   Employee   — self-service only.

export function isAdminOrHR(role: Role): boolean {
  return role === "Admin" || role === "HR";
}

export function isFinance(role: Role): boolean {
  return role === "Finance";
}

export function isITAdmin(role: Role): boolean {
  return role === "IT Admin";
}

export function canManageEmployees(role: Role): boolean {
  return isAdminOrHR(role);
}

export function canManageAssets(role: Role): boolean {
  return isAdminOrHR(role) || role === "IT Admin";
}

export function canManagePayroll(role: Role): boolean {
  return isAdminOrHR(role) || role === "Finance";
}

export function canManageExpenses(role: Role): boolean {
  return isAdminOrHR(role) || role === "Finance";
}

export function canManageHelpdesk(role: Role): boolean {
  return isAdminOrHR(role) || role === "IT Admin";
}

export function canManageShifts(role: Role): boolean {
  return isAdminOrHR(role);
}

/** Look up a shift from a live list (context state), falling back to the
 *  first shift if the id isn't found — mirrors mockData's getShift() but
 *  reactive to shifts created/edited/deleted at runtime. */
export function findShift(shiftList: Shift[], id: string): Shift {
  const found = shiftList.find((s) => s.id === id);
  if (found) return found;
  if (shiftList.length > 0) return shiftList[0];
  return {
    id: "shift-default",
    name: "General Office",
    startTime: "09:00",
    endTime: "17:00",
    graceMinutes: 15,
  };
}

/** Can `viewer` approve/reject leave or mark attendance for `target`? */
export function canActOn(viewer: Employee, target: Employee): boolean {
  if (isAdminOrHR(viewer.role)) return true;
  if (viewer.role === "Manager") return target.supervisorId === viewer.id;
  return viewer.id === target.id;
}

/** Can `viewer` assign/change `target`'s shift? Same scope as attendance. */
export function canAssignShift(viewer: Employee, target: Employee): boolean {
  return canActOn(viewer, target);
}

/** Can `viewer` resolve/reject an attendance issue raised about `target`?
 *  Deliberately stricter than canActOn — the person who raised the issue
 *  shouldn't be the one closing it out. */
export function canResolveAttendanceIssue(viewer: Employee, target: Employee): boolean {
  if (viewer.role === "Employee") return false;
  return canActOn(viewer, target);
}

/** Which employees' payroll/attendance rows should `viewer` see by default? */
export function visibleScope(viewer: Employee, all: Employee[]): Employee[] {
  if (isAdminOrHR(viewer.role) || viewer.role === "Finance" || viewer.role === "IT Admin") return all;
  if (viewer.role === "Manager") {
    return all.filter((e) => e.id === viewer.id || e.supervisorId === viewer.id);
  }
  return all.filter((e) => e.id === viewer.id);
}

// ---------- Multi-level leave approval ----------

/** Build the approval chain for a new request from the applicant's
 *  reporting line: a Level 1 "Manager" step only when the direct
 *  supervisor is a Manager-role employee, then always a Level 2 "HR" step. */
export function buildLeaveApprovalSteps(
  applicant: Employee,
  employees: Employee[]
): LeaveApprovalStep[] {
  const steps: LeaveApprovalStep[] = [];
  const supervisor = applicant.supervisorId
    ? employees.find((e) => e.id === applicant.supervisorId)
    : undefined;

  if (supervisor && supervisor.role === "Manager") {
    steps.push({
      level: 1,
      role: "Manager",
      approverId: supervisor.id,
      status: "Pending",
      actedBy: null,
      actedOn: null,
      comment: "",
    });
  }
  steps.push({
    level: 2,
    role: "HR",
    approverId: null,
    status: "Pending",
    actedBy: null,
    actedOn: null,
    comment: "",
  });
  return steps;
}

/** Overall request status derived from its approval chain. */
export function deriveLeaveStatus(steps: LeaveApprovalStep[]): LeaveStatus {
  if (steps.some((s) => s.status === "Rejected")) return "Rejected";
  if (steps.every((s) => s.status === "Approved" || s.status === "Skipped")) return "Approved";
  return "Pending";
}

/** The step currently awaiting action (first Pending step in order), or
 *  null if the request is fully resolved. */
export function activeLeaveStep(steps: LeaveApprovalStep[]): LeaveApprovalStep | null {
  return steps.find((s) => s.status === "Pending") ?? null;
}

/** Can `viewer` act on this request's current step right now? */
export function canActOnLeaveStep(viewer: Employee, request: LeaveRequest): boolean {
  if (viewer.id === request.employeeId) return false; // Prevent self-approval of own leave request
  const step = activeLeaveStep(request.approvalSteps);
  if (!step) return false;
  if (isAdminOrHR(viewer.role)) return true; // Admin/HR can override any step
  if (step.role === "Manager") return step.approverId === viewer.id;
  return false; // HR-role steps need an actual HR/Admin account
}

/** Apply a decision to the current step, cascading a rejection to skip
 *  every later Pending step. Returns the updated chain — pure, no mutation. */
export function applyLeaveDecision(
  steps: LeaveApprovalStep[],
  decision: "Approved" | "Rejected",
  actorId: string,
  comment: string
): LeaveApprovalStep[] {
  const idx = steps.findIndex((s) => s.status === "Pending");
  if (idx === -1) return steps;
  return steps.map((s, i) => {
    if (i === idx) {
      return { ...s, status: decision, actedBy: actorId, actedOn: todayStr(), comment };
    }
    if (decision === "Rejected" && i > idx && s.status === "Pending") {
      return { ...s, status: "Skipped" };
    }
    return s;
  });
}

// ---------- Documents ----------

export function canViewDocument(
  viewer: Employee,
  doc: CompanyDocument,
  employees: Employee[]
): boolean {
  if (doc.employeeId === null) return true; // company-wide
  if (doc.employeeId === viewer.id) return true;
  if (isAdminOrHR(viewer.role)) return true;
  if (viewer.role === "Manager") {
    const owner = employees.find((e) => e.id === doc.employeeId);
    return owner?.supervisorId === viewer.id;
  }
  return false;
}

export function canManageDocuments(role: Role): boolean {
  return isAdminOrHR(role);
}

// ---------- Performance reviews ----------

export function canViewReview(
  viewer: Employee,
  review: PerformanceReview,
  employees: Employee[]
): boolean {
  if (isAdminOrHR(viewer.role)) return true;
  if (review.employeeId === viewer.id || review.reviewerId === viewer.id) return true;
  if (viewer.role === "Manager") {
    const owner = employees.find((e) => e.id === review.employeeId);
    return owner?.supervisorId === viewer.id;
  }
  return false;
}

/** Who can create a review for `target`? Admin/HR always; a Manager only
 *  for their own direct reports. */
export function canCreateReviewFor(viewer: Employee, target: Employee): boolean {
  if (isAdminOrHR(viewer.role)) return true;
  if (viewer.role === "Manager") return target.supervisorId === viewer.id;
  return false;
}

// ---------- Dates ----------

export const todayStr = toLocalDateStr;

export function greeting(hour: number = new Date().getHours()): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function serviceLength(dateJoined: string): string {
  const start = new Date(dateJoined);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return `${years}y ${months}m ${days}d`;
}

/** Days from today until the next occurrence of an MM-DD date (0 = today). */
export function daysUntil(monthDay: string): number {
  const [month, day] = monthDay.split("-").map(Number);
  const now = new Date();
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let next = new Date(now.getFullYear(), month - 1, day);
  if (next < todayMid) next = new Date(now.getFullYear() + 1, month - 1, day);
  return Math.round((next.getTime() - todayMid.getTime()) / (1000 * 60 * 60 * 24));
}

export function relativeDayLabel(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days}d`;
}

export function formatMonthDay(monthDay: string): string {
  const [month, day] = monthDay.split("-").map(Number);
  return new Date(2000, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ---------- Attendance calendar ----------

export interface CalendarDay {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  isWeekend: boolean;
  status: AttendanceStatus | "Weekend" | null;
}

/** Sunday-start 6-week grid for the given month, each day resolved against
 *  the employee's attendance records. */
export function buildMonthGrid(
  year: number,
  month: number,
  employeeId: string,
  attendance: AttendanceRecord[]
): CalendarDay[] {
  const first = new Date(year, month, 1);
  const gridStart = new Date(first);
  gridStart.setDate(gridStart.getDate() - first.getDay());

  const now = new Date();
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const byDate = new Map(
    attendance.filter((a) => a.employeeId === employeeId).map((a) => [a.date, a])
  );

  const days: CalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    const inMonth = d.getMonth() === month;
    const isFuture = d > todayMid;
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const isToday = d.getTime() === todayMid.getTime();

    let status: CalendarDay["status"] = null;
    if (!isFuture) {
      const key = toLocalDateStr(d);
      const rec = byDate.get(key);
      if (rec) status = rec.status;
      else if (isWeekend) status = "Weekend";
      else status = "Absent";
    }

    days.push({ date: d, inMonth, isToday, isFuture, isWeekend, status });
  }
  return days;
}

export interface MonthStats {
  payable: number;
  present: number;
  late: number;
  onLeave: number;
  absent: number;
}

// ---------- Leave balances ----------
// Simple annual entitlement policy (calendar year, resets Jan 1). `null`
// means unlimited / not accrued (e.g. unpaid leave), so there's no cap.

export const annualLeaveAllocation: Record<LeaveType, number | null> = {
  Casual: 10,
  Sick: 14,
  Annual: 14,
  Unpaid: null,
};

export interface LeaveBalance {
  type: LeaveType;
  allocation: number | null;
  taken: number;
  balance: number | null;
}

export function leaveBalances(
  employeeId: string,
  leaveRequests: LeaveRequest[]
): LeaveBalance[] {
  const year = new Date().getFullYear();
  return (Object.keys(annualLeaveAllocation) as LeaveType[]).map((type) => {
    const taken = leaveRequests
      .filter(
        (l) =>
          l.employeeId === employeeId &&
          l.type === type &&
          l.status === "Approved" &&
          new Date(l.startDate).getFullYear() === year
      )
      .reduce((sum, l) => sum + l.days, 0);
    const allocation = annualLeaveAllocation[type];
    return {
      type,
      allocation,
      taken,
      balance: allocation === null ? null : allocation - taken,
    };
  });
}

export function monthStats(
  year: number,
  month: number,
  employeeId: string,
  attendance: AttendanceRecord[]
): MonthStats {
  const grid = buildMonthGrid(year, month, employeeId, attendance).filter(
    (d) => d.inMonth && !d.isFuture
  );
  const stats: MonthStats = { payable: 0, present: 0, late: 0, onLeave: 0, absent: 0 };
  for (const d of grid) {
    if (d.status === "Weekend") continue;
    stats.payable++;
    if (d.status === "Present") stats.present++;
    else if (d.status === "Late") {
      stats.present++;
      stats.late++;
    } else if (d.status === "On Leave") stats.onLeave++;
    else if (d.status === "Absent") stats.absent++;
  }
  return stats;
}
