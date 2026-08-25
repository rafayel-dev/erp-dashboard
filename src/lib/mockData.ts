import { toLocalDateStr } from "@/lib/format";
import { buildPayrollRecord } from "@/lib/payroll";
import type {
  AdvanceRequest,
  Announcement,
  Asset,
  AttendanceIssue,
  AttendanceRecord,
  AttendanceStatus,
  CompanyDocument,
  Department,
  Employee,
  LeaveRequest,
  Notice,
  NotificationItem,
  PayrollRecord,
  PerformanceReview,
  Project,
  Shift,
  Task,
} from "@/types";

export const companyName = "RMNR";

// ---------- Shifts ----------
// Seed data only — the live, editable list lives in AppDataContext state
// once the app is running (see addShift/updateShift/deleteShift). Look up
// a shift by id via `findShift()` in lib/hr.ts, not this file.

export const shifts: Shift[] = [
  { id: "shift-morning", name: "Morning (Office)", startTime: "09:00", endTime: "17:00", graceMinutes: 15 },
  { id: "shift-early", name: "Early (Logistics)", startTime: "07:00", endTime: "15:00", graceMinutes: 15 },
  { id: "shift-evening", name: "Evening (Support)", startTime: "14:00", endTime: "22:00", graceMinutes: 15 },
];

// ---------- Employees ----------

const avatarColors = [
  "#6366F1",
  "#0EA5E9",
  "#F59E0B",
  "#10B981",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
];

export const departments: Department[] = [
  "Administration",
  "Sales",
  "Operations",
  "Human Resources",
  "Finance",
  "IT",
  "Logistics",
];

const rawEmployees: Array<
  Omit<Employee, "id" | "avatarColor" | "employeeCode">
