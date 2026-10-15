"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toLocalDateStr as todayStr } from "@/lib/format";
import { applyLeaveDecision, buildLeaveApprovalSteps, deriveLeaveStatus, findShift, isAdminOrHR } from "@/lib/hr";
import { buildPayrollRecord } from "@/lib/payroll";
import {
  advanceRequests as initialAdvanceRequests,
  assets as initialAssets,
  attendanceHistory as initialAttendance,
  attendanceIssues as initialAttendanceIssues,
  documents as initialDocuments,
  employees as initialEmployees,
  leaveRequests as initialLeaveRequests,
  announcements as initialAnnouncements,
  initialNotifications,
  payrollRecords as initialPayrollRecords,
  performanceReviews as initialPerformanceReviews,
  projects as initialProjects,
  shifts as initialShifts,
  tasks as initialTasks,
  initialExpenses,
  initialTickets,
} from "@/lib/mockData";
import type {
  AdvanceRequest,
  AdvanceStatus,
  Announcement,
  Asset,
  AssetStatus,
  AttendanceIssue,
  AttendanceRecord,
  AttendanceStatus,
  CompanyDocument,
  Employee,
  KpiItem,
  LeaveRequest,
  NotificationItem,
  PayrollRecord,
  PerformanceReview,
  Project,
  PunchMethod,
  ReviewStatus,
  Shift,
  Task,
  TaskStatus,
  ExpenseClaim,
  ExpenseStatus,
  SupportTicket,
  TicketStatus,
} from "@/types";

const SESSION_KEY = "erp_demo_session_employee_id";

/** patch.checkIn/checkOut are "HH:MM" (or null to clear); combined with the
 *  record's own date into a full ISO datetime, same shape checkIn/checkOut
 *  already use everywhere else. */
export interface AttendanceCorrection {
  checkIn?: string | null;
  checkOut?: string | null;
  status?: AttendanceStatus;
}

function combineDateTime(dateStr: string, time: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm).toISOString();
}

interface AppDataContextValue {
  employees: Employee[];
  attendance: AttendanceRecord[];
  attendanceIssues: AttendanceIssue[];
  leaveRequests: LeaveRequest[];
  payrollRecords: PayrollRecord[];
  advanceRequests: AdvanceRequest[];
  assets: Asset[];
  documents: CompanyDocument[];
  performanceReviews: PerformanceReview[];
  shifts: Shift[];
  projects: Project[];
  tasks: Task[];
  announcements: Announcement[];
  notifications: NotificationItem[];
  expenses: ExpenseClaim[];
  tickets: SupportTicket[];

  /** Whether we've finished checking localStorage for a saved session. */
  sessionChecked: boolean;
  /** The actually-logged-in employee, or null if signed out. */
  session: Employee | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;

  /**
   * Who the UI is acting as: normally the logged-in `session`, but Admin/HR
   * can preview the app as someone else via `setActiveEmployeeId`
   * (see `isImpersonating`). This is a UI convenience, not a real identity
   * switch — every mutation below still just writes to local mock state.
   */
  activeEmployeeId: string;
  activeEmployee: Employee;
  isImpersonating: boolean;
  setActiveEmployeeId: (id: string) => void;
  stopImpersonating: () => void;

  todaysAttendanceFor: (employeeId: string) => AttendanceRecord | undefined;
  checkIn: (
    employeeId: string,
    method?: PunchMethod,
    locationData?: { latitude: number; longitude: number; isWithinRadius: boolean; distanceMeters: number }
  ) => void;
  checkOut: (
    employeeId: string,
    method?: PunchMethod,
    locationData?: { latitude: number; longitude: number; isWithinRadius: boolean; distanceMeters: number }
  ) => void;
  /** Direct correction to a given day's record (creates one if missing) —
   *  for Admin/HR/Manager fixing a mistake, with or without a linked issue. */
  correctAttendance: (employeeId: string, date: string, patch: AttendanceCorrection) => void;
  raiseAttendanceIssue: (
    data: Omit<
      AttendanceIssue,
      "id" | "status" | "raisedOn" | "resolvedBy" | "resolvedOn" | "resolutionNote"
    >
  ) => void;
  resolveAttendanceIssue: (
    issue: AttendanceIssue,
    decision: "Resolved" | "Rejected",
    resolverId: string,
    note: string,
    correction?: AttendanceCorrection
  ) => void;

