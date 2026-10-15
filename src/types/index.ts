export type Department =
  | "Administration"
  | "Sales"
  | "Operations"
  | "Human Resources"
  | "Finance"
  | "IT"
  | "Logistics";

export type EmployeeStatus = "Active" | "On Leave" | "Inactive";
export type EmploymentStatus = "Permanent" | "Contract" | "Probation";

/**
 * Admin        — full access: manage employees, approve any leave, see all payroll.
 * HR           — same operational access as Admin (employee records, leave, payroll).
 * Manager      — approves leave and marks attendance only for direct reports
 *                 (matched via `supervisorId`); sees own + team payroll.
 * Employee     — self-service only: own attendance, own leave, own payslips.
 */
export type Role = "Admin" | "HR" | "Finance" | "IT Admin" | "Manager" | "Employee";

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  department: Department;
  position: string;
  dateJoined: string; // ISO date
  status: EmployeeStatus;
  avatarColor: string;
  employmentStatus: EmploymentStatus;
  supervisorId: string | null;
  /** MM-DD, no birth year stored */
  birthday: string;
  role: Role;
  shiftId: string;
}

// ---------- Shifts ----------

export interface Shift {
  id: string;
  name: string;
  /** 24h "HH:MM" */
  startTime: string;
  /** 24h "HH:MM" */
  endTime: string;
  /** Minutes after `startTime` before a check-in counts as Late. */
  graceMinutes: number;
}

export type AttendanceStatus = "Present" | "Late" | "Absent" | "On Leave";
export type PunchMethod = "Manual" | "Geo-Fenced" | "QR Scan";

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // ISO date (yyyy-mm-dd)
  checkIn: string | null; // ISO datetime
  checkOut: string | null; // ISO datetime
  status: AttendanceStatus;
  punchMethod?: PunchMethod;
  location?: {
    latitude: number;
    longitude: number;
    isWithinRadius: boolean;
    distanceMeters: number;
  };
}

// ---------- Attendance issue / correction requests ----------

export type AttendanceIssueStatus = "Open" | "Resolved" | "Rejected";

export interface AttendanceIssue {
  id: string;
  employeeId: string;
  date: string; // the attendance date this issue is about
  description: string;
  /** What the employee believes the record should say — optional hints
   *  for whoever resolves it. */
  requestedCheckIn: string | null; // "HH:MM"
  requestedCheckOut: string | null; // "HH:MM"
  requestedStatus: AttendanceStatus | null;
  status: AttendanceIssueStatus;
  raisedBy: string; // employeeId (usually the same as employeeId, but Admin/HR/Manager can raise on behalf)
  raisedOn: string; // ISO date
  resolvedBy: string | null;
  resolvedOn: string | null;
  resolutionNote: string;
}

export type LeaveType = "Sick" | "Casual" | "Annual" | "Unpaid";
export type LeaveStatus = "Pending" | "Approved" | "Rejected";

/**
 * Multi-level leave approval: each request carries an ordered chain of
 * steps built from the applicant's reporting line —
 *   Level 1 "Manager" — the applicant's direct supervisor, only when that
 *     supervisor's role is Manager (skipped otherwise, e.g. a Manager or
 *     HR applicant reporting straight to an Admin has no Level 1).
 *   Level 2 "HR"       — final sign-off by any HR/Admin user, always present.
 * A step is actionable once every step before it is Approved. Rejecting
 * any step rejects the whole request and skips the remaining steps.
 */
export type ApprovalStepStatus = "Pending" | "Approved" | "Rejected" | "Skipped";
export type ApprovalRole = "Manager" | "HR";

export interface LeaveApprovalStep {
  level: number;
  role: ApprovalRole;
  /** The specific employee expected to act (Manager steps only — HR steps
   *  can be actioned by any HR/Admin user, so this stays null for those). */
  approverId: string | null;
  status: ApprovalStepStatus;
  actedBy: string | null;
  actedOn: string | null;
  comment: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  /** Overall derived status — Approved only once every step is Approved. */
  status: LeaveStatus;
  appliedOn: string;
  approvalSteps: LeaveApprovalStep[];
}

export type PayrollStatus = "Paid" | "Pending";