> = [
  {
    name: "Rafiul Islam",
    email: "rafiul.islam@rmnr.com",
    phone: "+1 (914) 555-0110",
    department: "Administration",
    position: "Managing Director",
    dateJoined: "2019-03-01",
    status: "Active",
    employmentStatus: "Permanent",
    supervisorId: null,
    birthday: "03-14",
    role: "Admin",
    shiftId: "shift-morning",
  },
  {
    name: "Amelia Carter",
    email: "amelia.carter@rmnr.com",
    phone: "+1 (914) 555-0122",
    department: "Human Resources",
    position: "HR Manager",
    dateJoined: "2020-06-15",
    status: "Active",
    employmentStatus: "Permanent",
    supervisorId: "emp-1",
    birthday: "08-26",
    role: "HR",
    shiftId: "shift-morning",
  },
  {
    name: "Daniel Brooks",
    email: "daniel.brooks@rmnr.com",
    phone: "+1 (914) 555-0133",
    department: "Finance",
    position: "Finance Manager",
    dateJoined: "2020-01-20",
    status: "Active",
    employmentStatus: "Permanent",
    supervisorId: "emp-1",
    birthday: "11-02",
    role: "Manager",
    shiftId: "shift-morning",
  },
  {
    name: "Sophia Nguyen",
    email: "sophia.nguyen@rmnr.com",
    phone: "+1 (914) 555-0144",
    department: "Sales",
    position: "Sales Executive",
    dateJoined: "2021-09-10",
    status: "Active",
    employmentStatus: "Permanent",
    supervisorId: "emp-1",
    birthday: "09-01",
    role: "Employee",
    shiftId: "shift-morning",
  },
  {
    name: "James O'Connor",
    email: "james.oconnor@rmnr.com",
    phone: "+1 (914) 555-0155",
    department: "Operations",
    position: "Operations Lead",
    dateJoined: "2018-11-05",
    status: "Active",
    employmentStatus: "Permanent",
    supervisorId: "emp-1",
    birthday: "05-19",
    role: "Manager",
    shiftId: "shift-early",
  },
  {
    name: "Isabella Rossi",
    email: "isabella.rossi@rmnr.com",
    phone: "+1 (914) 555-0166",
    department: "IT",
    position: "Software Engineer",
    dateJoined: "2022-02-14",
    status: "Active",
    employmentStatus: "Permanent",
    supervisorId: "emp-1",
    birthday: "08-30",
    role: "Employee",
    shiftId: "shift-morning",
  },
  {
    name: "Ethan Walker",
    email: "ethan.walker@rmnr.com",
    phone: "+1 (914) 555-0177",
    department: "Logistics",
    position: "Logistics Coordinator",
    dateJoined: "2021-05-22",
    status: "On Leave",
    employmentStatus: "Permanent",
    supervisorId: "emp-5",
    birthday: "12-24",
    role: "Employee",
    shiftId: "shift-early",
  },
  {
    name: "Mia Thompson",
    email: "mia.thompson@rmnr.com",
    phone: "+1 (914) 555-0188",
    department: "Sales",
    position: "Sales Associate",
    dateJoined: "2023-01-09",
    status: "Active",
    employmentStatus: "Permanent",
    supervisorId: "emp-4",
    birthday: "02-08",
    role: "Employee",
    shiftId: "shift-morning",
  },
  {
    name: "Lucas Bennett",
    email: "lucas.bennett@rmnr.com",
    phone: "+1 (914) 555-0199",
    department: "IT",
    position: "IT Support Specialist",
    dateJoined: "2022-08-30",
    status: "Active",
    employmentStatus: "Contract",
    supervisorId: "emp-6",
    birthday: "09-10",
    role: "Employee",
    shiftId: "shift-evening",
  },
  {
    name: "Chloe Martin",
    email: "chloe.martin@rmnr.com",
    phone: "+1 (914) 555-0210",
    department: "Human Resources",
    position: "Recruiter",
    dateJoined: "2023-04-17",
    status: "Active",
    employmentStatus: "Permanent",
    supervisorId: "emp-2",
    birthday: "06-21",
    role: "Employee",
    shiftId: "shift-morning",
  },
  {
    name: "Benjamin Clark",
    email: "benjamin.clark@rmnr.com",
    phone: "+1 (914) 555-0221",
    department: "Operations",
    position: "Warehouse Supervisor",
    dateJoined: "2019-07-12",
    status: "Inactive",
    employmentStatus: "Permanent",
    supervisorId: "emp-5",
    birthday: "10-05",
    role: "Employee",
    shiftId: "shift-early",
  },
  {
    name: "Ava Mitchell",
    email: "ava.mitchell@rmnr.com",
    phone: "+1 (914) 555-0232",
    department: "Finance",
    position: "Accountant",
    dateJoined: "2021-12-01",
    status: "Active",
    employmentStatus: "Permanent",
    supervisorId: "emp-3",
    birthday: "08-28",
    role: "Employee",
    shiftId: "shift-morning",
  },
];

export const employees: Employee[] = rawEmployees.map((e, i) => ({
  ...e,
  id: `emp-${i + 1}`,
  employeeCode: `RMNR-${String(1000 + i + 1)}`,
  avatarColor: avatarColors[i % avatarColors.length],
}));

export const currentUser = employees[0];

// ---------- Helpers ----------

const toISODate = toLocalDateStr;

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Deterministic-ish pseudo-random based on a seed string so mock data
// doesn't reshuffle wildly between renders within the same session.
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// ---------- Attendance (last 45 days, excluding weekends) ----------
// Deep enough to fill both the current and previous month on the
// attendance calendar widget.