  addEmployee: (
    data: Omit<Employee, "id" | "employeeCode" | "avatarColor">
  ) => void;
  updateEmployee: (id: string, patch: Partial<Omit<Employee, "id" | "employeeCode">>) => void;
  assignShift: (employeeId: string, shiftId: string) => void;

  /** Marks a Pending payslip as Paid (sets paidOn to today). */
  markPayrollPaid: (id: string) => void;
  /** Creates Pending payslips for every employee missing one for `month`,
   *  reusing each employee's most recent basic salary. No-op per employee
   *  if they already have a record for that month. */
  generatePayrollForMonth: (month: string) => void;

  addShift: (data: Omit<Shift, "id">) => void;
  updateShift: (id: string, patch: Partial<Omit<Shift, "id">>) => void;
  /** Returns false (no-op) if any employee is still on this shift. */
  deleteShift: (id: string) => boolean;

  applyLeave: (
    data: Omit<LeaveRequest, "id" | "status" | "appliedOn" | "approvalSteps">
  ) => void;
  /** Act on whichever approval step is currently active for this request. */
  actOnLeave: (
    id: string,
    decision: "Approved" | "Rejected",
    actorId: string,
    comment?: string
  ) => void;

  requestAdvance: (data: Omit<AdvanceRequest, "id" | "status" | "requestedOn">) => void;
  updateAdvanceStatus: (id: string, status: AdvanceStatus) => void;

  addAsset: (data: Omit<Asset, "id">) => void;
  assignAsset: (assetId: string, employeeId: string) => void;
  returnAsset: (assetId: string) => void;
  updateAssetStatus: (assetId: string, status: AssetStatus) => void;

  addDocument: (data: Omit<CompanyDocument, "id" | "uploadedOn">) => void;
  deleteDocument: (id: string) => void;

  addReview: (
    data: Omit<PerformanceReview, "id" | "createdOn" | "overallRating"> & {
      kpis: KpiItem[];
    }
  ) => void;
  updateReviewStatus: (id: string, status: ReviewStatus) => void;
  setEmployeeComments: (id: string, comment: string) => void;

