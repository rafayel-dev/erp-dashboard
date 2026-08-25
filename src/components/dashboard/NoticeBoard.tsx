"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import Field from "@/components/ui/Field";
import { useAppData } from "@/context/AppDataContext";
import { formatDate } from "@/lib/format";
import { isAdminOrHR } from "@/lib/hr";
import type { AnnouncementPriority } from "@/types";

export default function NoticeBoard() {
  const { announcements, addAnnouncement, activeEmployee } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Announcement form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [priority, setPriority] = useState<AnnouncementPriority>("General");

  const canPost = isAdminOrHR(activeEmployee.role);

  const sorted = [...announcements].sort((a, b) => (a.postedOn < b.postedOn ? 1 : -1));

  function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    addAnnouncement({
      title,
      content,
      category,
      priority,
      postedBy: activeEmployee.id,
      targetDepartment: "All",
    });

    setTitle("");
    setContent("");
    setIsModalOpen(false);
  }

  const priorityStyles: Record<AnnouncementPriority, string> = {
    Urgent: "bg-rose-100 text-rose-700 border-rose-200",
    Important: "bg-amber-100 text-amber-700 border-amber-200",
    General: "bg-indigo-50 text-indigo-700 border-indigo-100",
  };

  return (
    <>
      <Card className="flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">Notice Board</h2>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-600">
              {sorted.length}
            </span>
          </div>

          {canPost && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              + Post Notice
            </button>
          )}
        </div>

        <div className="mt-3 max-h-80 space-y-3 overflow-y-auto pr-1">
          {sorted.length === 0 ? (
            <p className="py-4 text-center text-xs text-slate-400">No notices posted yet.</p>
          ) : (
            sorted.map((n) => (
              <div
                key={n.id}
                className="group rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                      priorityStyles[n.priority]
                    }`}
                  >
                    {n.priority}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    {formatDate(n.postedOn)}
                  </span>
                </div>

                <h4 className="mt-1.5 text-xs font-bold text-slate-900 leading-snug">
                  {n.title}
                </h4>
                <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {n.content}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Post Notice Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Post Company Announcement">
        <form onSubmit={handlePost} className="space-y-4">
          <Field label="Notice Title">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Townhall Meeting & Schedule"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </Field>

          <Field label="Announcement Content">
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the notice details here..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 focus:outline-none"
              >
                <option value="General">General</option>
                <option value="Policy">Policy Update</option>
                <option value="IT Alert">IT Alert</option>
                <option value="Event">Company Event</option>
              </select>
            </Field>

            <Field label="Priority Level">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 focus:outline-none"
              >
                <option value="General">General</option>
                <option value="Important">Important</option>
                <option value="Urgent">Urgent</option>
              </select>
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
              Publish Notice
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
