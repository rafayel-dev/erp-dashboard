"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { useAppData } from "@/context/AppDataContext";
import { useNow } from "@/hooks/useNow";
import { formatShiftTime, formatTime } from "@/lib/format";
import { findShift } from "@/lib/hr";
import { getUserLocation, OFFICE_HQ, type GeoLocationData } from "@/lib/geo";
import type { AttendanceStatus } from "@/types";

const TARGET_HOURS = 8;
const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const statusStyles: Record<AttendanceStatus, string> = {
  Present: "bg-emerald-600",
  Late: "bg-amber-500",
  "On Leave": "bg-amber-500",
  Absent: "bg-rose-600",
};

const ringColor: Record<AttendanceStatus, string> = {
  Present: "#10B981",
  Late: "#F59E0B",
  "On Leave": "#F59E0B",
  Absent: "#E2E8F0",
};

export default function AttendancePunchCard({
  employeeId,
}: {
  employeeId: string;
}) {
  const { employees, shifts, todaysAttendanceFor, checkIn, checkOut } = useAppData();
  const now = useNow(1000);
  const record = todaysAttendanceFor(employeeId);
  const employee = employees.find((e) => e.id === employeeId);
  const shift = findShift(shifts, employee?.shiftId ?? shifts[0]?.id ?? "");
  const status: AttendanceStatus | null = record?.status ?? null;

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [geoData, setGeoData] = useState<GeoLocationData | null>(null);
  const [loadingGeo, setLoadingGeo] = useState(false);

  let elapsedHours = 0;
  if (record?.checkIn) {
    const end = record.checkOut ? new Date(record.checkOut) : now ?? new Date(record.checkIn);
    elapsedHours = Math.max(
      0,
      (end.getTime() - new Date(record.checkIn).getTime()) / (1000 * 60 * 60)
    );
  }
  const pct = Math.min(1, elapsedHours / TARGET_HOURS);
  const hrs = Math.floor(elapsedHours);
  const mins = Math.floor((elapsedHours - hrs) * 60);

  async function handleGeoCheckIn() {
    setLoadingGeo(true);
    const loc = await getUserLocation();
    setGeoData(loc);
    setLoadingGeo(false);
    checkIn(employeeId, "Geo-Fenced", loc);
  }

  async function handleGeoCheckOut() {
    setLoadingGeo(true);
    const loc = await getUserLocation();
    setGeoData(loc);
    setLoadingGeo(false);
    checkOut(employeeId, "Geo-Fenced", loc);
  }

  function handleQrScanCheckIn() {
    const dummyLoc: GeoLocationData = {
      latitude: OFFICE_HQ.latitude,
      longitude: OFFICE_HQ.longitude,
      isWithinRadius: true,
      distanceMeters: 5,
    };
    checkIn(employeeId, "QR Scan", dummyLoc);
    setIsQrModalOpen(false);
  }

  return (
    <>
      <Card className="flex h-full flex-col">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">My Attendance</h2>
          <span className="text-[10px] font-semibold text-slate-500">
            {shift.name}: {formatShiftTime(shift.startTime)} – {formatShiftTime(shift.endTime)}
          </span>
        </div>

        {/* GPS Verification Badge */}
        <div className="mt-2.5 flex items-center justify-between rounded-xl bg-slate-50 px-2.5 py-1.5 border border-slate-200/60">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
            <span className="animate-pulse text-emerald-500">📍</span>
            <span>HQ Office Radius</span>
          </div>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            {record?.location
              ? `${record.location.distanceMeters}m (${record.punchMethod})`
              : "500m Geo-Fence Active"}
          </span>
        </div>

        <div className="mt-3 text-center">
          <p className="text-2xl font-bold tabular-nums text-slate-900">
            {now
              ? now.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  second: "2-digit",
                })
              : "—"}
          </p>
          <p className="text-[11px] font-medium text-slate-400">
            {now?.toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="relative mx-auto mt-3 h-28 w-28">
          <svg viewBox="0 0 120 120" className="h-28 w-28 -rotate-90">
            <circle cx="60" cy="60" r={RADIUS} strokeWidth="10" fill="none" className="stroke-slate-100" />
            <circle
              cx="60"
              cy="60"
              r={RADIUS}
              strokeWidth="10"
              fill="none"
              stroke={status ? ringColor[status] : "#E2E8F0"}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - pct)}
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
              Today&rsquo;s Hours
            </span>
            <span className="text-base font-bold tabular-nums text-slate-900">
              {hrs}:{String(mins).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-1.5 text-xs">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-1.5">
            <span className="flex items-center gap-2 text-slate-500 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Punch In
            </span>
            <span className="font-bold text-slate-800">
              {formatTime(record?.checkIn ?? null)}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-1.5">
            <span className="flex items-center gap-2 text-slate-500 font-medium">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Punch Out
            </span>
            <span className="font-bold text-slate-800">
              {formatTime(record?.checkOut ?? null)}
            </span>
          </div>
        </div>

        {/* Punch Buttons */}
        <div className="mt-3 flex flex-col gap-2">
          {!record ? (
            <div className="flex gap-2">
              <button
                onClick={handleGeoCheckIn}
                disabled={loadingGeo}
                className="flex-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-indigo-700 disabled:bg-slate-200"
              >
                {loadingGeo ? "Fetching GPS..." : "📍 Geo Check-In"}
              </button>
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
                title="Scan QR Code"
              >
                📷 QR
              </button>
            </div>
          ) : (
            <button
              onClick={handleGeoCheckOut}
              disabled={!!record?.checkOut || loadingGeo}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-50 disabled:border-slate-200 disabled:text-slate-300"
            >
              {loadingGeo ? "Fetching GPS..." : "Check Out"}
            </button>
          )}
        </div>

        <div className="mt-3 text-center">
          <div
            className={`rounded-xl py-1.5 text-xs font-bold uppercase tracking-wider text-white ${
              status ? statusStyles[status] : "bg-slate-400"
            }`}
          >
            {status ?? "Please Check In"}
          </div>
        </div>
      </Card>

      {/* QR Code Attendance Modal */}
      <Modal open={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} title="Office QR Attendance Scanner">
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div className="relative flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-dashed border-indigo-500 bg-slate-900 p-4 shadow-inner">
            {/* Animated Laser Scanner Line */}
            <div className="absolute inset-x-2 top-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
            
            {/* Simulated QR Pattern */}
            <div className="grid grid-cols-4 gap-2 opacity-80">
              <div className="h-8 w-8 bg-white rounded-md" />
              <div className="h-8 w-8 bg-indigo-500 rounded-md" />
              <div className="h-8 w-8 bg-emerald-400 rounded-md" />
              <div className="h-8 w-8 bg-white rounded-md" />
              <div className="h-8 w-8 bg-emerald-400 rounded-md" />
              <div className="h-8 w-8 bg-white rounded-md" />
              <div className="h-8 w-8 bg-indigo-500 rounded-md" />
              <div className="h-8 w-8 bg-white rounded-md" />
            </div>
          </div>

          <p className="mt-4 text-xs font-semibold text-slate-700">
            Align camera with Office HQ Attendance QR Code
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            HQ Location: {OFFICE_HQ.name} (Dhaka HQ)
          </p>

          <button
            onClick={handleQrScanCheckIn}
            className="mt-5 w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700"
          >
            Simulate Scan &amp; Punch In
          </button>
        </div>
      </Modal>
    </>
  );
}