  addTask: (data: Omit<Task, "id" | "progress">) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  addAnnouncement: (data: Omit<Announcement, "id" | "postedOn">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  addExpense: (data: Omit<ExpenseClaim, "id" | "status" | "submittedOn">) => void;
  updateExpenseStatus: (id: string, status: ExpenseStatus, approverId?: string) => void;
  addTicket: (data: Omit<SupportTicket, "id" | "ticketCode" | "status" | "createdAt">) => void;
  updateTicketStatus: (id: string, status: TicketStatus) => void;
  resetAllData: () => void;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(
  undefined
);

const avatarPalette = [
  "#6366F1",
  "#0EA5E9",
  "#F59E0B",
  "#10B981",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
];

function averageScore(kpis: KpiItem[]): number {
  if (kpis.length === 0) return 0;
  const sum = kpis.reduce((acc, k) => acc + k.score, 0);
  return Math.round((sum / kpis.length) * 10) / 10;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [attendance, setAttendance] =
    useState<AttendanceRecord[]>(initialAttendance);
  const [attendanceIssues, setAttendanceIssues] = useState<AttendanceIssue[]>(
    initialAttendanceIssues
  );
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(
    initialLeaveRequests
  );
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(initialPayrollRecords);
  const [advanceRequests, setAdvanceRequests] = useState<AdvanceRequest[]>(
    initialAdvanceRequests
  );
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [documents, setDocuments] = useState<CompanyDocument[]>(initialDocuments);
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>(
    initialPerformanceReviews
  );
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [projects] = useState<Project[]>(initialProjects);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [expenses, setExpenses] = useState<ExpenseClaim[]>(initialExpenses);
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);

  // ---- Auth & Persistence (demo-only localStorage synchronization) ----
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [viewAsId, setViewAsId] = useState<string | null>(null);
  const isHydrated = useRef(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SESSION_KEY);
      if (saved) setSessionId(saved);

      const load = <T,>(key: string, setter: (val: T) => void) => {
        const item = window.localStorage.getItem(`erp_persist_${key}`);
        if (item) {
          try {
            setter(JSON.parse(item));
          } catch {}
        }
      };

      load("employees", setEmployees);
      load("attendance", setAttendance);
      load("leaveRequests", setLeaveRequests);
      load("payrollRecords", setPayrollRecords);
      load("advanceRequests", setAdvanceRequests);
      load("assets", setAssets);
      load("tasks", setTasks);
      load("expenses", setExpenses);
      load("tickets", setTickets);
      load("performanceReviews", setPerformanceReviews);
    } finally {
      setSessionChecked(true);
      isHydrated.current = true;
    }
  }, []);

  useEffect(() => {
    if (!isHydrated.current) return;
    try {
      window.localStorage.setItem("erp_persist_employees", JSON.stringify(employees));
      window.localStorage.setItem("erp_persist_attendance", JSON.stringify(attendance));
      window.localStorage.setItem("erp_persist_leaveRequests", JSON.stringify(leaveRequests));
      window.localStorage.setItem("erp_persist_advanceRequests", JSON.stringify(advanceRequests));
      window.localStorage.setItem("erp_persist_payrollRecords", JSON.stringify(payrollRecords));
      window.localStorage.setItem("erp_persist_tasks", JSON.stringify(tasks));
      window.localStorage.setItem("erp_persist_expenses", JSON.stringify(expenses));
      window.localStorage.setItem("erp_persist_tickets", JSON.stringify(tickets));
      window.localStorage.setItem("erp_persist_performanceReviews", JSON.stringify(performanceReviews));
    } catch {}
  }, [employees, attendance, leaveRequests, advanceRequests, payrollRecords, tasks, expenses, tickets, performanceReviews]);

  const resetAllData = useCallback(() => {
    if (typeof window !== "undefined") {
      Object.keys(window.localStorage).forEach((key) => {
        if (key.startsWith("erp_persist_") || key === SESSION_KEY) {
          window.localStorage.removeItem(key);
        }
      });
      window.location.reload();
    }
  }, []);

  const session = useMemo(
    () => (sessionId ? employees.find((e) => e.id === sessionId) ?? null : null),
    [employees, sessionId]
  );

  const login = useCallback(
    (email: string, password: string): boolean => {
      const emp = employees.find(
        (e) => e.email.trim().toLowerCase() === email.trim().toLowerCase()
      );
      // Demo-only check: the mock "password" is just the employee code.
      // There is no real credential store — see AGENTS/README notes.
      if (!emp || password.trim().toUpperCase() !== emp.employeeCode.toUpperCase()) {
        return false;
      }
      setSessionId(emp.id);
      setViewAsId(null);
      window.localStorage.setItem(SESSION_KEY, emp.id);
      return true;
    },
    [employees]
  );

  const logout = useCallback(() => {
    setSessionId(null);
    setViewAsId(null);
    window.localStorage.removeItem(SESSION_KEY);
  }, []);

  const setActiveEmployeeId = useCallback(
    (id: string) => {
      if (session && isAdminOrHR(session.role)) setViewAsId(id);
    },
    [session]
  );

  const stopImpersonating = useCallback(() => setViewAsId(null), []);

  const activeEmployee = useMemo(() => {
    if (session && viewAsId && isAdminOrHR(session.role)) {
      return employees.find((e) => e.id === viewAsId) ?? session;
    }
    return session ?? employees[0];
  }, [employees, session, viewAsId]);

  const isImpersonating = !!(
    session &&
    viewAsId &&
    viewAsId !== session.id &&
    isAdminOrHR(session.role)
  );

  const todaysAttendanceFor = useCallback(
    (employeeId: string) => {
      const t = todayStr();
      return attendance.find(
        (a) => a.employeeId === employeeId && a.date === t
      );
    },
    [attendance]
  );

  const checkIn = useCallback(
    (
      employeeId: string,
      method: PunchMethod = "Manual",
      locationData?: { latitude: number; longitude: number; isWithinRadius: boolean; distanceMeters: number }
    ) => {
      const now = new Date();
      const t = todayStr();
      const employee = employees.find((e) => e.id === employeeId);
      const shift = findShift(shifts, employee?.shiftId ?? shifts[0]?.id ?? "");
      const [startH, startM] = shift.startTime.split(":").map(Number);
      const cutoff = new Date(now);
      cutoff.setHours(startH, startM + shift.graceMinutes, 0, 0);
      const isLate = now > cutoff;

      setAttendance((prev) => {
        const existing = prev.find(
          (a) => a.employeeId === employeeId && a.date === t
        );
        if (existing) return prev;
        const record: AttendanceRecord = {
          id: `att-${t}-${employeeId}`,
          employeeId,
          date: t,
          checkIn: now.toISOString(),
          checkOut: null,
          status: isLate ? "Late" : "Present",
          punchMethod: method,
          location: locationData,
        };
        return [record, ...prev];
      });
    },
    [employees, shifts]
  );

  const checkOut = useCallback(
    (
      employeeId: string,
      method?: PunchMethod,
      locationData?: { latitude: number; longitude: number; isWithinRadius: boolean; distanceMeters: number }
    ) => {
      const now = new Date();
      const t = todayStr();
      setAttendance((prev) =>
        prev.map((a) =>
          a.employeeId === employeeId && a.date === t
            ? {
                ...a,
                checkOut: now.toISOString(),
                ...(method ? { punchMethod: method } : {}),
                ...(locationData ? { location: locationData } : {}),
              }
            : a
        )
      );
    },
    []
  );

  const correctAttendance = useCallback(
    (employeeId: string, date: string, patch: AttendanceCorrection) => {
      setAttendance((prev) => {
        const idx = prev.findIndex((a) => a.employeeId === employeeId && a.date === date);
        const checkInIso =
          patch.checkIn === undefined
            ? undefined
            : patch.checkIn
              ? combineDateTime(date, patch.checkIn)
              : null;
        const checkOutIso =
          patch.checkOut === undefined
            ? undefined
            : patch.checkOut
              ? combineDateTime(date, patch.checkOut)
              : null;

        if (idx === -1) {
          const record: AttendanceRecord = {
            id: `att-${date}-${employeeId}`,
            employeeId,
            date,
            checkIn: checkInIso ?? null,
            checkOut: checkOutIso ?? null,
            status: patch.status ?? "Present",
          };
          return [record, ...prev];
        }
        return prev.map((a, i) =>
          i === idx
            ? {
                ...a,
                ...(checkInIso !== undefined ? { checkIn: checkInIso } : {}),
                ...(checkOutIso !== undefined ? { checkOut: checkOutIso } : {}),
                ...(patch.status ? { status: patch.status } : {}),
              }
            : a
        );
      });
    },
    []
  );

  const raiseAttendanceIssue = useCallback(
    (
      data: Omit<
        AttendanceIssue,
        "id" | "status" | "raisedOn" | "resolvedBy" | "resolvedOn" | "resolutionNote"
      >
    ) => {
      setAttendanceIssues((prev) => [
        {
          ...data,
          id: `iss-${Date.now()}`,
          status: "Open",
          raisedOn: todayStr(),
          resolvedBy: null,
          resolvedOn: null,
          resolutionNote: "",
        },
        ...prev,
      ]);
    },
    []
  );

  const resolveAttendanceIssue = useCallback(
    (
      issue: AttendanceIssue,
      decision: "Resolved" | "Rejected",
      resolverId: string,
      note: string,
      correction?: AttendanceCorrection
    ) => {
      setAttendanceIssues((prev) =>
        prev.map((i) =>
          i.id === issue.id
            ? { ...i, status: decision, resolvedBy: resolverId, resolvedOn: todayStr(), resolutionNote: note }
            : i
        )
      );
      if (decision === "Resolved" && correction) {
        correctAttendance(issue.employeeId, issue.date, correction);
      }
    },
    [correctAttendance]
  );

  const addEmployee = useCallback(
    (data: Omit<Employee, "id" | "employeeCode" | "avatarColor">) => {
      setEmployees((prev) => {
        const nextIndex = prev.length + 1;
        const newEmployee: Employee = {
          ...data,
          id: `emp-${Date.now()}`,
          employeeCode: `RMNR-${String(1000 + nextIndex)}`,
          avatarColor: avatarPalette[nextIndex % avatarPalette.length],
        };
        return [...prev, newEmployee];
      });
    },
    []
  );

  const updateEmployee = useCallback(
    (id: string, patch: Partial<Omit<Employee, "id" | "employeeCode">>) => {
      setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    },
    []
  );

  const assignShift = useCallback(
    (employeeId: string, shiftId: string) => {
      setEmployees((prev) =>
        prev.map((e) => (e.id === employeeId ? { ...e, shiftId } : e))
      );
    },
    []
  );

  const markPayrollPaid = useCallback((id: string) => {
    setPayrollRecords((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "Paid", paidOn: todayStr() } : p))
    );
  }, []);

  const generatePayrollForMonth = useCallback(
    (month: string) => {
      setPayrollRecords((prev) => {
        const covered = new Set(
          prev.filter((p) => p.month === month).map((p) => p.employeeId)
        );
        const additions: PayrollRecord[] = [];
        for (const emp of employees) {
          if (covered.has(emp.id)) continue;
          const latest = prev
            .filter((p) => p.employeeId === emp.id)
            .sort((a, b) => (a.month < b.month ? 1 : -1))[0];
          const basicSalary = latest?.basicSalary ?? 4000;
          additions.push(buildPayrollRecord(emp.id, month, basicSalary, "Pending", null));
        }
        return additions.length > 0 ? [...prev, ...additions] : prev;
      });
    },
    [employees]
  );

  const addShift = useCallback((data: Omit<Shift, "id">) => {
    setShifts((prev) => [...prev, { ...data, id: `shift-${Date.now()}` }]);
  }, []);

  const updateShift = useCallback((id: string, patch: Partial<Omit<Shift, "id">>) => {
    setShifts((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const deleteShift = useCallback(
    (id: string): boolean => {
      const inUse = employees.some((e) => e.shiftId === id);
      if (inUse) return false;
      setShifts((prev) => prev.filter((s) => s.id !== id));
      return true;
    },
    [employees]
  );

  const applyLeave = useCallback(
    (data: Omit<LeaveRequest, "id" | "status" | "appliedOn" | "approvalSteps">) => {
      const applicant = employees.find((e) => e.id === data.employeeId);
      const approvalSteps = applicant ? buildLeaveApprovalSteps(applicant, employees) : [];
      setLeaveRequests((prev) => [
        {
          ...data,
          id: `lv-${Date.now()}`,
          status: deriveLeaveStatus(approvalSteps),
          appliedOn: todayStr(),
          approvalSteps,
        },
        ...prev,
      ]);
    },
    [employees]
  );

  const actOnLeave = useCallback(
    (id: string, decision: "Approved" | "Rejected", actorId: string, comment = "") => {
      setLeaveRequests((prev) =>
        prev.map((lv) => {
          if (lv.id !== id) return lv;
          const approvalSteps = applyLeaveDecision(lv.approvalSteps, decision, actorId, comment);
          return { ...lv, approvalSteps, status: deriveLeaveStatus(approvalSteps) };
        })
      );
    },
    []
  );

  const requestAdvance = useCallback(
    (data: Omit<AdvanceRequest, "id" | "status" | "requestedOn">) => {
      setAdvanceRequests((prev) => [
        {
          ...data,
          id: `adv-${Date.now()}`,
          status: "Pending",
          requestedOn: todayStr(),
        },
        ...prev,
      ]);
    },
    []
  );

  const updateAdvanceStatus = useCallback((id: string, status: AdvanceStatus) => {
    setAdvanceRequests((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  }, []);

  const addAsset = useCallback((data: Omit<Asset, "id">) => {
    setAssets((prev) => [{ ...data, id: `ast-${Date.now()}` }, ...prev]);
  }, []);

  const assignAsset = useCallback((assetId: string, employeeId: string) => {
    setAssets((prev) =>
      prev.map((a) =>
        a.id === assetId
          ? { ...a, status: "Allocated", assignedTo: employeeId, assignedOn: todayStr() }
          : a
      )
    );
  }, []);

  const returnAsset = useCallback((assetId: string) => {
    setAssets((prev) =>
      prev.map((a) =>
        a.id === assetId ? { ...a, status: "Available", assignedTo: null, assignedOn: null } : a
      )
    );
  }, []);

  const updateAssetStatus = useCallback((assetId: string, status: AssetStatus) => {
    setAssets((prev) =>
      prev.map((a) =>
        a.id === assetId
          ? {
              ...a,
              status,
              ...(status === "Available" || status === "Retired"
                ? { assignedTo: null, assignedOn: null }
                : {}),
            }
          : a
      )
    );
  }, []);

  const addDocument = useCallback((data: Omit<CompanyDocument, "id" | "uploadedOn">) => {
    setDocuments((prev) => [
      { ...data, id: `doc-${Date.now()}`, uploadedOn: todayStr() },
      ...prev,
    ]);
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const addReview = useCallback(
    (
      data: Omit<PerformanceReview, "id" | "createdOn" | "overallRating"> & {
        kpis: KpiItem[];
      }
    ) => {
      setPerformanceReviews((prev) => [
        {
          ...data,
          id: `rev-${Date.now()}`,
          overallRating: averageScore(data.kpis),
          createdOn: todayStr(),
        },
        ...prev,
      ]);
    },
    []
  );

  const updateReviewStatus = useCallback((id: string, status: ReviewStatus) => {
    setPerformanceReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  }, []);

  const setEmployeeComments = useCallback((id: string, comment: string) => {
    setPerformanceReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, employeeComments: comment, status: "Acknowledged" } : r
      )
    );
  }, []);

  const addTask = useCallback((data: Omit<Task, "id" | "progress">) => {
    setTasks((prev) => [
      {
        ...data,
        id: `task-${Date.now()}`,
        progress: data.status === "Completed" ? 100 : 25,
      },
      ...prev,
    ]);
  }, []);

  const updateTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status, progress: status === "Completed" ? 100 : t.progress }
          : t
      )
    );
  }, []);

  const addAnnouncement = useCallback((data: Omit<Announcement, "id" | "postedOn">) => {
    setAnnouncements((prev) => [
      {
        ...data,
        id: `ann-${Date.now()}`,
        postedOn: todayStr(),
      },
      ...prev,
    ]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const addExpense = useCallback(
    (data: Omit<ExpenseClaim, "id" | "status" | "submittedOn">) => {
      const newClaim: ExpenseClaim = {
        ...data,
        id: `exp-${Date.now()}`,
        status: "Pending",
        submittedOn: todayStr(),
      };
      setExpenses((prev) => [newClaim, ...prev]);
    },
    []
  );

  const updateExpenseStatus = useCallback(
    (id: string, status: ExpenseStatus, approverId?: string) => {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                status,
                approvedBy: approverId ?? e.approvedBy,
                approvedOn: status === "Approved" || status === "Reimbursed" ? todayStr() : e.approvedOn,
              }
            : e
        )
      );
    },
    []
  );

  const addTicket = useCallback(
    (data: Omit<SupportTicket, "id" | "ticketCode" | "status" | "createdAt">) => {
      const newTicket: SupportTicket = {
        ...data,
        id: `tkt-${Date.now()}`,
        ticketCode: `TKT-${Math.floor(100 + Math.random() * 900)}`,
        status: "Open",
        createdAt: new Date().toISOString(),
      };
      setTickets((prev) => [newTicket, ...prev]);
    },
    []
  );

  const updateTicketStatus = useCallback((id: string, status: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              resolvedAt: status === "Resolved" ? new Date().toISOString() : null,
            }
          : t
      )
    );
  }, []);

  const value = useMemo<AppDataContextValue>(
    () => ({
      employees,
      attendance,
      attendanceIssues,
      leaveRequests,
      payrollRecords,
      advanceRequests,
      assets,
      documents,
      performanceReviews,
      shifts,
      projects,
      tasks,
      announcements,
      notifications,
      expenses,
      tickets,
      sessionChecked,
      session,
      login,
      logout,
      activeEmployeeId: activeEmployee.id,
      activeEmployee,
      isImpersonating,
      setActiveEmployeeId,
      stopImpersonating,
      todaysAttendanceFor,
      checkIn,
      checkOut,
      correctAttendance,
      raiseAttendanceIssue,
      resolveAttendanceIssue,
      addEmployee,
      updateEmployee,
      assignShift,
      markPayrollPaid,
      generatePayrollForMonth,
      addShift,
      updateShift,
      deleteShift,
      applyLeave,
      actOnLeave,
      requestAdvance,
      updateAdvanceStatus,
      addAsset,
      assignAsset,
      returnAsset,
      updateAssetStatus,
      addDocument,
      deleteDocument,
      addReview,
      updateReviewStatus,
      setEmployeeComments,
      addTask,
      updateTaskStatus,
      addAnnouncement,
      markNotificationRead,
      markAllNotificationsRead,
      addExpense,
      updateExpenseStatus,
      addTicket,
      updateTicketStatus,
      resetAllData,
    }),
    [
      employees,
      attendance,
      attendanceIssues,
      leaveRequests,
      payrollRecords,
      advanceRequests,
      assets,
      documents,
      performanceReviews,
      shifts,
      projects,
      tasks,
      announcements,
      notifications,
      expenses,
      tickets,
      sessionChecked,
      session,
      login,
      logout,
      activeEmployee,
      isImpersonating,
      setActiveEmployeeId,
      stopImpersonating,
      todaysAttendanceFor,
      checkIn,
      checkOut,
      correctAttendance,
      raiseAttendanceIssue,
      resolveAttendanceIssue,
      addEmployee,
      updateEmployee,
      assignShift,
      markPayrollPaid,
      generatePayrollForMonth,
      addShift,
      updateShift,
      deleteShift,
      applyLeave,
      actOnLeave,
      requestAdvance,
      updateAdvanceStatus,
      addAsset,
      assignAsset,
      returnAsset,
      updateAssetStatus,
      addDocument,
      deleteDocument,
      addReview,
      updateReviewStatus,
      setEmployeeComments,
      addTask,
      updateTaskStatus,
      addAnnouncement,
      markNotificationRead,
      markAllNotificationsRead,
      addExpense,
      updateExpenseStatus,
      addTicket,
      updateTicketStatus,
      resetAllData,
    ]
  );

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return ctx;
}
