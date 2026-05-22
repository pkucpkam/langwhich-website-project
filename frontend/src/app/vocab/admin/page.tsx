"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { adminApi, type UserSummary } from "@/api/admin.api";
import { lessonsApi } from "@/api/lessons.api";
import { foldersApi } from "@/api/folders.api";
import type { Lesson, Folder } from "@/types/vocab";
import { Shield, Users, BookOpen, FolderOpen, Loader2, Star, Plus, ShieldAlert, Lock, Globe, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const FOLDER_COLORS = ["#2563EB", "#22C55E", "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6"];
const FOLDER_ICONS = ["📚", "💼", "💡", "🎯", "🔥", "🌍", "💻", "🎨", "🌟"];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"users" | "sets" | "folders">("users");
  const [loading, setLoading] = useState(true);

  // Data states
  const [usersList, setUsersList] = useState<UserSummary[]>([]);
  const [lessonsList, setLessonsList] = useState<Lesson[]>([]);
  const [foldersList, setFoldersList] = useState<Folder[]>([]);

  // Folder modal
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderDesc, setFolderDesc] = useState("");
  const [folderColor, setFolderColor] = useState(FOLDER_COLORS[0]);
  const [folderIcon, setFolderIcon] = useState(FOLDER_ICONS[0]);
  const [folderSubmitting, setFolderSubmitting] = useState(false);

  // Security Gate
  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.replace("/vocab");
    }
  }, [user, router]);

  const loadAdminData = useCallback(async () => {
    if (!user || user.role !== "ADMIN") return;
    setLoading(true);
    try {
      if (activeTab === "users") {
        const uData = await adminApi.getUsers(0, 100);
        setUsersList(uData.content);
      } else if (activeTab === "sets") {
        const lData = await adminApi.getAllLessons(0, 100);
        setLessonsList(lData.content);
      } else if (activeTab === "folders") {
        const fData = await adminApi.getOfficialFolders();
        setFoldersList(fData);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [user, activeTab]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    setFolderSubmitting(true);
    try {
      await adminApi.createOfficialFolder({
        name: folderName.trim(),
        description: folderDesc.trim() || undefined,
        color: folderColor,
        icon: folderIcon,
      });
      setFolderModalOpen(false);
      await loadAdminData();
    } catch {
      // ignore
    } finally {
      setFolderSubmitting(false);
    }
  };

  const handleTogglePrivacy = async (id: number) => {
    try {
      await lessonsApi.togglePrivacy(id);
      await loadAdminData();
    } catch {
      // ignore
    }
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F9FAFB] flex items-center gap-2">
            <Shield className="text-amber-400" />
            Admin Dashboard
          </h1>
          <p className="text-sm text-[#9CA3AF]">
            Manage users, curate official sets, and configure platform directories
          </p>
        </div>

        {activeTab === "folders" && (
          <Button
            id="admin-new-official-folder"
            variant="primary"
            size="sm"
            onClick={() => {
              setFolderName("");
              setFolderDesc("");
              setFolderColor(FOLDER_COLORS[0]);
              setFolderIcon(FOLDER_ICONS[0]);
              setFolderModalOpen(true);
            }}
          >
            <Plus size={15} />
            Official Folder
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1F2937] gap-6">
        <button
          type="button"
          id="admin-tab-users"
          onClick={() => setActiveTab("users")}
          className={cn(
            "pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5",
            activeTab === "users"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#9CA3AF] hover:text-[#F9FAFB]"
          )}
        >
          <Users size={16} />
          Users ({usersList.length})
        </button>
        <button
          type="button"
          id="admin-tab-sets"
          onClick={() => setActiveTab("sets")}
          className={cn(
            "pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5",
            activeTab === "sets"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#9CA3AF] hover:text-[#F9FAFB]"
          )}
        >
          <BookOpen size={16} />
          All Sets ({lessonsList.length})
        </button>
        <button
          type="button"
          id="admin-tab-folders"
          onClick={() => setActiveTab("folders")}
          className={cn(
            "pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5",
            activeTab === "folders"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#9CA3AF] hover:text-[#F9FAFB]"
          )}
        >
          <FolderOpen size={16} />
          Official Folders ({foldersList.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[#2563EB]" />
        </div>
      ) : activeTab === "users" ? (
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1F2937] bg-[#0B1220]/50 text-xs font-semibold text-[#9CA3AF] grid grid-cols-12 gap-2">
            <span className="col-span-2">USER ID</span>
            <span className="col-span-4">USERNAME</span>
            <span className="col-span-4">EMAIL</span>
            <span className="col-span-2 text-right">ROLE</span>
          </div>
          <div className="divide-y divide-[#1F2937]">
            {usersList.map((usr) => (
              <div
                key={usr.id}
                className="px-6 py-4 text-sm grid grid-cols-12 gap-2 items-center"
              >
                <span className="col-span-2 font-mono text-[#9CA3AF]">
                  #{usr.id}
                </span>
                <span className="col-span-4 text-[#F9FAFB] font-semibold">
                  {usr.username}
                </span>
                <span className="col-span-4 text-[#9CA3AF]">{usr.email}</span>
                <span className="col-span-2 text-right">
                  <span
                    className={cn(
                      "inline-block px-2 py-0.5 rounded text-[10px] font-semibold",
                      usr.role === "ADMIN"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-[#1F2937] text-[#9CA3AF]"
                    )}
                  >
                    {usr.role}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === "sets" ? (
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1F2937] bg-[#0B1220]/50 text-xs font-semibold text-[#9CA3AF] grid grid-cols-12 gap-2">
            <span className="col-span-5">SET TITLE</span>
            <span className="col-span-3">CREATOR</span>
            <span className="col-span-2">WORDS</span>
            <span className="col-span-2 text-right">STATUS</span>
          </div>
          <div className="divide-y divide-[#1F2937]">
            {lessonsList.map((lesson) => (
              <div
                key={lesson.id}
                className="px-6 py-4 text-sm grid grid-cols-12 gap-2 items-center"
              >
                <div className="col-span-5 flex items-center gap-2 min-w-0">
                  {lesson.isOfficial && (
                    <Star size={14} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                  )}
                  <span className="text-[#F9FAFB] font-semibold truncate">
                    {lesson.title}
                  </span>
                </div>
                <span className="col-span-3 text-[#9CA3AF] truncate">
                  {lesson.creatorUsername}
                </span>
                <span className="col-span-2 text-[#9CA3AF]">
                  {lesson.wordCount} terms
                </span>
                <div className="col-span-2 text-right flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleTogglePrivacy(lesson.id)}
                    className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors",
                      lesson.isPrivate
                        ? "bg-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB]"
                        : "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
                    )}
                  >
                    {lesson.isPrivate ? <Lock size={10} /> : <Globe size={10} />}
                    {lesson.isPrivate ? "Private" : "Public"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {foldersList.map((folder) => (
            <div
              key={folder.id}
              className="rounded-2xl border p-5 flex flex-col items-center text-center gap-3 relative group"
              style={{
                borderColor: `${folder.color}30`,
                backgroundColor: `${folder.color}05`,
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                style={{ backgroundColor: `${folder.color}15` }}
              >
                {folder.icon}
              </div>
              <div>
                <h3 className="font-semibold text-[#F9FAFB] text-sm truncate max-w-full">
                  {folder.name}
                </h3>
                <span className="text-xs text-[#9CA3AF] block mt-1">
                  {folder.lessonCount} sets
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Official Folder Creation Modal */}
      {folderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setFolderModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-[#1F2937] bg-[#111827] p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setFolderModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
              aria-label="Close modal"
              id="admin-folder-modal-close"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-[#F9FAFB] mb-4">
              New Official Collection
            </h3>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <Input
                id="admin-folder-modal-name"
                label="Folder Name *"
                placeholder="e.g. TOEIC Part 1 Keywords"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                required
              />

              <div>
                <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5" htmlFor="admin-folder-modal-desc">
                  Description
                </label>
                <textarea
                  id="admin-folder-modal-desc"
                  placeholder="Official directory description..."
                  value={folderDesc}
                  onChange={(e) => setFolderDesc(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-[#1F2937] bg-[#0B1220] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Icon selector */}
              <div>
                <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5">
                  Select Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {FOLDER_ICONS.map((ico) => (
                    <button
                      type="button"
                      key={ico}
                      onClick={() => setFolderIcon(ico)}
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center text-lg border transition-all",
                        folderIcon === ico
                          ? "border-[#2563EB] bg-[#2563EB]/10"
                          : "border-[#1F2937] bg-[#0B1220] hover:border-[#9CA3AF]"
                      )}
                    >
                      {ico}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color selector */}
              <div>
                <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5">
                  Color Theme
                </label>
                <div className="flex gap-2">
                  {FOLDER_COLORS.map((col) => (
                    <button
                      type="button"
                      key={col}
                      onClick={() => setFolderColor(col)}
                      style={{ backgroundColor: col }}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        folderColor === col
                          ? "border-[#F9FAFB] scale-110"
                          : "border-transparent opacity-80 hover:opacity-100"
                      )}
                      aria-label={`Color ${col}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  id="admin-folder-modal-cancel"
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFolderModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  id="admin-folder-modal-submit"
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={folderSubmitting}
                >
                  Create Collection
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
