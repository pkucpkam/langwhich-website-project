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
  Award,
  BookOpen,
} from "lucide-react";
import { exerciseApi } from "@/features/exercise/api";
import type { ExerciseSet, Difficulty } from "@/features/exercise/types";
import { Button } from "@/components/ui/Button";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

export default function AdminExercisesPage() {
  const [exercises, setExercises] = useState<ExerciseSet[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "ALL">("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");

  // Pagination
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Modals state
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [previewSetId, setPreviewSetId] = useState<number | null>(null);
  const [previewQuestions, setPreviewQuestions] = useState<any[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: "success" | "error";
  }>({
    isOpen: false,
    title: "",
    description: "",
    variant: "success",
  });

  const loadExercises = useCallback(async () => {
    setLoading(true);
    try {
      let isPublishedParam: boolean | undefined = undefined;
      if (selectedStatus === "PUBLISHED") isPublishedParam = true;
      if (selectedStatus === "DRAFT") isPublishedParam = false;

      const data = await exerciseApi.adminGetExerciseSets({
        search: debouncedSearch.trim() || undefined,
        difficulty: selectedDifficulty === "ALL" ? undefined : selectedDifficulty,
        isPublished: isPublishedParam,
        page: currentPage,
        size: pageSize,
      });
      setExercises(data.content);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error("Failed to load admin exercise sets list", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedDifficulty, selectedStatus, currentPage]);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  // Reset page number on filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch, selectedDifficulty, selectedStatus]);

  const handleTogglePublish = async (id: number, currentPublish: boolean) => {
    try {
      await exerciseApi.adminPublishExerciseSet(id, !currentPublish);
      setExercises((prev) =>
        prev.map((ex) => (ex.id === id ? { ...ex, isPublished: !currentPublish } : ex))
      );
      setAlertConfig({
        isOpen: true,
        title: "Status Updated",
        description: !currentPublish ? "Exercise set is now published!" : "Exercise set reverted to draft.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to toggle publish status", error);
      setAlertConfig({
        isOpen: true,
        title: "Update Failed",
        description: "Error toggling publish status.",
        variant: "error",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await exerciseApi.adminDeleteExerciseSet(deleteTargetId);
      setDeleteTargetId(null);
      await loadExercises();
      setAlertConfig({
        isOpen: true,
        title: "Exercise Set Deleted",
        description: "The exercise set has been successfully deleted.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to delete exercise set", error);
      setAlertConfig({
        isOpen: true,
        title: "Deletion Failed",
        description: "Error deleting exercise set.",
        variant: "error",
      });
    }
  };

  const handleOpenPreview = async (id: number) => {
    setPreviewSetId(id);
    setLoadingPreview(true);
    try {
      const data = await exerciseApi.adminGetExerciseSetDetail(id);
      const flatQuestions = data.sections?.flatMap((s) => s.questions) ?? [];
      setPreviewQuestions(flatQuestions);
    } catch (error) {
      console.error("Failed to load preview details", error);
      setPreviewSetId(null);
      setAlertConfig({
        isOpen: true,
        title: "Load Failed",
        description: "Failed to load practice preview.",
        variant: "error",
      });
    } finally {
      setLoadingPreview(false);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>Exercise Catalog Manager</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Build, structure, and publish grammatical multiple choice or fill-in-blank practices.
          </p>
        </div>

        <Link href="/admin/exercises/create">
          <Button variant="primary" size="sm" className="bg-primary hover:bg-primary-hover">
            <Plus className="h-4 w-4" />
            Create Exercise Set
          </Button>
        </Link>
      </div>

      {/* Premium Sub-Navigation Tabs */}
      <div className="flex border-b border-neutral-border gap-6">
        <Link
          href="/admin/exercises"
          className="pb-3 text-sm font-semibold border-b-2 border-primary text-primary transition-all"
        >
          Exercise Catalog
        </Link>
      </div>

      {/* Filters Area */}
      <section className="bg-neutral-card border border-neutral-border rounded-2xl p-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by title or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-neutral-border bg-neutral-background text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-4 w-full lg:w-auto items-center">
            {/* Status Select */}
            <div className="flex items-center gap-2 bg-neutral-background border border-neutral-border p-1 rounded-xl">
              {(["ALL", "PUBLISHED", "DRAFT"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatus(status)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150",
                    selectedStatus === status
                      ? "bg-neutral-card text-text-primary shadow-sm border border-neutral-border/30"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Difficulty Filter */}
            <div className="flex gap-1.5 overflow-x-auto">
              {(["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 whitespace-nowrap",
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
        </div>
      </section>

      {/* Main Exercises Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24 border border-neutral-border bg-neutral-card/15 rounded-2xl">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-neutral-border rounded-2xl bg-neutral-card/10 p-8">
          <BookOpen className="h-12 w-12 text-text-secondary mx-auto mb-4" />
          <h3 className="text-base font-semibold text-text-primary">No exercises found</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto mt-1">
            Let&apos;s build some robust exercise sheets and structured multiple choices to challenge your students!
          </p>
          <Link href="/admin/exercises/create" className="inline-block mt-4">
            <Button variant="primary" size="sm">Create First Exercise</Button>
          </Link>
        </div>
      ) : (
        <div className="border border-neutral-border rounded-2xl bg-neutral-card/25 overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-border bg-neutral-card/60 text-text-primary font-bold text-xs uppercase tracking-wider">
                <th className="px-4 py-3.5">Exercise details</th>
                <th className="px-4 py-3.5">Category Topic</th>
                <th className="px-4 py-3.5 w-32 text-center">Difficulty</th>
                <th className="px-4 py-3.5 w-24 text-center">Questions</th>
                <th className="px-4 py-3.5 w-32 text-center">Status</th>
                <th className="px-4 py-3.5 w-32 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-border/60">
              {exercises.map((ex) => (
                <tr key={ex.id} className="hover:bg-neutral-card/45 transition-colors">
                  <td className="px-4 py-4 space-y-0.5">
                    <div className="font-bold text-text-primary line-clamp-1">{ex.title}</div>
                    <div className="text-xs text-text-secondary line-clamp-1">
                      {ex.description || "No description provided."}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-semibold text-primary">
                    {ex.topicName || "General Topic"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center">
                      <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border", getDifficultyColor(ex.difficulty))}>
                        {ex.difficulty}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-xs text-text-primary font-bold font-mono">
                    {ex.questionCount} Qs
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(ex.id, ex.isPublished)}
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border",
                          ex.isPublished
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                        )}
                      >
                        {ex.isPublished ? (
                          <>
                            <CheckCircle className="h-3 w-3" /> Published
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" /> Draft
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenPreview(ex.id)}
                        className="p-1.5 hover:bg-neutral-background rounded-lg border border-neutral-border/60 hover:border-primary text-text-secondary hover:text-primary transition-all"
                        title="Preview exercise questions"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      
                      <Link href={`/admin/exercises/${ex.id}/edit`}>
                        <div
                          className="p-1.5 hover:bg-neutral-background rounded-lg border border-neutral-border/60 hover:border-primary text-text-secondary hover:text-primary transition-all cursor-pointer"
                          title="Edit exercise set"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </div>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(ex.id)}
                        className="p-1.5 hover:bg-status-error/10 rounded-lg border border-neutral-border/60 hover:border-status-error text-text-secondary hover:text-status-error transition-all"
                        title="Delete exercise set"
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

      {/* Delete Confirmation dialogue */}
      <Modal
        isOpen={deleteTargetId !== null}
        title="Delete Exercise Set?"
        description="Are you sure you want to permanently delete this exercise set? This will permanently delete all associated questions, answers, student attempts, and stats. This action is irreversible."
        variant="danger"
        confirmLabel="Delete Set"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTargetId(null)}
      />

      <Modal
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        description={alertConfig.description}
        variant={alertConfig.variant}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Dynamic Slide-in Preview Modal */}
      {previewSetId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-card border border-neutral-border w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-neutral-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-text-primary text-lg">Practice Questions Preview</h3>
                <p className="text-xs text-text-secondary">Explore all active cards in this set.</p>
              </div>
              <button
                onClick={() => setPreviewSetId(null)}
                className="text-text-secondary hover:text-text-primary text-sm font-semibold px-3 py-1.5 hover:bg-neutral-background rounded-lg border border-neutral-border transition-all"
              >
                Close Preview
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-neutral-background/30">
              {loadingPreview ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs text-text-secondary font-mono">Loading preview data...</p>
                </div>
              ) : previewQuestions.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm text-text-secondary italic">This exercise set contains no questions yet.</p>
                </div>
              ) : (
                previewQuestions.map((q, idx) => (
                  <div key={q.id} className="bg-neutral-card border border-neutral-border rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                        Q{idx + 1}: {q.type}
                      </span>
                      <span className="text-[10px] font-mono text-text-secondary">
                        {q.points} Point{q.points !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-text-primary">{q.questionText}</p>

                    {(() => {
                      const metadata = q.metadata as Record<string, any> | undefined;
                      switch (q.type) {
                        case "MULTIPLE_CHOICE": {
                          const mcOptions = q.options ?? metadata?.options?.map((o: any, idx: number) => ({
                            id: idx,
                            optionText: o.optionText ? o.optionText : (o.key && o.content ? `${o.key}. ${o.content}` : o.content || ""),
                            isCorrect: !!o.isCorrect || o.key === metadata?.correctAnswer,
                          })) ?? [];

                          return (
                            <div className="grid grid-cols-1 gap-2 pl-2">
                              {mcOptions.map((opt: any, oIdx: number) => (
                                <div
                                  key={opt.id || oIdx}
                                  className={cn(
                                    "text-xs p-3 rounded-lg border flex items-center gap-3",
                                    opt.isCorrect
                                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                                      : "bg-neutral-background border-neutral-border/40 text-text-secondary"
                                  )}
                                >
                                  <span className="font-bold text-[10px] uppercase w-5 h-5 rounded flex items-center justify-center bg-neutral-border">
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  <span className="flex-1">{opt.optionText}</span>
                                  {opt.isCorrect && (
                                    <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400">
                                      Correct Option
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        }
                        case "FILL_IN_BLANK": {
                          const accepted = q.correctAnswers ?? metadata?.acceptedAnswers ?? [];
                          return (
                            <div className="bg-neutral-background border border-neutral-border rounded-lg p-3 text-xs space-y-1">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary block">
                                Accepted Blanks:
                              </span>
                              <p className="font-mono text-emerald-400 font-bold leading-relaxed">
                                {accepted.join("  /  ") || "(None Specified)"}
                              </p>
                            </div>
                          );
                        }
                        case "FIND_AND_CORRECT": {
                          const mistake = metadata?.mistakeText ?? "";
                          const accepted = metadata?.acceptedAnswers ?? [];
                          return (
                            <div className="bg-neutral-background border border-neutral-border rounded-lg p-3 text-xs space-y-2">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary block">
                                Mistake Word &amp; Accepted Corrections:
                              </span>
                              <p className="text-xs font-semibold text-text-primary">
                                Mistake: <span className="text-red-400">&quot;{mistake}&quot;</span>
                              </p>
                              <p className="text-xs font-semibold text-text-primary">
                                Accepted corrections: <span className="text-emerald-400">{accepted.join(" or ")}</span>
                              </p>
                            </div>
                          );
                        }
                        case "SENTENCE_REWRITE": {
                          const keyword = metadata?.keyword ?? "";
                          const accepted = q.correctAnswers ?? metadata?.acceptedAnswers ?? [];
                          return (
                            <div className="bg-neutral-background border border-neutral-border rounded-lg p-3 text-xs space-y-2">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary block">
                                Rewrite Prompt details:
                              </span>
                              {keyword && (
                                <p className="text-xs font-semibold text-text-primary">
                                  Keyword: <span className="text-amber-500 font-mono font-bold">&quot;{keyword}&quot;</span>
                                </p>
                              )}
                              <p className="text-xs font-semibold text-text-primary">
                                Accepted sentences: <span className="text-emerald-400">{accepted.join("  /  ")}</span>
                              </p>
                            </div>
                          );
                        }
                        default:
                          return null;
                      }
                    })()}

                    {q.explanation && (
                      <div className="bg-primary/5 border border-primary/15 rounded-lg p-3 text-xs text-text-secondary leading-relaxed">
                        <span className="font-bold text-[9px] uppercase tracking-wider text-primary block mb-1">
                          Explanation:
                        </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
