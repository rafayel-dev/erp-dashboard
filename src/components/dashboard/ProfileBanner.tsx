import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { companyName } from "@/lib/mockData";
import { formatDate } from "@/lib/format";
import { greeting, serviceLength } from "@/lib/hr";
import type { Employee } from "@/types";

export default function ProfileBanner({
  employee,
  supervisor,
}: {
  employee: Employee;
  supervisor: Employee | undefined;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={employee.name} color={employee.avatarColor} size={64} />
          <div>
            <p className="text-xs font-medium text-indigo-600">
              {greeting()}, {employee.name.split(" ")[0]} 👋
            </p>
            <h2 className="text-xl font-semibold text-slate-900">
              {employee.name}
            </h2>
            <div className="mt-1.5 flex flex-wrap gap-2">
              <Badge label={employee.status} />
              <Badge label={employee.role} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
          <InfoItem label="Employee ID" value={employee.employeeCode} icon="id-card" />
          <InfoItem label="Email" value={employee.email} icon="mail" />
          <InfoItem label="Employment Status" value={employee.employmentStatus} icon="briefcase" />
          <InfoItem label="Supervisor" value={supervisor ? supervisor.name : "—"} icon="users" />

          <InfoItem label="Designation" value={employee.position} icon="user" />
          <InfoItem label="Mobile" value={employee.phone} icon="phone" />
          <InfoItem label="Joining Date" value={formatDate(employee.dateJoined)} icon="calendar" />

          <InfoItem label="Department" value={employee.department} icon="building" />
          <InfoItem label="Company" value={companyName} icon="building" />
          <InfoItem label="Service Length" value={serviceLength(employee.dateJoined)} icon="clock" />
        </div>
      </div>
    </Card>
  );
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon?: string }) {
  // Simple icon mapper for visual fidelity
  const renderIcon = () => {
    switch(icon) {
      case "id-card": return "🪪";
      case "mail": return "✉️";
      case "briefcase": return "💼";
      case "users": return "👥";
      case "user": return "👤";
      case "phone": return "📱";
      case "calendar": return "📅";
      case "user-plus": return "👤+";
      case "building": return "🏢";
      case "clock": return "⏱️";
      default: return "📌";
    }
  };

  return (
    <div className="flex gap-2">
      <span className="text-slate-400 mt-0.5 text-xs">{renderIcon()}</span>
      <p className="min-w-0 text-slate-400">
        <span className="block text-[10px] uppercase tracking-wide">{label}</span>
        <span className="block truncate font-semibold text-slate-800">{value}</span>
      </p>
    </div>
  );
}
