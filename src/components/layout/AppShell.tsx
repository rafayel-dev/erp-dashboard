"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileNav from "./MobileNav";
import { useAppData } from "@/context/AppDataContext";

export default function AppShell({ children }: { children: ReactNode }) {
  const { sessionChecked, session } = useAppData();
  const router = useRouter();

  useEffect(() => {
    if (sessionChecked && !session) router.replace("/login");
  }, [sessionChecked, session, router]);

  if (!sessionChecked || !session) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <MobileNav />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
