"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { adminApi, type UserSummary } from "@/api/admin.api";
import { lessonsApi } from "@/api/lessons.api";
import type { Lesson, Folder } from "@/types/vocab";
import { Users, BookOpen, Loader2, Star, Plus, Lock, Globe, X, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const FOLDER_COLORS = ["#2563EB", "#22C55E", "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6"];
const FOLDER_ICONS = ["📚", "💼", "💡", "🎯", "🔥", "🌍", "💻", "🎨", "🌟"];

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Top-level module derived from URL query parameter (tab=vocab, tab=users)
  const activeModule = searchParams.get("tab") || "vocab";

  // Local sub-tabs
  const [vocabSubTab, setVocabSubTab] = useState<"folders" | "sets">("folders");

  const [loading, setLoading] = useState(true);

  // Data states
  const [usersList, setUsersList] = useState<UserSummary[]>([]);
  const [lessonsList, setLessonsList] = useState<Lesson[]>([]);
  const [vocabFoldersList, setVocabFoldersList] = useState<Folder[]>([]);

  // Vocab Folder modal
  const [vocabFolderModalOpen, setVocabFolderModalOpen] = useState(false);
  const [vocabFolderName, setVocabFolderName] = useState("");
  const [vocabFolderDesc, setVocabFolderDesc] = useState("");
  const [vocabFolderColor, setVocabFolderColor] = useState(FOLDER_COLORS[0]);
  const [vocabFolderIcon, setVocabFolderIcon] = useState(FOLDER_ICONS[0]);
  const [vocabFolderSubmitting, setVocabFolderSubmitting] = useState(false);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeModule === "users") {
        const uData = await adminApi.getUsers(0, 100);
        setUsersList(uData.content);
      } else if (activeModule === "vocab") {
        if (vocabSubTab === "folders") {
          const fData = await adminApi.getOfficialFolders();
          setVocabFoldersList(fData);
        } else {
          const lData = await adminApi.getAllLessons(0, 100);
          setLessonsList(lData.content);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [activeModule, vocabSubTab]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // ===== VOCAB FOLDER ACTION =====
  const handleCreateVocabFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vocabFolderName.trim()) return;

    setVocabFolderSubmitting(true);
    try {
      await adminApi.createOfficialFolder({
        name: vocabFolderName.trim(),
        description: vocabFolderDesc.trim() || undefined,
        color: vocabFolderColor,
        icon: vocabFolderIcon,
      });
      setVocabFolderModalOpen(false);
      await loadAdminData();
    } catch {
      alert("Failed to create vocabulary folder.");
    } finally {
      setVocabFolderSubmitting(false);
    }
  };

  const handleToggleVocabPrivacy = async (id: number) => {
    try {
      await lessonsApi.togglePrivacy(id);
      await loadAdminData();
    } catch {
      // ignore
    }
  };

  const handleDeleteVocabLesson = async (id: number) => {
    if (!confirm("Are you sure you want to delete this study set? This action cannot be undone.")) return;
    try {
      await adminApi.deleteLesson(id);
      await loadAdminData();
    } catch {
      alert("Failed to delete the study set.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F2937] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#F9FAFB] capitalize flex items-center gap-2">
            {activeModule === "vocab" && <BookOpen className="text-[#2563EB]" />}
            {activeModule === "users" && <Users className="text-[#2563EB]" />}
            {activeModule === "vocab" && "Vocabulary Database"}
            {activeModule === "users" && "User Directory"}
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-1">
            {activeModule === "vocab" && "Manage curated collections and student vocab sheets"}
            {activeModule === "users" && "Review members registered on the platform"}
          </p>
        </div>

        {/* Action Buttons */}
        {activeModule === "vocab" && vocabSubTab === "folders" && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setVocabFolderName("");
              setVocabFolderDesc("");
              setVocabFolderColor(FOLDER_COLORS[0]);
              setVocabFolderIcon(FOLDER_ICONS[0]);
              setVocabFolderModalOpen(true);
            }}
          >
            <Plus size={15} />
            Official Collection
          </Button>
        )}
      </div>

      {/* Sub tabs in content area */}
      {activeModule === "vocab" && (
        <div className="flex gap-4 border-b border-[#1F2937] pb-2">
          <button
            type="button"
            onClick={() => setVocabSubTab("folders")}
            className={cn(
              "text-xs font-bold transition-all relative pb-2 px-1",
              vocabSubTab === "folders"
                ? "text-[#2563EB] border-b-2 border-[#2563EB]"
                : "text-[#9CA3AF] hover:text-[#F9FAFB]"
            )}
          >
            Official Collections ({vocabFoldersList.length})
          </button>
          <button
            type="button"
            onClick={() => setVocabSubTab("sets")}
            className={cn(
              "text-xs font-bold transition-all relative pb-2 px-1",
              vocabSubTab === "sets"
                ? "text-[#2563EB] border-b-2 border-[#2563EB]"
                : "text-[#9CA3AF] hover:text-[#F9FAFB]"
            )}
          >
            Study Sets ({lessonsList.length})
          </button>
        </div>
      )}

      {/* Main Panel Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[#2563EB]" />
        </div>
      ) : activeModule === "users" ? (
        /* USERS */
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] overflow-hidden shadow-xl animate-fade-in">
          <div className="px-6 py-4 border-b border-[#1F2937] bg-[#0B1220]/50 text-[11px] font-bold text-[#9CA3AF] grid grid-cols-12 gap-2">
            <span className="col-span-2">USER ID</span>
            <span className="col-span-4">USERNAME</span>
            <span className="col-span-4">EMAIL</span>
            <span className="col-span-2 text-right">ROLE</span>
          </div>
          <div className="divide-y divide-[#1F2937]">
            {usersList.map((usr) => (
              <div key={usr.id} className="px-6 py-3.5 text-sm grid grid-cols-12 gap-2 items-center">
                <span className="col-span-2 font-mono text-xs text-[#9CA3AF]">#{usr.id}</span>
                <span className="col-span-4 text-[#F9FAFB] font-semibold">{usr.username}</span>
                <span className="col-span-4 text-[#9CA3AF] text-xs">{usr.email}</span>
                <span className="col-span-2 text-right">
                  <span
                    className={cn(
                      "inline-block px-2 py-0.5 rounded text-[10px] font-bold",
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
      ) : vocabSubTab === "folders" ? (
        /* VOCAB FOLDERS */
        vocabFoldersList.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[#1F2937] rounded-2xl text-[#9CA3AF] text-sm">
            No official vocabulary collections curated. Click "Official Collection" to add one!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-fade-in">
            {vocabFoldersList.map((folder) => (
              <div
                key={folder.id}
                className="rounded-2xl border p-5 flex flex-col items-center text-center gap-3"
                style={{
                  borderColor: `${folder.color}30`,
                  backgroundColor: `${folder.color}05`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${folder.color}15` }}
                >
                  {folder.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-[#F9FAFB] text-xs truncate max-w-full">
                    {folder.name}
                  </h3>
                  <span className="text-[10px] text-[#9CA3AF] block mt-1">
                    {folder.lessonCount} sets
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* VOCAB STUDY SETS */
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] overflow-hidden shadow-xl animate-fade-in">
          <div className="px-6 py-4 border-b border-[#1F2937] bg-[#0B1220]/50 text-[11px] font-bold text-[#9CA3AF] grid grid-cols-12 gap-2">
            <span className="col-span-4">SET TITLE</span>
            <span className="col-span-3">CREATOR</span>
            <span className="col-span-2">TERMS</span>
            <span className="col-span-3 text-right">ACTIONS</span>
          </div>
          <div className="divide-y divide-[#1F2937]">
            {lessonsList.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-[#9CA3AF]">
                No study sets exist in the system yet.
              </div>
            ) : (
              lessonsList.map((lesson) => (
                <div key={lesson.id} className="px-6 py-3.5 text-sm grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4 flex items-center gap-2 min-w-0">
                    {lesson.isOfficial && (
                      <Star size={14} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                    )}
                    <span className="text-[#F9FAFB] font-semibold truncate">{lesson.title}</span>
                  </div>
                  <span className="col-span-3 text-[#9CA3AF] text-xs truncate">{lesson.creatorUsername}</span>
                  <span className="col-span-2 text-[#9CA3AF] text-xs">{lesson.wordCount} terms</span>
                  <div className="col-span-3 text-right flex justify-end items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleVocabPrivacy(lesson.id)}
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors",
                        lesson.isPrivate
                          ? "bg-[#1F2937] text-[#9CA3AF]"
                          : "bg-green-500/10 text-green-400 border border-green-500/20"
                      )}
                    >
                      {lesson.isPrivate ? <Lock size={10} /> : <Globe size={10} />}
                      {lesson.isPrivate ? "Private" : "Public"}
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push(`/vocab/edit/${lesson.id}`)}
                      className="p-1.5 rounded-lg border border-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] transition-all"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteVocabLesson(lesson.id)}
                      className="p-1.5 rounded-lg border border-[#1F2937] text-[#9CA3AF] hover:text-red-400 hover:border-red-500/20 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Official VOCAB Folder Modal */}
      {vocabFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setVocabFolderModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-[#1F2937] bg-[#111827] p-6 shadow-2xl animate-fade-in">
            <button
              type="button"
              onClick={() => setVocabFolderModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
            >
              <X size={16} />
            </button>
            <h3 className="text-base font-bold text-[#F9FAFB] mb-4">New Official Collection</h3>
            <form onSubmit={handleCreateVocabFolder} className="space-y-4">
              <Input
                id="vocab-folder-name"
                label="Folder Name *"
                placeholder="e.g. TOEIC Part 1 Keywords"
                value={vocabFolderName}
                onChange={(e) => setVocabFolderName(e.target.value)}
                required
              />
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5" htmlFor="vocab-folder-desc">Description</label>
                <textarea
                  id="vocab-folder-desc"
                  placeholder="Official directory description..."
                  value={vocabFolderDesc}
                  onChange={(e) => setVocabFolderDesc(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#1F2937] bg-[#0B1220] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5">Select Icon</label>
                <div className="flex flex-wrap gap-2">
                  {FOLDER_ICONS.map((ico) => (
                    <button
                      type="button"
                      key={ico}
                      onClick={() => setVocabFolderIcon(ico)}
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center text-lg border transition-all",
                        vocabFolderIcon === ico ? "border-[#2563EB] bg-[#2563EB]/10" : "border-[#1F2937] bg-[#0B1220]"
                      )}
                    >
                      {ico}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5">Color Theme</label>
                <div className="flex gap-2">
                  {FOLDER_COLORS.map((col) => (
                    <button
                      type="button"
                      key={col}
                      onClick={() => setVocabFolderColor(col)}
                      style={{ backgroundColor: col }}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        vocabFolderColor === col ? "border-[#F9FAFB] scale-110" : "border-transparent opacity-80"
                      )}
                      aria-label={`Color ${col}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" size="sm" onClick={() => setVocabFolderModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" isLoading={vocabFolderSubmitting}>Create Collection</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}
