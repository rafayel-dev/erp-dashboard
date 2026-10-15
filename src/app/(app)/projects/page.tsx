"use client";

import { useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Modal from "@/components/ui/Modal";
import Field from "@/components/ui/Field";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TaskPriority, TaskStatus } from "@/types";

export default function ProjectsPage() {
  const { projects, tasks, employees, addTask, updateTaskStatus } = useAppData();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New task form state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [assigneeId, setAssigneeId] = useState(employees[0]?.id ?? "");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [status, setStatus] = useState<TaskStatus>("To Do");
  const [dueDate, setDueDate] = useState("");

  const filteredTasks =
    selectedProjectId === "all"
      ? tasks
      : tasks.filter((t) => t.projectId === selectedProjectId);

  const columns: { label: TaskStatus; color: string; bg: string }[] = [
    { label: "To Do", color: "text-slate-700", bg: "bg-slate-100" },
    { label: "In Progress", color: "text-indigo-700", bg: "bg-indigo-50" },
    { label: "Under Review", color: "text-amber-700", bg: "bg-amber-50" },
    { label: "Completed", color: "text-emerald-700", bg: "bg-emerald-50" },
  ];

  function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      projectId,
      title: taskTitle,
      description: taskDesc,
      assigneeId,
      priority,
      status,
      dueDate: dueDate || new Date().toISOString().split("T")[0],
    });

    setTaskTitle("");
    setTaskDesc("");
    setIsModalOpen(false);
  }

  const priorityColors: Record<TaskPriority, string> = {
    Urgent: "bg-rose-100 text-rose-700 border-rose-200",
    High: "bg-amber-100 text-amber-700 border-amber-200",
    Medium: "bg-indigo-100 text-indigo-700 border-indigo-200",
    Low: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Projects & Task Board</h2>
          <p className="text-xs text-slate-500">
            Kanban workflow for active company projects and department tasks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Project Filter */}
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects ({projects.length})</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => {
              if (selectedProjectId !== "all") {
                setProjectId(selectedProjectId);
              } else if (projects[0]?.id) {
                setProjectId(projects[0].id);
              }
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Projects Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {projects.map((proj) => {
          const projTasks = tasks.filter((t) => t.projectId === proj.id);
          const completedCount = projTasks.filter((t) => t.status === "Completed").length;
          const pct = projTasks.length ? Math.round((completedCount / projTasks.length) * 100) : 0;
          const manager = employees.find((e) => e.id === proj.managerId);

          return (
            <Card key={proj.id} className="relative overflow-hidden border-slate-200/80">
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
                    {proj.department}
                  </span>
                  <h3 className="mt-2 text-sm font-bold text-slate-900">{proj.name}</h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{proj.description}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                {manager && (
                  <div className="flex items-center gap-2">
                    <Avatar name={manager.name} color={manager.avatarColor} size={24} />
                    <span className="text-[11px] font-medium text-slate-600">{manager.name}</span>
                  </div>
                )}
                <span className="text-[11px] font-bold text-slate-700">{pct}% Done</span>
              </div>

              {/* Progress bar */}
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {columns.map((col) => {
          const columnTasks = filteredTasks.filter((t) => t.status === col.label);

          return (
            <div key={col.label} className="flex flex-col rounded-3xl bg-slate-100/60 p-4 border border-slate-200/70 min-h-[500px]">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className={`text-xs font-bold ${col.color}`}>{col.label}</h3>
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-2 text-[10px] font-extrabold text-slate-700 shadow-2xs border border-slate-200/60">
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              {/* Column Task Cards */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {columnTasks.length === 0 ? (
                  <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                    No tasks here
                  </div>
                ) : (
                  columnTasks.map((t) => {
                    const assignee = employees.find((e) => e.id === t.assigneeId);
                    const proj = projects.find((p) => p.id === t.projectId);

                    return (
                      <div
                        key={t.id}
                        className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-soft-lg hover:border-slate-300"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                              priorityColors[t.priority]
                            }`}
                          >
                            {t.priority}
                          </span>
                          {proj && (
                            <span className="text-[10px] font-semibold text-slate-400 truncate max-w-[100px]">
                              {proj.name}
                            </span>
                          )}
                        </div>

                        <h4 className="mt-2 text-xs font-bold text-slate-900 leading-snug">
                          {t.title}
                        </h4>
                        <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {t.description}
                        </p>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                          {assignee ? (
                            <div className="flex items-center gap-1.5">
                              <Avatar name={assignee.name} color={assignee.avatarColor} size={22} />
                              <span className="text-[11px] font-medium text-slate-600">
                                {assignee.name.split(" ")[0]}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">Unassigned</span>
                          )}

                          <span className="text-[10px] font-medium text-slate-400">
                            Due {t.dueDate}
                          </span>
                        </div>

                        {/* Status Change Buttons */}
                        <div className="mt-2.5 flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100">
                          {col.label !== "To Do" && (
                            <button
                              onClick={() => {
                                const prevStatus: Record<TaskStatus, TaskStatus> = {
                                  "In Progress": "To Do",
                                  "Under Review": "In Progress",
                                  Completed: "Under Review",
                                  "To Do": "To Do",
                                };
                                updateTaskStatus(t.id, prevStatus[t.status]);
                              }}
                              className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-200"
                              title="Move Previous"
                            >
                              &larr; Back
                            </button>
                          )}
                          {col.label !== "Completed" && (
                            <button
                              onClick={() => {
                                const nextStatus: Record<TaskStatus, TaskStatus> = {
                                  "To Do": "In Progress",
                                  "In Progress": "Under Review",
                                  "Under Review": "Completed",
                                  Completed: "Completed",
                                };
                                updateTaskStatus(t.id, nextStatus[t.status]);
                              }}
                              className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 hover:bg-indigo-100"
                              title="Move Next"
                            >
                              Next &rarr;
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Field label="Task Title">
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Implement Responsive Topbar Nav"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </Field>

          <Field label="Description">
            <textarea
              rows={3}
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              placeholder="Describe the task details and acceptance criteria..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Project">
              <Select value={projectId} onValueChange={(val) => setProjectId(val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Assignee">
              <Select value={assigneeId} onValueChange={(val) => setAssigneeId(val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Assignee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name} ({e.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Priority">
              <Select value={priority} onValueChange={(val) => setPriority(val as TaskPriority)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Initial Status">
              <Select value={status} onValueChange={(val) => setStatus(val as TaskStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Due Date">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 focus:outline-none"
              />
            </Field>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Save Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
