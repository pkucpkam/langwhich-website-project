"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import { lessonsApi } from "@/api/lessons.api";
import { foldersApi } from "@/api/folders.api";
import { historyApi } from "@/api/history.api";
import { ActivityHeatmap } from "@/components/features/home/ActivityHeatmap";
import { FolderCard } from "@/components/features/folders/FolderCard";
import { LessonCard } from "@/components/features/lessons/LessonCard";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { Lesson, Folder, PaginatedResponse } from "@/types/vocab";
import { Search, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useDebounce } from "@/hooks/useDebounce";

export default function VocabHomePage() {
  const { user } = useAuthStore();

  // State
  const [lessons, setLessons] = useState<PaginatedResponse<Lesson> | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  const fetchLessons = useCallback(async () => {
    try {
      const data = await lessonsApi.getPublicLessons({
        q: debouncedSearch || undefined,
        page: currentPage,
        size: 9,
        sort: "createdAt,desc",
      });
      setLessons(data);
    } catch {
      // ignore
    }
  }, [debouncedSearch, currentPage]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        fetchLessons(),
        foldersApi.getOfficialFolders().then(setFolders).catch(() => {}),
        historyApi.getDailyActivity().then(setHeatmapData).catch(() => {}),
      ]);
      setLoading(false);
    };
    init();
  }, [fetchLessons]);

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await lessonsApi.deleteLesson(deleteTarget);
      setDeleteTarget(null);
      await fetchLessons();
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePrivacy = async (id: number) => {
    try {
      await lessonsApi.togglePrivacy(id);
      await fetchLessons();
    } catch {
      // ignore
    }
  };

  return (
    <>
      {/* Activity Heatmap */}
      <div className="mb-8">
        <ActivityHeatmap data={heatmapData} />
      </div>

      {/* Official Folders */}
      {folders.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#F9FAFB] mb-4">
            📚 Official Collections
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {folders.map((folder) => (
              <FolderCard key={folder.id} folder={folder} />
            ))}
          </div>
        </section>
      )}

      {/* Lesson List */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-[#F9FAFB]">
            🌐 Public Lessons
          </h2>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              />
              <input
                id="vocab-home-search"
                type="text"
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm rounded-xl border border-[#1F2937] bg-[#111827] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all w-56"
              />
            </div>
            <Link
              href="/vocab/create-lesson"
              id="vocab-home-create-btn"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-all duration-200"
            >
              <Plus size={15} />
              New
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#2563EB]" />
          </div>
        ) : lessons?.content.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#9CA3AF] text-lg">No lessons found.</p>
            <Link
              href="/vocab/create-lesson"
              className="mt-4 inline-flex items-center gap-2 text-[#2563EB] hover:underline text-sm"
            >
              <Plus size={14} />
              Create the first one
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lessons?.content.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  currentUserId={user?.id}
                  onDelete={setDeleteTarget}
                  onTogglePrivacy={handleTogglePrivacy}
                />
              ))}
            </div>
            {lessons && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={lessons.totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </section>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Delete Lesson"
        description="This will permanently delete this lesson and all associated SRS cards. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </>
  );
}
