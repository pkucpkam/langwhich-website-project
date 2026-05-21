"use client";

import { useEffect, useState, useCallback } from "react";
import { lessonsApi } from "@/api/lessons.api";
import { foldersApi } from "@/api/folders.api";
import { useAuthStore } from "@/store/auth.store";
import type { Lesson, Folder } from "@/types/vocab";
import { LessonCard } from "@/components/features/lessons/LessonCard";
import { FolderCard } from "@/components/features/folders/FolderCard";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BookOpen, FolderPlus, Plus, Loader2, X, FolderIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const FOLDER_COLORS = ["#2563EB", "#22C55E", "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6"];
const FOLDER_ICONS = ["📚", "💼", "💡", "🎯", "🔥", "🌍", "💻", "🎨", "🌟"];

export default function MyLessonsPage() {
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"lessons" | "folders">("lessons");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  // Deleting lesson
  const [deleteLessonId, setDeleteLessonId] = useState<number | null>(null);
  const [deletingLesson, setDeletingLesson] = useState(false);

  // Folder Create/Edit Modal
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [folderName, setFolderName] = useState("");
  const [folderDesc, setFolderDesc] = useState("");
  const [folderColor, setFolderColor] = useState(FOLDER_COLORS[0]);
  const [folderIcon, setFolderIcon] = useState(FOLDER_ICONS[0]);
  const [folderSubmitting, setFolderSubmitting] = useState(false);

  // Deleting folder
  const [deleteFolderId, setDeleteFolderId] = useState<number | null>(null);
  const [deletingFolder, setDeletingFolder] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [lData, fData] = await Promise.all([
        lessonsApi.getMyLessons(),
        foldersApi.getMyFolders(),
      ]);
      setLessons(lData);
      setFolders(fData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Lessons handlers
  const handleDeleteLesson = async () => {
    if (!deleteLessonId) return;
    setDeletingLesson(true);
    try {
      await lessonsApi.deleteLesson(deleteLessonId);
      setDeleteLessonId(null);
      await loadData();
    } catch {
      // ignore
    } finally {
      setDeletingLesson(false);
    }
  };

  const handleTogglePrivacy = async (id: number) => {
    try {
      await lessonsApi.togglePrivacy(id);
      await loadData();
    } catch {
      // ignore
    }
  };

  // Folder modal open/close
  const openFolderModal = (folder: Folder | null = null) => {
    if (folder) {
      setEditingFolder(folder);
      setFolderName(folder.name);
      setFolderDesc(folder.description ?? "");
      setFolderColor(folder.color);
      setFolderIcon(folder.icon);
    } else {
      setEditingFolder(null);
      setFolderName("");
      setFolderDesc("");
      setFolderColor(FOLDER_COLORS[0]);
      setFolderIcon(FOLDER_ICONS[0]);
    }
    setFolderModalOpen(true);
  };

  const handleSaveFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    setFolderSubmitting(true);
    try {
      if (editingFolder) {
        await foldersApi.updateFolder(editingFolder.id, {
          name: folderName.trim(),
          description: folderDesc.trim() || undefined,
          color: folderColor,
          icon: folderIcon,
        });
      } else {
        await foldersApi.createFolder({
          name: folderName.trim(),
          description: folderDesc.trim() || undefined,
          color: folderColor,
          icon: folderIcon,
        });
      }
      setFolderModalOpen(false);
      await loadData();
    } catch {
      // ignore
    } finally {
      setFolderSubmitting(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!deleteFolderId) return;
    setDeletingFolder(true);
    try {
      await foldersApi.deleteFolder(deleteFolderId);
      setDeleteFolderId(null);
      await loadData();
    } catch {
      // ignore
    } finally {
      setDeletingFolder(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F9FAFB]">My Library</h1>
          <p className="text-sm text-[#9CA3AF]">
            Manage your custom study sets and folders
          </p>
        </div>

        <div className="flex gap-2">
          {activeTab === "lessons" ? (
            <Link href="/vocab/create-lesson" id="my-lessons-new-lesson">
              <Button variant="primary" size="sm">
                <Plus size={15} />
                New Set
              </Button>
            </Link>
          ) : (
            <Button
              id="my-lessons-new-folder"
              variant="primary"
              size="sm"
              onClick={() => openFolderModal()}
            >
              <FolderPlus size={15} />
              New Folder
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1F2937] gap-6">
        <button
          type="button"
          id="my-lessons-tab-lessons"
          onClick={() => setActiveTab("lessons")}
          className={cn(
            "pb-3 text-sm font-semibold transition-all border-b-2",
            activeTab === "lessons"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#9CA3AF] hover:text-[#F9FAFB]"
          )}
        >
          My Sets ({lessons.length})
        </button>
        <button
          type="button"
          id="my-lessons-tab-folders"
          onClick={() => setActiveTab("folders")}
          className={cn(
            "pb-3 text-sm font-semibold transition-all border-b-2",
            activeTab === "folders"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#9CA3AF] hover:text-[#F9FAFB]"
          )}
        >
          My Folders ({folders.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[#2563EB]" />
        </div>
      ) : activeTab === "lessons" ? (
        lessons.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#1F2937] rounded-2xl p-8">
            <BookOpen size={40} className="mx-auto text-[#9CA3AF] mb-4" />
            <h3 className="text-base font-semibold text-[#F9FAFB] mb-1">
              No study sets yet
            </h3>
            <p className="text-sm text-[#9CA3AF] mb-6 max-w-sm mx-auto">
              Create custom vocabulary sets to master TOEIC keywords at your own pace.
            </p>
            <Link href="/vocab/create-lesson">
              <Button variant="primary" size="sm">
                Create Study Set
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                currentUserId={user?.id}
                onDelete={setDeleteLessonId}
                onTogglePrivacy={handleTogglePrivacy}
              />
            ))}
          </div>
        )
      ) : folders.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#1F2937] rounded-2xl p-8">
          <FolderIcon size={40} className="mx-auto text-[#9CA3AF] mb-4" />
          <h3 className="text-base font-semibold text-[#F9FAFB] mb-1">
            No folders yet
          </h3>
          <p className="text-sm text-[#9CA3AF] mb-6 max-w-sm mx-auto">
            Create folders to group related study sets and keep your library organized.
          </p>
          <Button variant="primary" size="sm" onClick={() => openFolderModal()}>
            Create Folder
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {folders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              isOwner
              onEdit={openFolderModal}
              onDelete={setDeleteFolderId}
            />
          ))}
        </div>
      )}

      {/* Delete Lesson Confirm Modal */}
      <ConfirmModal
        isOpen={deleteLessonId !== null}
        title="Delete Study Set"
        description="Are you sure you want to permanently delete this study set? This action cannot be undone."
        onConfirm={handleDeleteLesson}
        onClose={() => setDeleteLessonId(null)}
        loading={deletingLesson}
      />

      {/* Delete Folder Confirm Modal */}
      <ConfirmModal
        isOpen={deleteFolderId !== null}
        title="Delete Folder"
        description="Are you sure you want to delete this folder? The lessons inside will NOT be deleted, they will just be removed from this folder."
        onConfirm={handleDeleteFolder}
        onClose={() => setDeleteFolderId(null)}
        loading={deletingFolder}
      />

      {/* Create/Edit Folder Modal */}
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
              id="folder-modal-close"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-[#F9FAFB] mb-4">
              {editingFolder ? "Edit Folder" : "New Folder"}
            </h3>

            <form onSubmit={handleSaveFolder} className="space-y-4">
              <Input
                id="folder-modal-name"
                label="Folder Name *"
                placeholder="e.g. Grammar Sets"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                required
              />

              <div>
                <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5" htmlFor="folder-modal-desc">
                  Description
                </label>
                <textarea
                  id="folder-modal-desc"
                  placeholder="Optional description..."
                  value={folderDesc}
                  onChange={(e) => setFolderDesc(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-[#1F2937] bg-[#0B1220] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Icon selector */}
              <div>
                <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5">
                  Folder Icon
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
                  Accent Color
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
                  id="folder-modal-cancel"
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFolderModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  id="folder-modal-submit"
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={folderSubmitting}
                >
                  {editingFolder ? "Save Changes" : "Create Folder"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
