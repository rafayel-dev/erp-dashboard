"use client";

import type { ReactNode } from "react";

export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200/90 bg-white p-6 shadow-soft-lg animate-slide-up">
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-extrabold tracking-tight text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
