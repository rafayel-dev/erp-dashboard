"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/context/AppDataContext";
import { inputClass } from "@/components/ui/Field";
import { companyName } from "@/lib/mockData";
import type { Role } from "@/types";

const demoRoles: Role[] = ["Admin", "HR", "Manager", "Employee"];

export default function LoginPage() {
  const { session, sessionChecked, login, employees } = useAppData();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showDemoList, setShowDemoList] = useState(false);

  // One representative account per role, for the quick-fill demo buttons.
  const demoAccounts = useMemo(
    () =>
      demoRoles
        .map((role) => employees.find((e) => e.role === role))
        .filter((e): e is NonNullable<typeof e> => !!e),
    [employees]
  );

  useEffect(() => {
    if (sessionChecked && session) router.replace("/");
  }, [sessionChecked, session, router]);

  function fillDemoAccount(emp: (typeof demoAccounts)[number]) {
    setEmail(emp.email);
    setPassword(emp.employeeCode);
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = login(email, password);
    if (!ok) {
      setError("Email or password is incorrect.");
      return;
    }
    setError("");
    router.replace("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white shadow-soft">
            {companyName.slice(0, 1)}
          </div>
          <h1 className="text-lg font-semibold text-text">{companyName}</h1>
          <p className="text-sm text-text-muted">Sign in to Office ERP</p>
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-center text-xs text-text-muted">
            Quick demo login — pick a role to fill the form
          </p>
          <div className="grid grid-cols-4 gap-2">
            {demoAccounts.map((emp) => (
              <button
                key={emp.id}
                type="button"
                onClick={() => fillDemoAccount(emp)}
                className="rounded-lg border border-border bg-surface px-2 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-primary/40 hover:bg-primary-soft hover:text-primary-soft-text"
              >
                {emp.role}
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-border bg-surface p-6 shadow-soft"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-text">
              Email
            </label>
            <input
              required
              type="email"
              autoComplete="username"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@rmnr.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text">
              Password
            </label>
            <input
              required
              type="password"
              autoComplete="current-password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Employee ID, e.g. RMNR-1001"
            />
          </div>

          {error && <p className="text-sm text-danger-strong">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-hover"
          >
            Sign In
          </button>
        </form>

        <div className="mt-4 rounded-xl border border-dashed border-border-strong bg-surface p-4 text-xs text-text-muted">
          <p className="font-medium text-text">
            This is a frontend-only demo — there is no real backend or
            credential store.
          </p>
          <p className="mt-1">
            Sign in with any employee&rsquo;s email and their Employee ID as
            the password.
          </p>
          <button
            type="button"
            onClick={() => setShowDemoList((v) => !v)}
            className="mt-2 font-medium text-primary hover:text-primary-hover"
          >
            {showDemoList ? "Hide" : "Show"} demo accounts
          </button>
          {showDemoList && (
            <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto border-t border-border pt-2">
              {employees.map((emp) => (
                <li key={emp.id} className="flex items-center justify-between gap-2">
                  <span className="truncate text-text-muted">{emp.email}</span>
                  <span className="shrink-0 font-mono text-text-faint">
                    {emp.employeeCode}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
