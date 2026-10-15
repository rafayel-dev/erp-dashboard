"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAppData } from "@/context/AppDataContext";

export default function NotificationPopover() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppData();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 active:scale-95 shadow-2xs cursor-pointer"
        aria-label="Notifications"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs ring-2 ring-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-soft-lg backdrop-blur-2xl z-50 animate-slide-up">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 ring-1 ring-brand-500/20">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllNotificationsRead()}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="mt-2 max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No notifications right now.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markNotificationRead(item.id)}
                  className={`group flex items-start gap-3 py-3 px-2 transition-colors rounded-xl cursor-pointer ${
                    !item.read ? "bg-indigo-50/50 hover:bg-indigo-50" : "hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      item.category === "Leave"
                        ? "bg-amber-100 text-amber-700"
                        : item.category === "Task"
                        ? "bg-indigo-100 text-indigo-700"
                        : item.category === "Birthday"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {item.category[0]}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-xs font-medium ${
                          !item.read ? "text-slate-900 font-semibold" : "text-slate-700"
                        }`}
                      >
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    {item.link && (
                      <Link
                        href={item.link}
                        onClick={() => setIsOpen(false)}
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        View details &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
