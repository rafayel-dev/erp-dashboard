"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import Field from "@/components/ui/Field";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppData } from "@/context/AppDataContext";
import { formatDate } from "@/lib/format";
import { isAdminOrHR } from "@/lib/hr";
import type { AnnouncementPriority } from "@/types";
import { Megaphone, Plus, Bell } from "lucide-react";

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
    Urgent: "bg-rose-50 text-rose-700 border-rose-200/60 ring-1 ring-rose-500/20",
    Important: "bg-amber-50 text-amber-700 border-amber-200/60 ring-1 ring-amber-500/20",
    General: "bg-brand-50 text-brand-700 border-brand-200/60 ring-1 ring-brand-500/20",
  };

  return (
    <>
      <Card className="flex flex-col border border-slate-200/80 shadow-soft">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Megaphone className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Notice Board</h2>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-600 ring-1 ring-brand-500/20">
              {sorted.length}
            </span>
          </div>

          {canPost && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="h-8 gap-1 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Post Notice
            </Button>
          )}
        </div>

        <div className="mt-3 max-h-80 space-y-2.5 overflow-y-auto pr-1">
          {sorted.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <Bell className="h-8 w-8 mx-auto text-slate-300 mb-2 stroke-1" />
              No announcements posted yet.
            </div>
          ) : (
            sorted.map((n) => (
              <div
                key={n.id}
                className="group rounded-xl border border-slate-200/60 bg-slate-50/50 p-3.5 transition-all hover:bg-slate-50 hover:border-slate-300/80 hover:shadow-2xs"
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
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </Field>

          <Field label="Announcement Content">
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the notice details here..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <Select value={category} onValueChange={(val) => setCategory(val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Policy">Policy Update</SelectItem>
                  <SelectItem value="IT Alert">IT Alert</SelectItem>
                  <SelectItem value="Event">Company Event</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Priority Level">
              <Select
                value={priority}
                onValueChange={(val) => setPriority(val as AnnouncementPriority)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Important">Important</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Publish Notice
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
