"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/context/AppDataContext";
import { companyName } from "@/lib/mockData";
import type { Role } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, KeyRound, Mail, LogIn, Sparkles, Shield, ChevronDown, ChevronUp } from "lucide-react";

const demoRoles: Role[] = ["Admin", "HR", "Finance", "IT Admin", "Manager", "Employee"];

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
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50/80 px-4 py-12">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/25 ring-1 ring-white/20">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{companyName}</h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Office ERP Enterprise Suite</p>
        </div>

        {/* Quick Role Fill Grid */}
        <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-soft backdrop-blur-xs">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Sparkles className="h-3.5 w-3.5 text-brand-500" />
              Quick Demo Fill
            </span>
            <span className="text-[10px] text-slate-400">Click to autofill credentials</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {demoAccounts.map((emp) => (
              <button
                key={emp.id}
                type="button"
                onClick={() => fillDemoAccount(emp)}
                className="group flex flex-col items-center justify-center rounded-xl border border-slate-200/70 bg-slate-50/70 p-2 text-center transition-all duration-150 hover:border-brand-500/40 hover:bg-brand-50/50 hover:shadow-2xs active:scale-98"
              >
                <span className="text-xs font-bold text-slate-800 group-hover:text-brand-600">
                  {emp.role}
                </span>
                <span className="mt-0.5 truncate text-[10px] text-slate-400 group-hover:text-brand-500/80">
                  {emp.name.split(" ")[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Box */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft"
        >
          <div>
            <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-700">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              Email Address
            </label>
            <Input
              required
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@rmnr.com"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-700">
              <KeyRound className="h-3.5 w-3.5 text-slate-400" />
              Password (Employee ID)
            </label>
            <Input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="e.g. RMNR-1001"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200/60">
              <Shield className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full">
            <LogIn className="h-4 w-4 mr-2" />
            Sign In to ERP
          </Button>
        </form>

        {/* Demo Footer Help */}
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white/60 p-4 text-xs text-slate-500">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Demo Access Guide</span>
            <button
              type="button"
              onClick={() => setShowDemoList((v) => !v)}
              className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700 hover:underline"
            >
              <span>{showDemoList ? "Hide Accounts" : "Show All Accounts"}</span>
              {showDemoList ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Sign in with any employee&rsquo;s email and Employee ID as password.
          </p>

          {showDemoList && (
            <div className="mt-3 max-h-48 space-y-1.5 overflow-y-auto border-t border-slate-100 pt-3">
              {employees.map((emp) => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => fillDemoAccount(emp)}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-[11px] text-slate-600 hover:bg-slate-100/80 transition-colors"
                >
                  <span className="font-medium text-slate-800">{emp.name} ({emp.role})</span>
                  <span className="font-mono text-[10px] text-slate-400">{emp.employeeCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