/** One line item in a payslip's earnings or deductions breakdown. */
export interface PayComponent {
  label: string;
  amount: number;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  month: string; // e.g. "2026-08"
  basicSalary: number;
  /** Extra earnings beyond basic — HRA, transport, medical, bonus, etc. */
  earnings: PayComponent[];
  /** Tax, provident fund, insurance, advance recovery, etc. */
  deductions: PayComponent[];
  /** basicSalary + sum(earnings) */
  grossPay: number;
  /** sum(deductions) */
  totalDeductions: number;
  /** grossPay − totalDeductions */
  netPay: number;
  status: PayrollStatus;
  paidOn: string | null; // ISO date, set once marked Paid
}

export interface Notice {
  id: string;
  title: string;
  date: string; // ISO date
}

export type AdvanceStatus = "Pending" | "Approved" | "Rejected";

export interface AdvanceRequest {
  id: string;
  employeeId: string;
  amount: number;
  reason: string;
  status: AdvanceStatus;
  requestedOn: string; // ISO date
}

// ---------- Asset Management ----------

export type AssetCategory =
  | "Laptop"
  | "Desktop"
  | "Mobile"
  | "Vehicle"
  | "Furniture"
  | "Accessory"
  | "Other";

export type AssetStatus = "Available" | "Allocated" | "In Repair" | "Retired";

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  serialNumber: string;
  purchaseDate: string; // ISO date
  status: AssetStatus;
  assignedTo: string | null; // employeeId
  assignedOn: string | null; // ISO date
  notes: string;
}

// ---------- Document Management ----------

export type DocumentCategory =
  | "Policy"
  | "Offer Letter"
  | "Certificate"
  | "Contract"
  | "Personal"
  | "Other";

export interface CompanyDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  uploadedBy: string; // employeeId
  uploadedOn: string; // ISO date
  /** null = visible to the whole company (e.g. policies); set = a specific
   *  employee's personal document (offer letter, certificate, etc.). */
  employeeId: string | null;
  fileName: string;
  fileSizeKb: number;
}

// ---------- Performance / KPI Review ----------

export type ReviewStatus = "Draft" | "Submitted" | "Acknowledged";

export interface KpiItem {
  title: string;
  target: string;
  achieved: string;
  /** 1–5 */
  score: number;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  period: string; // e.g. "2026 Q3"
  kpis: KpiItem[];
  /** 1–5, average of kpi scores unless overridden */
  overallRating: number;
  managerComments: string;
  employeeComments: string;
  status: ReviewStatus;
  createdOn: string; // ISO date
}

// ---------- Projects & Task Tracker ----------

export type TaskStatus = "To Do" | "In Progress" | "Under Review" | "Completed";
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export interface Project {
  id: string;
  name: string;
  description: string;
  department: Department;
  startDate: string;
  dueDate: string;
  status: "Active" | "Completed" | "On Hold";
  managerId: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assigneeId: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  progress: number; // 0 - 100
}

// ---------- Company Announcements ----------

export type AnnouncementPriority = "General" | "Important" | "Urgent";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: AnnouncementPriority;
  postedBy: string; // employeeId
  postedOn: string; // ISO date
  targetDepartment?: Department | "All";
}

// ---------- System Notifications ----------

export type NotificationCategory = "Leave" | "Attendance" | "Task" | "System" | "Birthday";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: NotificationCategory;
  link?: string;
}

// ---------- Expense & Reimbursement Claims ----------

export type ExpenseCategory =
  | "Travel"
  | "Meals & Entertainment"
  | "Office Supplies"
  | "Internet & Phone"
  | "Training"
  | "Other";

export type ExpenseStatus = "Pending" | "Approved" | "Rejected" | "Reimbursed";

export interface ExpenseClaim {
  id: string;
  employeeId: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  status: ExpenseStatus;
  submittedOn: string;
  approvedBy?: string | null;
  approvedOn?: string | null;
}

// ---------- Internal Helpdesk & Support Tickets ----------

export type TicketCategory =
  | "IT & Hardware"
  | "Software & Access"
  | "HR & Workplace"
  | "Payroll & Benefits"
  | "Facilities";

export type TicketPriority = "Urgent" | "High" | "Medium" | "Low";

export type TicketStatus = "Open" | "In Progress" | "Resolved";

export interface SupportTicket {
  id: string;
  ticketCode: string;
  employeeId: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  description: string;
  createdAt: string;
  resolvedAt?: string | null;
  assignedTo?: string | null;
}

