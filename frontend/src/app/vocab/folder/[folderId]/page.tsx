"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { foldersApi } from "@/api/folders.api";
import { lessonsApi } from "@/api/lessons.api";
import { useAuthStore } from "@/store/auth.store";
import type { Folder, Lesson } from "@/types/vocab";
import { LessonCard } from "@/components/features/lessons/LessonCard";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ArrowLeft, Loader2, BookOpen } from "lucide-react";
import Link from "next/link";

export default function FolderDetailPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [folder, setFolder] = useState<Folder | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLessonId, setDeleteLessonId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadFolderLessons = async () => {
    try {
      // Find folder inside all folders (or handle official/my)
      const [official, my] = await Promise.all([
        foldersApi.getOfficialFolders().catch(() => []),
        foldersApi.getMyFolders().catch(() => []),
      ]);
      const found = [...official, ...my].find((f) => f.id === Number(folderId));
      if (!found) {
        router.push("/vocab");
        return;
      }
      setFolder(found);

      const lData = await foldersApi.getLessonsInFolder(Number(folderId));
      setLessons(lData);
    } catch {
      router.push("/vocab");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFolderLessons();
  }, [folderId]);

  const handleDeleteLesson = async () => {
    if (!deleteLessonId) return;
    setDeleting(true);
    try {
      await lessonsApi.deleteLesson(deleteLessonId);
      setDeleteLessonId(null);
      await loadFolderLessons();
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePrivacy = async (id: number) => {
    try {
      await lessonsApi.togglePrivacy(id);
      await loadFolderLessons();
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={32} className="animate-spin text-[#2563EB]" />
      </div>
    );
  }

  if (!folder) return null;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/vocab"
          className="flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
          id="folder-detail-back"
        >
          <ArrowLeft size={16} />
          Back to library
        </Link>
      </div>

      {/* Folder Header */}
      <div
        className="rounded-2xl border p-6 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4"
        style={{
          borderColor: `${folder.color}30`,
          backgroundColor: `${folder.color}05`,
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
          style={{ backgroundColor: `${folder.color}15` }}
        >
          {folder.icon}
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#F9FAFB]">{folder.name}</h1>
          {folder.description && (
            <p className="text-sm text-[#9CA3AF] max-w-xl">
              {folder.description}
            </p>
          )}
          <p className="text-xs text-[#9CA3AF]">
            by {folder.creatorUsername} · {lessons.length} lessons
          </p>
        </div>
      </div>

      {/* Lesson List */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#F9FAFB]">Lessons in folder</h2>

        {lessons.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#1F2937] rounded-2xl p-8">
            <BookOpen size={40} className="mx-auto text-[#9CA3AF] mb-4" />
            <h3 className="text-base font-semibold text-[#F9FAFB]">No lessons in this folder</h3>
            <p className="text-sm text-[#9CA3AF] mt-1">
              Add folders to sets from the set details page to organize your content.
            </p>
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
        )}
      </section>

      {/* Delete Lesson Confirm Modal */}
      <ConfirmModal
        isOpen={deleteLessonId !== null}
        title="Delete Study Set"
        description="Are you sure you want to permanently delete this study set? This action cannot be undone."
        onConfirm={handleDeleteLesson}
        onClose={() => setDeleteLessonId(null)}
        loading={deleting}
      />
    </div>
  );
}
