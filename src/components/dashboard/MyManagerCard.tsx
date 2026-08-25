import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import type { Employee } from "@/types";

export default function MyManagerCard({
  supervisor,
}: {
  supervisor: Employee | undefined;
}) {
  return (
    <Card className="flex h-full flex-col">
      <h2 className="text-sm font-semibold text-slate-900">My Manager</h2>
      <div className="mt-4 flex flex-1 items-center">
        {supervisor ? (
          <div className="flex items-center gap-3">
            <Avatar name={supervisor.name} color={supervisor.avatarColor} size={40} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800">
                {supervisor.name}
              </p>
              <p className="text-xs text-slate-400">Supervisor</p>
              <p className="truncate text-xs text-slate-400">{supervisor.position}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            Top of the reporting hierarchy — no manager assigned.
          </p>
        )}
      </div>
    </Card>
  );
}
