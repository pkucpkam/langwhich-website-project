"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { lessonsApi } from "@/api/lessons.api";
import { foldersApi } from "@/api/folders.api";
import { useAuthStore } from "@/store/auth.store";
import type { Lesson, Folder } from "@/types/vocab";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  ClipboardList,
  Lock,
  Globe,
  Star,
  Pencil,
  Trash2,
  FolderOpen,
  Volume2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function LessonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [movingFolderId, setMovingFolderId] = useState<string>("");
  const [moving, setMoving] = useState(false);

  const fetchLesson = useCallback(async () => {
    try {
      const data = await lessonsApi.getLessonById(Number(id));
      setLesson(data);
      setMovingFolderId(data.folderId ? String(data.folderId) : "");
    } catch {
      router.push("/vocab");
    }
  }, [id, router]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        fetchLesson(),
        foldersApi.getMyFolders().then(setFolders).catch(() => {}),
      ]);
      setLoading(false);
    };
    init();
  }, [fetchLesson]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await lessonsApi.deleteLesson(Number(id));
      router.push("/vocab");
    } catch {
      setDeleting(false);
    }
  };

  const handleMoveFolder = async (folderIdStr: string) => {
    setMovingFolderId(folderIdStr);
    setMoving(true);
    try {
      const fId = folderIdStr ? Number(folderIdStr) : null;
      await lessonsApi.moveToFolder(Number(id), fId);
      await fetchLesson();
    } catch {
      // ignore
    } finally {
      setMoving(false);
    }
  };

  const handleTogglePrivacy = async () => {
    try {
      await lessonsApi.togglePrivacy(Number(id));
      await fetchLesson();
    } catch {
      // ignore
    }
  };

  const speak = (word: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={32} className="animate-spin text-[#2563EB]" />
      </div>
    );
  }

  if (!lesson) return null;

  const isOwner = user?.id === lesson.creatorId;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back & Actions header */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/vocab"
          className="flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
          id="lesson-detail-back"
        >
          <ArrowLeft size={16} />
          Back to list
        </Link>

        {isOwner && (
          <div className="flex items-center gap-2">
            <Link
              href={`/vocab/edit/${lesson.id}`}
              id="lesson-detail-edit"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] hover:border-[#2563EB]/50 transition-all"
            >
              <Pencil size={13} />
              Edit Set
            </Link>
            <button
              type="button"
              id="lesson-detail-privacy"
              onClick={handleTogglePrivacy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] hover:border-[#2563EB]/50 transition-all"
            >
              {lesson.isPrivate ? <Globe size={13} /> : <Lock size={13} />}
              {lesson.isPrivate ? "Make Public" : "Make Private"}
            </button>
            <button
              type="button"
              id="lesson-detail-delete"
              onClick={() => setDeleteOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all"
            >
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Main Info Card */}
      <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {lesson.isOfficial && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Star size={11} className="fill-amber-400" />
                  Official Set
                </span>
              )}
              {lesson.isPrivate ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1F2937] text-[#9CA3AF]">
                  <Lock size={11} />
                  Private
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                  <Globe size={11} />
                  Public
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#F9FAFB]">
              {lesson.title}
            </h1>

            {lesson.description && (
              <p className="text-[#9CA3AF] text-sm leading-relaxed max-w-2xl">
                {lesson.description}
              </p>
            )}

            <div className="text-xs text-[#9CA3AF] pt-2 flex items-center gap-3">
              <span>Created by <strong className="text-[#F9FAFB] font-medium">{lesson.creatorUsername}</strong></span>
              <span>·</span>
              <span>{lesson.wordCount} words</span>
            </div>
          </div>

          {/* Folder Placement (Only for owner) */}
          {isOwner && (
            <div className="w-full sm:w-52 p-4 rounded-xl border border-[#1F2937] bg-[#0B1220] space-y-2">
              <label className="text-xs font-semibold text-[#9CA3AF] flex items-center gap-1.5" htmlFor="lesson-move-folder">
                <FolderOpen size={12} />
                Organize in folder
              </label>
              <select
                id="lesson-move-folder"
                value={movingFolderId}
                disabled={moving}
                onChange={(e) => handleMoveFolder(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#1F2937] bg-[#111827] text-[#F9FAFB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] transition-all disabled:opacity-50"
              >
                <option value="">No folder</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.icon} {f.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Study buttons */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#1F2937] pt-6">
          <Link
            href={`/vocab/study/${lesson.id}`}
            id="lesson-study-main"
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-all duration-200"
          >
            <BookOpen size={16} />
            Flashcard Study
          </Link>
          <Link
            href={`/vocab/review/${lesson.id}`}
            id="lesson-review-main"
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 hover:bg-emerald-600/30 transition-all duration-200"
          >
            <Brain size={16} />
            Review Quiz
          </Link>
          <Link
            href={`/vocab/test/${lesson.id}`}
            id="lesson-test-main"
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all duration-200"
          >
            <ClipboardList size={16} />
            Write Test
          </Link>
        </div>
      </div>

      {/* Vocabulary List */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#F9FAFB]">
          Words in this set ({lesson.vocabularyItems?.length ?? 0})
        </h2>

        <div className="space-y-3">
          {lesson.vocabularyItems?.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-[#1F2937] bg-[#111827] hover:border-[#1F2937]/80 transition-all group"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#F9FAFB]">
                    {item.word}
                  </span>
                  {item.wordType && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#1F2937] text-[#9CA3AF] uppercase">
                      {item.wordType}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => speak(item.word)}
                    className="p-1 rounded hover:bg-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
                    title="Pronounce"
                  >
                    <Volume2 size={14} />
                  </button>
                </div>
                {item.ipa && (
                  <p className="text-xs text-[#2563EB] font-mono">{item.ipa}</p>
                )}
                {item.exampleEn && (
                  <div className="mt-2 text-xs border-l-2 border-[#1F2937] pl-3 space-y-0.5">
                    <p className="text-[#9CA3AF] italic">"{item.exampleEn}"</p>
                    {item.exampleVi && (
                      <p className="text-[#9CA3AF]">{item.exampleVi}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 sm:text-right border-t sm:border-t-0 border-[#1F2937] pt-3 sm:pt-0">
                <p className="text-sm font-semibold text-[#F9FAFB]">
                  {item.definition}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteOpen}
        title="Delete Study Set"
        description="Are you sure you want to permanently delete this vocabulary set? All SRS progress for these words will be lost."
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
        loading={deleting}
      />
    </div>
  );
}
