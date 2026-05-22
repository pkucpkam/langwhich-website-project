"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Eye,
  Loader2,
  Clock,
  Sparkles,
} from "lucide-react";
import { theoryApi } from "@/api/theory.api";
import type { TheoryLesson, Difficulty } from "@/types/theory";
import { Button } from "@/components/ui/Button";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<TheoryLesson[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "ALL">("ALL");

  // Pagination
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const loadLessons = useCallback(async () => {
    setLoading(true);
    try {
      const data = await theoryApi.getAllLessonsAdmin({
        search: debouncedSearch.trim() || undefined,
        difficulty: selectedDifficulty === "ALL" ? undefined : selectedDifficulty,
        page: currentPage,
        size: pageSize,
      });
      setLessons(data.content);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error("Failed to load admin lessons list", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedDifficulty, currentPage]);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  // Reset page number on filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch, selectedDifficulty]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this lesson? This action is irreversible.")) {
      return;
    }

    try {
      await theoryApi.deleteLesson(id);
      await loadLessons();
    } catch (error) {
      console.error("Failed to delete lesson", error);
      alert("Error deleting lesson.");
    }
  };

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case "BEGINNER":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "INTERMEDIATE":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "ADVANCED":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header and Call to Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span>Lessons Catalog Manager</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Author detailed grammatical modules and interactive listening materials.
          </p>
        </div>

        <Link href="/admin/theory/lessons/create" id="admin-new-lesson">
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4" />
            Create Lesson
          </Button>
        </Link>
      </div>

      {/* Filters Area */}
      <section className="bg-neutral-card border border-neutral-border rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by title, keywords, summary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-neutral-border bg-neutral-background text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {(["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setSelectedDifficulty(diff)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 whitespace-nowrap",
                  selectedDifficulty === diff
                    ? "bg-primary text-text-primary border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                    : "bg-neutral-background text-text-secondary border-neutral-border hover:border-text-secondary hover:text-text-primary"
                )}
              >
                {diff === "ALL" ? "All Levels" : diff}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Lessons Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24 border border-neutral-border bg-neutral-card/15 rounded-2xl">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-neutral-border rounded-2xl bg-neutral-card/10 p-8">
          <FileText className="h-12 w-12 text-text-secondary mx-auto mb-4" />
          <h3 className="text-base font-semibold text-text-primary">No articles found</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto mt-1">
            Let&apos;s create some exciting new materials to help students score higher on their TOEIC test!
          </p>
          <Link href="/admin/theory/lessons/create" className="inline-block mt-4">
            <Button variant="primary" size="sm">Create First Lesson</Button>
          </Link>
        </div>
      ) : (
        <div className="border border-neutral-border rounded-2xl bg-neutral-card/25 overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-border bg-neutral-card/60 text-text-primary font-bold text-xs uppercase tracking-wider">
                <th className="px-4 py-3.5">Lesson Details</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5 w-32 text-center">Difficulty</th>
                <th className="px-4 py-3.5 w-24 text-center">Duration</th>
                <th className="px-4 py-3.5 w-24 text-center">Status</th>
                <th className="px-4 py-3.5 w-32 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-border/60">
              {lessons.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-neutral-card/45 transition-colors">
                  <td className="px-4 py-4 space-y-0.5">
                    <div className="font-bold text-text-primary line-clamp-1">{lesson.title}</div>
                    <div className="text-xs text-text-secondary line-clamp-1">{lesson.summary}</div>
                    <div className="flex gap-4 items-center text-[10px] text-text-secondary/50 font-mono mt-0.5">
                      <span>slug: {lesson.slug}</span>
                      <span>•</span>
                      <span>Views: {lesson.viewCount}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-semibold text-primary">
                    {lesson.topicName}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center">
                      <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border", getDifficultyColor(lesson.difficulty))}>
                        {lesson.difficulty}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-xs text-text-secondary font-medium">
                    <span className="inline-flex items-center gap-1 justify-center">
                      <Clock className="h-3.5 w-3.5 text-primary" /> {lesson.estimatedMinutes}m
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center">
                      {lesson.isPublished ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="h-3 w-3" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="h-3 w-3" /> Draft
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <a
                        href={`/theory/${lesson.topicSlug}/${lesson.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 hover:bg-neutral-background rounded-lg border border-neutral-border/60 hover:border-primary text-text-secondary hover:text-primary transition-all"
                        title="Preview public article"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </a>
                      <Link href={`/admin/theory/lessons/${lesson.id}/edit`}>
                        <div
                          className="p-1.5 hover:bg-neutral-background rounded-lg border border-neutral-border/60 hover:border-primary text-text-secondary hover:text-primary transition-all cursor-pointer"
                          title="Edit lesson"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </div>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(lesson.id)}
                        className="p-1.5 hover:bg-status-error/10 rounded-lg border border-neutral-border/60 hover:border-status-error text-text-secondary hover:text-status-error transition-all"
                        title="Delete lesson"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && totalElements > pageSize && (
        <div className="flex justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center justify-center px-4 border border-neutral-border rounded-xl text-xs font-semibold text-text-secondary bg-neutral-card/40">
            Page {currentPage + 1} of {Math.ceil(totalElements / pageSize)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={(currentPage + 1) * pageSize >= totalElements}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