function buildAttendanceHistory(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  let counter = 0;

  for (let dayOffset = 45; dayOffset >= 1; dayOffset--) {
    const date = addDays(today, -dayOffset);
    const dow = date.getDay();
    if (dow === 0 || dow === 6) continue; // skip weekends

    employees.forEach((emp, idx) => {
      counter++;
      const r = seededRandom(counter + idx * 7 + dayOffset * 3);
      let status: AttendanceStatus;
      let checkInHour = 9;
      let checkInMinute = randomBetween(0, 29);

      if (r < 0.05) {
        status = "Absent";
      } else if (r < 0.12) {
        status = "On Leave";
      } else if (r < 0.25) {
        status = "Late";
        checkInHour = 9;
        checkInMinute = randomBetween(31, 59);
      } else {
        status = "Present";
      }

      const dateStr = toISODate(date);
      if (status === "Absent" || status === "On Leave") {
        records.push({
          id: `att-${dateStr}-${emp.id}`,
          employeeId: emp.id,
          date: dateStr,
          checkIn: null,
          checkOut: null,
          status,
        });
        return;
      }

      const checkIn = new Date(date);
      checkIn.setHours(checkInHour, checkInMinute, 0, 0);
      const checkOut = new Date(date);
      const outHour = 17 + (r > 0.8 ? 1 : 0);
      checkOut.setHours(outHour, randomBetween(0, 45), 0, 0);

      records.push({
        id: `att-${dateStr}-${emp.id}`,
        employeeId: emp.id,
        date: dateStr,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        status,
      });
    });
  }

  return records;
}

export const attendanceHistory: AttendanceRecord[] = buildAttendanceHistory();

// ---------- Leave requests (multi-level approval) ----------
// Level 1 "Manager" only exists when the applicant's direct supervisor is
// a Manager-role employee; everyone else goes straight to the single HR
// sign-off. See LeaveApprovalStep in src/types.

function step(
  level: number,
  role: "Manager" | "HR",
  approverId: string | null,
  status: "Pending" | "Approved" | "Rejected" | "Skipped",
  actedBy: string | null,
  actedOnOffsetDays: number | null,
  comment = ""
) {
  return {
    level,
    role,
    approverId,
    status,
    actedBy,
    actedOn: actedOnOffsetDays === null ? null : toISODate(addDays(new Date(), actedOnOffsetDays)),
    comment,
  };
}

export const leaveRequests: LeaveRequest[] = [
  {
    id: "lv-1",
    employeeId: "emp-7", // Ethan Walker → reports to James O'Connor (Manager)
    type: "Sick",
    startDate: toISODate(addDays(new Date(), -1)),
    endDate: toISODate(addDays(new Date(), 2)),
    days: 4,
    reason: "Flu recovery",
    status: "Approved",
    appliedOn: toISODate(addDays(new Date(), -3)),
    approvalSteps: [
      step(1, "Manager", "emp-5", "Approved", "emp-5", -3, "Take care, get well soon."),
      step(2, "HR", null, "Approved", "emp-2", -2),
    ],
  },
  {
    id: "lv-2",
    employeeId: "emp-4", // Sophia Nguyen → reports to Rafiul (Admin), single HR step
    type: "Annual",
    startDate: toISODate(addDays(new Date(), 5)),
    endDate: toISODate(addDays(new Date(), 9)),
    days: 5,
    reason: "Family vacation",
    status: "Pending",
    appliedOn: toISODate(addDays(new Date(), -1)),
    approvalSteps: [step(2, "HR", null, "Pending", null, null)],
  },
  {
    id: "lv-3",
    employeeId: "emp-9", // Lucas Bennett → reports to Isabella Rossi (Employee), single HR step
    type: "Casual",
    startDate: toISODate(addDays(new Date(), -6)),
    endDate: toISODate(addDays(new Date(), -6)),
    days: 1,
    reason: "Personal errand",
    status: "Approved",
    appliedOn: toISODate(addDays(new Date(), -8)),
    approvalSteps: [step(2, "HR", null, "Approved", "emp-2", -7)],
  },
  {
    id: "lv-4",
    employeeId: "emp-3", // Daniel Brooks → reports to Rafiul (Admin), single HR step
    type: "Unpaid",
    startDate: toISODate(addDays(new Date(), 12)),
    endDate: toISODate(addDays(new Date(), 13)),
    days: 2,
    reason: "Relocation",
    status: "Pending",
    appliedOn: toISODate(new Date()),
    approvalSteps: [step(2, "HR", null, "Pending", null, null)],
  },
  {
    id: "lv-5",
    employeeId: "emp-10", // Chloe Martin → reports to Amelia Carter (HR), single HR step
    type: "Sick",
    startDate: toISODate(addDays(new Date(), -10)),
    endDate: toISODate(addDays(new Date(), -9)),
    days: 2,
    reason: "Medical appointment",
    status: "Rejected",
    appliedOn: toISODate(addDays(new Date(), -11)),
    approvalSteps: [
      step(2, "HR", null, "Rejected", "emp-2", -10, "No leave balance remaining for this period."),
    ],
  },
  {
    id: "lv-6",
    employeeId: "emp-12", // Ava Mitchell → reports to Daniel Brooks (Manager)
    type: "Casual",
    startDate: toISODate(addDays(new Date(), 3)),
    endDate: toISODate(addDays(new Date(), 3)),
    days: 1,
    reason: "Dentist appointment",
    status: "Pending",
    appliedOn: toISODate(addDays(new Date(), -1)),
    approvalSteps: [
      step(1, "Manager", "emp-3", "Approved", "emp-3", -1),
      step(2, "HR", null, "Pending", null, null),
    ],
  },
  {
    id: "lv-7",
    employeeId: "emp-11", // Benjamin Clark → reports to James O'Connor (Manager)
    type: "Annual",
    startDate: toISODate(addDays(new Date(), 20)),
    endDate: toISODate(addDays(new Date(), 24)),
    days: 5,
    reason: "Annual trip home",
    status: "Pending",
    appliedOn: toISODate(new Date()),
    approvalSteps: [
      step(1, "Manager", "emp-5", "Pending", null, null),
      step(2, "HR", null, "Pending", null, null),
    ],
  },
];

