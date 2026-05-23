"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Search,
  Sparkles,
  Clock,
  ChevronRight,
  GraduationCap,
  Play,
  HelpCircle,
  FileText,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { exerciseApi } from "@/features/exercise/api";
import { theoryApi } from "@/api/theory.api";
import type { ExerciseSet, Difficulty } from "@/features/exercise/types";
import type { TheoryTopic } from "@/types/theory";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

export default function ExerciseListPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [exercises, setExercises] = useState<ExerciseSet[]>([]);
  const [topics, setTopics] = useState<TheoryTopic[]>([]);
  
  // Filtering & search
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "ALL">("ALL");
  const [selectedTopic, setSelectedTopic] = useState<string>("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(true);

  // Load static topics once
  useEffect(() => {
    async function loadTopics() {
      try {
        setTopicsLoading(true);
        const data = await theoryApi.getPublishedTopics();
        setTopics(data);
      } catch (error) {
        console.error("Failed to load theory topics:", error);
      } finally {
        setTopicsLoading(false);
      }
    }
    loadTopics();
  }, []);

  // Fetch exercise sets on state change
  const fetchExercises = useCallback(async () => {
    setLoading(true);
    try {
      const data = await exerciseApi.getExerciseSets({
        topicSlug: selectedTopic === "ALL" ? undefined : selectedTopic,
        difficulty: selectedDifficulty === "ALL" ? undefined : selectedDifficulty,
        search: debouncedSearch.trim() || undefined,
        page: currentPage,
        size: 9,
      });
      setExercises(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error("Failed to load exercises:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedTopic, selectedDifficulty, debouncedSearch, currentPage]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch, selectedDifficulty, selectedTopic]);

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

  const handleStartPractice = async (setId: number) => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/exercises");
      return;
    }

    try {
      const res = await exerciseApi.startAttempt(setId);
      router.push(`/exercises/${res.attemptId}`);
    } catch (error) {
      console.error("Failed to initialize or resume attempt:", error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-background flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        
        {/* Hero Banner */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 via-neutral-card to-neutral-background border border-neutral-border p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 animate-fade-in">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/25 text-primary-light border border-primary/30">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Skills Practice Engine</span>
            </div>
            <h1 className="text-4xl font-extrabold text-text-primary tracking-tight leading-tight md:text-5xl">
              Sharpen Your Skills with Real-time Practice
            </h1>
            <p className="text-base text-text-secondary leading-relaxed font-normal">
              Validate your grammar knowledge and spelling with instant, interactive question formats. Fully aligned with the latest TOEIC syllabus.
            </p>
          </div>
          <div className="hidden lg:flex w-64 h-64 items-center justify-center bg-primary/5 border border-primary/10 rounded-3xl p-6 relative">
            <div className="absolute inset-0 bg-primary/15 blur-xl opacity-25" />
            <BookOpen className="h-32 w-32 text-primary animate-pulse" />
          </div>
        </section>

        {/* Filters and Navigation */}
        <section className="bg-neutral-card border border-neutral-border rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-text-secondary" />
              <input
                type="text"
                placeholder="Search practice exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-neutral-border bg-neutral-background text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Topic Filter */}
            <div>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                disabled={topicsLoading}
                className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-border bg-neutral-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {(["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={cn(
                    "flex-1 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 whitespace-nowrap text-center",
                    selectedDifficulty === diff
                      ? "bg-primary text-text-primary border-primary shadow-md"
                      : "bg-neutral-background text-text-secondary border-neutral-border hover:border-text-secondary hover:text-text-primary"
                  )}
                >
                  {diff === "ALL" ? "All Levels" : diff}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Exercises Grid */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-text-primary flex items-center gap-2.5">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span>Available Exercises ({totalElements})</span>
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-56 bg-neutral-card/60 animate-pulse rounded-2xl border border-neutral-border/50"
                />
              ))}
            </div>
          ) : exercises.length === 0 ? (
            <div className="text-center py-20 bg-neutral-card/40 rounded-2xl border border-neutral-border/50 p-6 max-w-2xl mx-auto">
              <HelpCircle className="h-12 w-12 text-text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-bold text-text-primary">No exercises found</h3>
              <p className="text-sm text-text-secondary mt-2">
                We couldn&apos;t find any practice exercises matching your selected filters. Let&apos;s try clearing your inputs!
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDifficulty("ALL");
                  setSelectedTopic("ALL");
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exercises.map((set) => (
                <Card
                  key={set.id}
                  className="hover:scale-[1.01] hover:border-primary/45 transition-all duration-200 h-full flex flex-col justify-between group shadow-sm bg-neutral-card border-neutral-border"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-primary font-bold tracking-widest uppercase">
                        {set.topicName ?? "General"}
                      </span>
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider",
                          getDifficultyColor(set.difficulty)
                        )}
                      >
                        {set.difficulty}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-text-primary text-lg group-hover:text-primary transition-colors leading-snug">
                        {set.title}
                      </h3>
                      <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed font-normal">
                        {set.description || "Challenge yourself with interactive grammar validation questions."}
                      </p>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-neutral-border/50 mt-6 flex flex-col gap-4">
                    <div className="flex items-center gap-4 text-xs font-semibold text-text-secondary">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-text-secondary" />
                        {set.estimatedMinutes} mins
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-text-secondary" />
                        {set.questionCount} questions
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      fullWidth
                      className="flex items-center justify-center gap-2 group/btn"
                      onClick={() => handleStartPractice(set.id)}
                    >
                      <Play className="h-4 w-4 fill-white" />
                      <span>Start Practice</span>
                      <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <section className="flex justify-center gap-2 pt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </Button>
            <span className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold bg-neutral-card border border-neutral-border rounded-lg text-text-primary">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages - 1}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </section>
        )}
      </main>
    </div>
  );
}
