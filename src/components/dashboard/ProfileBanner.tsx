import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { companyName } from "@/lib/mockData";
import { formatDate } from "@/lib/format";
import { greeting, serviceLength } from "@/lib/hr";
import type { Employee } from "@/types";
import {
  CreditCard,
  Mail,
  Briefcase,
  Users,
  User,
  Phone,
  Calendar,
  Building2,
  Clock,
  Sparkles,
} from "lucide-react";

export default function ProfileBanner({
  employee,
  supervisor,
}: {
  employee: Employee;
  supervisor: Employee | undefined;
}) {
  return (
    <Card className="relative overflow-hidden border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50/70 p-6 shadow-soft">
      {/* Decorative ambient background glows */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-brand-500/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-purple-500/5 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Avatar & Identity */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar
              name={employee.name}
              color={employee.avatarColor}
              size={64}
              className="ring-4 ring-white shadow-md ring-offset-2 ring-offset-brand-50"
            />
            <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50/80 px-2.5 py-0.5 text-xs font-bold text-brand-700 ring-1 ring-brand-500/20">
              <Sparkles className="h-3 w-3 text-brand-500" />
              <span>{greeting()}, {employee.name.split(" ")[0]}</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 mt-1">
              {employee.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge label={employee.status} />
              <Badge label={employee.role} />
              <span className="text-[11px] font-semibold text-slate-400">·</span>
              <span className="text-xs font-medium text-slate-500">{employee.position}</span>
            </div>
          </div>
        </div>

        {/* Right: Info grid in sleek glass cards */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-5 border-t border-slate-100 pt-5 lg:border-t-0 lg:pt-0">
          <InfoItem label="ID Code" value={employee.employeeCode} icon={CreditCard} />
          <InfoItem label="Email" value={employee.email} icon={Mail} />
          <InfoItem label="Contract" value={employee.employmentStatus} icon={Briefcase} />
          <InfoItem label="Lead" value={supervisor ? supervisor.name : "—"} icon={Users} />
          <InfoItem label="Department" value={employee.department} icon={Building2} />
          <InfoItem label="Tenure" value={serviceLength(employee.dateJoined)} icon={Clock} />
          <InfoItem label="Joined" value={formatDate(employee.dateJoined)} icon={Calendar} />
          <InfoItem label="Mobile" value={employee.phone} icon={Phone} />
          <InfoItem label="Entity" value={companyName} icon={Building2} />
        </div>
      </div>
    </Card>
  );
}

function InfoItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="group flex items-start gap-2.5 rounded-xl border border-slate-200/60 bg-white/70 p-2.5 backdrop-blur-xs transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-2xs">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 border border-brand-500/15 transition-transform duration-200 group-hover:scale-105">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <span className="block truncate text-xs font-bold text-slate-800">
          {value}
        </span>
      </div>
    </div>
  );
}