// ---------- Payroll (last 3 months) ----------

function monthLabel(offset: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const baseSalaries: Record<string, number> = {
  "emp-1": 9500,
  "emp-2": 6200,
  "emp-3": 6800,
  "emp-4": 4200,
  "emp-5": 5400,
  "emp-6": 5800,
  "emp-7": 4600,
  "emp-8": 3400,
  "emp-9": 4100,
  "emp-10": 3900,
  "emp-11": 4700,
  "emp-12": 4300,
};

function buildPayroll(): PayrollRecord[] {
  const records: PayrollRecord[] = [];
  for (let m = 2; m >= 0; m--) {
    const month = monthLabel(m);
    const isCurrentMonth = m === 0;
    employees.forEach((emp) => {
      const basicSalary = baseSalaries[emp.id] ?? 4000;
      records.push(
        buildPayrollRecord(
          emp.id,
          month,
          basicSalary,
          isCurrentMonth ? "Pending" : "Paid",
          isCurrentMonth ? null : toISODate(addDays(new Date(), -m * 30 + 3))
        )
      );
    });
  }
  return records;
}

export const payrollRecords: PayrollRecord[] = buildPayroll();

export function getEmployee(id: string): Employee | undefined {
  return employees.find((e) => e.id === id);
}

// ---------- Notice board ----------

export const notices: Notice[] = [
  { id: "nt-1", title: "Updated Employee Handbook now available on the Documents page", date: toISODate(addDays(new Date(), -3)) },
  { id: "nt-2", title: "Office Wi-Fi maintenance this Saturday, 10 PM – 2 AM", date: toISODate(addDays(new Date(), -5)) },
  { id: "nt-3", title: "Company picnic scheduled for September 12 — RSVP with HR", date: toISODate(addDays(new Date(), -6)) },
  { id: "nt-4", title: "Reminder: submit weekly timesheets every Friday by 6 PM", date: toISODate(addDays(new Date(), -9)) },
  { id: "nt-5", title: "New health insurance provider starting next quarter", date: toISODate(addDays(new Date(), -14)) },
  { id: "nt-6", title: "Q3 town hall recording is now available on request", date: toISODate(addDays(new Date(), -20)) },
];

// ---------- Advance salary requests ----------

export const advanceRequests: AdvanceRequest[] = [
  {
    id: "adv-1",
    employeeId: "emp-8", // Mia Thompson
    amount: 500,
    reason: "Medical expense",
    status: "Approved",
    requestedOn: toISODate(addDays(new Date(), -12)),
  },
  {
    id: "adv-2",
    employeeId: "emp-9", // Lucas Bennett
    amount: 300,
    reason: "Family emergency",
    status: "Pending",
    requestedOn: toISODate(addDays(new Date(), -2)),
  },
];

// ---------- Asset Management ----------

export const assets: Asset[] = [
  {
    id: "ast-1",
    name: "MacBook Pro 14\" M3",
    category: "Laptop",
    serialNumber: "SN-LT-1001",
    purchaseDate: "2024-02-10",
    status: "Allocated",
    assignedTo: "emp-1",
    assignedOn: "2024-02-12",
    notes: "",
  },
  {
    id: "ast-2",
    name: "Dell Latitude 5440",
    category: "Laptop",
    serialNumber: "SN-LT-1002",
    purchaseDate: "2023-06-01",
    status: "Allocated",
    assignedTo: "emp-6",
    assignedOn: "2023-06-05",
    notes: "",
  },
  {
    id: "ast-3",
    name: "Dell Latitude 5440",
    category: "Laptop",
    serialNumber: "SN-LT-1003",
    purchaseDate: "2023-06-01",
    status: "Allocated",
    assignedTo: "emp-9",
    assignedOn: "2023-06-05",
    notes: "",
  },
  {
    id: "ast-4",
    name: "iPhone 14",
    category: "Mobile",
    serialNumber: "SN-MB-2001",
    purchaseDate: "2023-01-15",
    status: "Allocated",
    assignedTo: "emp-5",
    assignedOn: "2023-01-20",
    notes: "Field sales/ops line",
  },
  {
    id: "ast-5",
    name: "Toyota Hiace (Delivery Van)",
    category: "Vehicle",
    serialNumber: "VIN-TH-3001",
    purchaseDate: "2021-09-01",
    status: "In Repair",
    assignedTo: null,
    assignedOn: null,
    notes: "In workshop for brake service, back next week.",
  },
  {
    id: "ast-6",
    name: "Honda CB Shine (Courier Bike)",
    category: "Vehicle",
    serialNumber: "VIN-HC-3002",
    purchaseDate: "2022-03-10",
    status: "Allocated",
    assignedTo: "emp-7",
    assignedOn: "2022-03-12",
    notes: "",
  },
  {
    id: "ast-7",
    name: "Ergonomic Office Chair",
    category: "Furniture",
    serialNumber: "SN-FN-4001",
    purchaseDate: "2022-11-01",
    status: "Allocated",
    assignedTo: "emp-2",
    assignedOn: "2022-11-05",
    notes: "",
  },
  {
    id: "ast-8",
    name: "Dell 27\" Monitor",
    category: "Accessory",
    serialNumber: "SN-AC-5001",
    purchaseDate: "2024-01-05",
    status: "Available",
    assignedTo: null,
    assignedOn: null,
    notes: "Spare, in IT storage.",
  },
  {
    id: "ast-9",
    name: "HP LaserJet Printer",
    category: "Other",
    serialNumber: "SN-OT-6001",
    purchaseDate: "2020-05-20",
    status: "Retired",
    assignedTo: null,
    assignedOn: null,
    notes: "Decommissioned, pending disposal.",
  },
  {
    id: "ast-10",
    name: "MacBook Air M2",
    category: "Laptop",
    serialNumber: "SN-LT-1004",
    purchaseDate: "2024-07-18",
    status: "Available",
    assignedTo: null,
    assignedOn: null,
    notes: "Reserved for next new hire.",
  },
];

// ---------- Document Management ----------

export const documents: CompanyDocument[] = [
  {
    id: "doc-1",
    title: "Employee Handbook 2026",
    category: "Policy",
    uploadedBy: "emp-2",
    uploadedOn: toISODate(addDays(new Date(), -20)),
    employeeId: null,
    fileName: "employee-handbook-2026.pdf",
    fileSizeKb: 1840,
  },
  {
    id: "doc-2",
    title: "Leave & Attendance Policy",
    category: "Policy",
    uploadedBy: "emp-2",
    uploadedOn: toISODate(addDays(new Date(), -45)),
    employeeId: null,
    fileName: "leave-attendance-policy.pdf",
    fileSizeKb: 620,
  },
  {
    id: "doc-3",
    title: "Code of Conduct",
    category: "Policy",
    uploadedBy: "emp-1",
    uploadedOn: toISODate(addDays(new Date(), -90)),
    employeeId: null,
    fileName: "code-of-conduct.pdf",
    fileSizeKb: 410,
  },
  {
    id: "doc-4",
    title: "Offer Letter — Mia Thompson",
    category: "Offer Letter",
    uploadedBy: "emp-2",
    uploadedOn: "2023-01-02",
    employeeId: "emp-8",
    fileName: "offer-letter-mia-thompson.pdf",
    fileSizeKb: 180,
  },
  {
    id: "doc-5",
    title: "Offer Letter — Chloe Martin",
    category: "Offer Letter",
    uploadedBy: "emp-2",
    uploadedOn: "2023-04-10",
    employeeId: "emp-10",
    fileName: "offer-letter-chloe-martin.pdf",
    fileSizeKb: 175,
  },
  {
    id: "doc-6",
    title: "IT Equipment Agreement — Isabella Rossi",
    category: "Contract",
    uploadedBy: "emp-6",
    uploadedOn: "2022-02-16",
    employeeId: "emp-6",
    fileName: "it-equipment-agreement-isabella.pdf",
    fileSizeKb: 95,
  },
  {
    id: "doc-7",
    title: "First Aid Training Certificate",
    category: "Certificate",
    uploadedBy: "emp-2",
    uploadedOn: toISODate(addDays(new Date(), -200)),
    employeeId: "emp-10",
    fileName: "first-aid-certificate-chloe.pdf",
    fileSizeKb: 220,
  },
];

// ---------- Performance / KPI Review ----------

export const performanceReviews: PerformanceReview[] = [
  {
    id: "rev-1",
    employeeId: "emp-7", // Ethan Walker, reviewed by James O'Connor
    reviewerId: "emp-5",
    period: "2026 Q2",
    kpis: [
      { title: "On-time deliveries", target: "95%", achieved: "97%", score: 5 },
      { title: "Route efficiency", target: "90%", achieved: "88%", score: 3 },
      { title: "Customer complaints", target: "< 3 / month", achieved: "2 / month", score: 4 },
    ],
    overallRating: 4,
    managerComments: "Consistently reliable on deliveries; work on route planning during peak hours.",
    employeeComments: "Will use the new routing app suggested in the review.",
    status: "Acknowledged",
    createdOn: toISODate(addDays(new Date(), -50)),
  },
  {
    id: "rev-2",
    employeeId: "emp-8", // Mia Thompson, reviewed by Sophia Nguyen? Sophia isn't a manager — use Rafiul as fallback reviewer
    reviewerId: "emp-1",
    period: "2026 Q2",
    kpis: [
      { title: "Sales target", target: "$20,000", achieved: "$18,500", score: 3 },
      { title: "Upsell rate", target: "15%", achieved: "19%", score: 5 },
    ],
    overallRating: 4,
    managerComments: "Strong upsell performance; slightly under quarterly sales target.",
    employeeComments: "",
    status: "Submitted",
    createdOn: toISODate(addDays(new Date(), -10)),
  },
  {
    id: "rev-3",
    employeeId: "emp-12", // Ava Mitchell, reviewed by Daniel Brooks
    reviewerId: "emp-3",
    period: "2026 Q2",
    kpis: [
      { title: "Ledger accuracy", target: "99.5%", achieved: "99.8%", score: 5 },
      { title: "Invoice turnaround", target: "< 2 days", achieved: "1.5 days", score: 5 },
    ],
    overallRating: 5,
    managerComments: "Excellent quarter, very detail-oriented.",
    employeeComments: "Thank you! Looking to take on reconciliation for the new branch next.",
    status: "Acknowledged",
    createdOn: toISODate(addDays(new Date(), -55)),
  },
  {
    id: "rev-4",
    employeeId: "emp-9", // Lucas Bennett — draft, not yet shared
    reviewerId: "emp-6",
    period: "2026 Q3",
    kpis: [
      { title: "Ticket resolution time", target: "< 4 hrs", achieved: "5.2 hrs", score: 2 },
      { title: "First-contact resolution", target: "80%", achieved: "84%", score: 4 },
    ],
    overallRating: 3,
    managerComments: "Draft — need one more data pull before sharing.",
    employeeComments: "",
    status: "Draft",
    createdOn: toISODate(addDays(new Date(), -1)),
  },
];

// ---------- Attendance issues / corrections ----------

export const attendanceIssues: AttendanceIssue[] = [
  {
    id: "iss-1",
    employeeId: "emp-9", // Lucas Bennett
    date: toISODate(addDays(new Date(), -3)),
    description: "Forgot to check out before leaving — I actually left around 6:15 PM.",
    requestedCheckIn: null,
    requestedCheckOut: "18:15",
    requestedStatus: null,
    status: "Open",
    raisedBy: "emp-9",
    raisedOn: toISODate(addDays(new Date(), -2)),
    resolvedBy: null,
    resolvedOn: null,
    resolutionNote: "",
  },
  {
    id: "iss-2",
    employeeId: "emp-8", // Mia Thompson
    date: toISODate(addDays(new Date(), -7)),
    description: "Marked Absent but I was on-site all day — just forgot to punch in.",
    requestedCheckIn: "09:10",
    requestedCheckOut: "17:20",
    requestedStatus: "Present",
    status: "Resolved",
    raisedBy: "emp-8",
    raisedOn: toISODate(addDays(new Date(), -6)),
    resolvedBy: "emp-4",
    resolvedOn: toISODate(addDays(new Date(), -5)),
    resolutionNote: "Confirmed with front-desk sign-in sheet, corrected to Present.",
  },
  {
    id: "iss-3",
    employeeId: "emp-11", // Benjamin Clark
    date: toISODate(addDays(new Date(), -14)),
    description: "Late mark seems wrong — my badge log shows I was on time.",
    requestedCheckIn: "08:55",
    requestedCheckOut: null,
    requestedStatus: "Present",
    status: "Rejected",
    raisedBy: "emp-11",
    raisedOn: toISODate(addDays(new Date(), -13)),
    resolvedBy: "emp-5",
    resolvedOn: toISODate(addDays(new Date(), -12)),
    resolutionNote: "Badge log actually shows 09:42 check-in — keeping the Late status.",
  },
];

// ---------- Projects & Tasks ----------

export const projects: Project[] = [
  {
    id: "proj-1",
    name: "Enterprise ERP v2 Upgrade",
    description: "UI Redesign, Kanban workflow, and Executive Reports module.",
    department: "IT",
    startDate: "2026-08-01",
    dueDate: "2026-09-15",
    status: "Active",
    managerId: "emp-2", // Sophia Rodriguez
  },
  {
    id: "proj-2",
    name: "Q4 Sales Acceleration",
    description: "Regional client outreach, campaign assets, and CRM synchronization.",
    department: "Sales",
    startDate: "2026-08-10",
    dueDate: "2026-10-30",
    status: "Active",
    managerId: "emp-6", // David Kim
  },
  {
    id: "proj-3",
    name: "Annual Performance Review 2026",
    description: "Employee self-evaluations and supervisor KPI assessment cycle.",
    department: "Human Resources",
    startDate: "2026-07-15",
    dueDate: "2026-08-31",
    status: "Active",
    managerId: "emp-4", // Marcus Chen
  },
];

export const tasks: Task[] = [
  {
    id: "task-1",
    projectId: "proj-1",
    title: "Redesign Executive Dashboard UI",
    description: "Implement glassmorphism, accent cards, and responsive sidebar navigation.",
    assigneeId: "emp-10", // Ethan Wright
    priority: "High",
    status: "In Progress",
    dueDate: "2026-08-28",
    progress: 75,
  },
  {
    id: "task-2",
    projectId: "proj-1",
    title: "Build Kanban Board Module",
    description: "Develop interactive drag-and-drop task status workflow across columns.",
    assigneeId: "emp-2", // Sophia Rodriguez
    priority: "Urgent",
    status: "To Do",
    dueDate: "2026-09-02",
    progress: 25,
  },
  {
    id: "task-3",
    projectId: "proj-2",
    title: "Client Contact Database Verification",
    description: "Validate active leads and clean duplicate entries from Sales ledger.",
    assigneeId: "emp-7", // Isabella Martinez
    priority: "Medium",
    status: "Completed",
    dueDate: "2026-08-22",
    progress: 100,
  },
  {
    id: "task-4",
    projectId: "proj-3",
    title: "KPI Scorecard Template Update",
    description: "Standardize 5-point rating metrics for Q3/Q4 department appraisals.",
    assigneeId: "emp-4", // Marcus Chen
    priority: "Medium",
    status: "Under Review",
    dueDate: "2026-08-30",
    progress: 90,
  },
  {
    id: "task-5",
    projectId: "proj-1",
    title: "System Notification Bell Dropdown",
    description: "Create popover drawer for real-time leave and attendance alerts.",
    assigneeId: "emp-9", // James Taylor
    priority: "High",
    status: "In Progress",
    dueDate: "2026-08-29",
    progress: 60,
  },
];

// ---------- Announcements ----------

export const announcements: Announcement[] = [
  {
    id: "ann-1",
    title: "Q3 All-Hands Townhall Meeting",
    content: "Join us this Friday at 3:00 PM in the main conference hall or virtually via video call. Refreshments will be served.",
    category: "General",
    priority: "Important",
    postedBy: "emp-1", // Alex Morgan
    postedOn: "2026-08-24",
    targetDepartment: "All",
  },
  {
    id: "ann-2",
    title: "Updated Annual Leave Request Policy",
    content: "Please ensure all leave requests for the upcoming holiday season are submitted at least 7 days in advance.",
    category: "Policy",
    priority: "General",
    postedBy: "emp-4", // Marcus Chen
    postedOn: "2026-08-20",
    targetDepartment: "All",
  },
  {
    id: "ann-3",
    title: "Scheduled IT Server Maintenance",
    content: "Internal systems will undergo maintenance on Saturday between 1:00 AM and 4:00 AM. Intermittent downtime expected.",
    category: "IT Alert",
    priority: "Urgent",
    postedBy: "emp-2", // Sophia Rodriguez
    postedOn: "2026-08-25",
    targetDepartment: "All",
  },
];

// ---------- Notifications ----------

export const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Leave Request Approved",
    message: "Your annual leave for 3 days starting Sep 5 has been approved by Marcus Chen.",
    timestamp: "10 mins ago",
    read: false,
    category: "Leave",
    link: "/leave",
  },
  {
    id: "notif-2",
    title: "New Task Assigned",
    message: "You were assigned to 'Redesign Executive Dashboard UI' in project Enterprise ERP v2.",
    timestamp: "1 hour ago",
    read: false,
    category: "Task",
    link: "/projects",
  },
  {
    id: "notif-3",
    title: "Upcoming Birthday Alert",
    message: "Sophia Rodriguez (IT) is celebrating a birthday tomorrow!",
    timestamp: "3 hours ago",
    read: true,
    category: "Birthday",
    link: "/employees",
  },
  {
    id: "notif-4",
    title: "Attendance Punch Reminder",
    message: "Remember to log your check-out time before leaving today.",
    timestamp: "Yesterday",
    read: true,
    category: "Attendance",
    link: "/attendance",
  },
];

