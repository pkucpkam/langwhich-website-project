"use client";

import type { Lesson } from "@/types/vocab";
import { Lock, Globe, Star, BookOpen, Brain, ClipboardList, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LessonCardProps {
  lesson: Lesson;
  currentUserId?: number;
  onDelete?: (id: number) => void;
  onTogglePrivacy?: (id: number) => void;
}

export function LessonCard({
  lesson,
  currentUserId,
  onDelete,
  onTogglePrivacy,
}: LessonCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isOwner = currentUserId === lesson.creatorId;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="group relative rounded-2xl border border-[#1F2937] bg-[#111827] p-5 hover:border-[#2563EB]/50 transition-all duration-200 hover:shadow-lg hover:shadow-[#2563EB]/5"
      id={`lesson-card-${lesson.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {lesson.isOfficial && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Star size={10} />
                Official
              </span>
            )}
            {lesson.isPrivate ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#1F2937] text-[#9CA3AF]">
                <Lock size={10} />
                Private
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                <Globe size={10} />
                Public
              </span>
            )}
          </div>
          <h3 className="mt-2 text-base font-semibold text-[#F9FAFB] line-clamp-2 leading-snug">
            {lesson.title}
          </h3>
          <p className="mt-1 text-xs text-[#9CA3AF]">
            by {lesson.creatorUsername} · {lesson.wordCount} words
          </p>
        </div>

        {/* Owner menu */}
        {isOwner && (
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button
              type="button"
              id={`lesson-card-menu-${lesson.id}`}
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg hover:bg-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Lesson options"
            >
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-[#1F2937] bg-[#0B1220] shadow-xl py-1">
                <Link
                  href={`/vocab/edit/${lesson.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[#9CA3AF] hover:bg-[#1F2937] hover:text-[#F9FAFB] transition-colors"
                  id={`lesson-card-edit-${lesson.id}`}
                >
                  <Pencil size={14} />
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    onTogglePrivacy?.(lesson.id);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#9CA3AF] hover:bg-[#1F2937] hover:text-[#F9FAFB] transition-colors"
                  id={`lesson-card-privacy-${lesson.id}`}
                >
                  {lesson.isPrivate ? <Globe size={14} /> : <Lock size={14} />}
                  {lesson.isPrivate ? "Make Public" : "Make Private"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDelete?.(lesson.id);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  id={`lesson-card-delete-${lesson.id}`}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex gap-2">
        <Link
          href={`/vocab/study/${lesson.id}`}
          id={`lesson-card-study-${lesson.id}`}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold",
            "bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-all duration-200"
          )}
        >
          <BookOpen size={13} />
          Study
        </Link>
        <Link
          href={`/vocab/review/${lesson.id}`}
          id={`lesson-card-review-${lesson.id}`}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold",
            "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 hover:bg-emerald-600/30 transition-all duration-200"
          )}
        >
          <Brain size={13} />
          Review
        </Link>
        <Link
          href={`/vocab/test/${lesson.id}`}
          id={`lesson-card-test-${lesson.id}`}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold",
            "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all duration-200"
          )}
        >
          <ClipboardList size={13} />
          Test
        </Link>
      </div>
    </div>
  );
}
