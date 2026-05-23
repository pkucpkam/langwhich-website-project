"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Search,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { theoryApi } from "@/api/theory.api";
import type { TheoryTopic, TheoryLesson, Difficulty } from "@/types/theory";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

export default function TopicLessonsPage() {
  const params = useParams();
  const router = useRouter();
  const topicSlug = params.topicSlug as string;

  const [topic, setTopic] = useState<TheoryTopic | null>(null);
  const [lessons, setLessons] = useState<TheoryLesson[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Difficulty Filters
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "ALL">("ALL");

  // Pagination
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  // Load Topic Details
  useEffect(() => {
    async function loadTopicDetails() {
      try {
        const topicData = await theoryApi.getTopicBySlug(topicSlug);
        setTopic(topicData);
      } catch (error) {
        console.error("Failed to load topic details", error);
        router.push("/theory");
      }
    }
    if (topicSlug) {
      loadTopicDetails();
    }
  }, [topicSlug, router]);

  // Load Lessons inside Topic
  const loadLessons = useCallback(async () => {
    if (!topicSlug) return;
    setLessonsLoading(true);
    try {
      const data = await theoryApi.getLessonsByTopicSlug(topicSlug, {
        search: debouncedSearch.trim() || undefined,
        difficulty: selectedDifficulty === "ALL" ? undefined : selectedDifficulty,
        page: currentPage,
        size: 9,
      });
      setLessons(data.content);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error("Failed to load lessons for topic", error);
    } finally {
      setLessonsLoading(false);
      setLoading(false);
    }
  }, [topicSlug, debouncedSearch, selectedDifficulty, currentPage]);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  // Reset page when filter inputs change
  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch, selectedDifficulty]);

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

  if (loading && !topic) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-neutral-card/60 animate-pulse rounded-md" />
        <div className="h-28 bg-neutral-card/60 animate-pulse rounded-2xl border border-neutral-border/50" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-neutral-card/60 animate-pulse rounded-2xl border border-neutral-border/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back to Home */}
      <Link
        href="/theory"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to paths
      </Link>

      {/* Topic Header Section */}
      {topic && (
        <section className="bg-gradient-to-br from-primary/10 via-neutral-card to-neutral-background border border-neutral-border rounded-3xl p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl">
              {topic.icon || "📘"}
            </div>
            <div>
              <span className="text-[10px] tracking-widest text-primary font-bold uppercase">Topic Module</span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary mt-0.5">{topic.name}</h1>
            </div>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
            {topic.description}
          </p>
        </section>
      )}

      {/* Filter Section */}
      <section className="bg-neutral-card border border-neutral-border rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder={`Search within ${topic?.name || "topic"}...`}
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

      {/* Lessons List Grid */}
      {lessonsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-neutral-card/60 animate-pulse rounded-2xl border border-neutral-border/50" />
          ))}
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-20 bg-neutral-card/40 rounded-2xl border border-neutral-border/50 p-8">
          <BookOpen className="h-12 w-12 text-text-secondary mx-auto mb-4" />
          <h3 className="text-base font-semibold text-text-primary">No lessons found</h3>
          <p className="text-xs text-text-secondary max-w-xs mx-auto mt-1">
            There are no lessons matching your criteria in this path. Let&apos;s check other study categories!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <Link key={lesson.id} href={`/theory/${topicSlug}/${lesson.slug}`}>
              <Card className="hover:scale-[1.01] hover:border-primary/40 transition-all duration-200 group h-full flex flex-col justify-between cursor-pointer">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border", getDifficultyColor(lesson.difficulty))}>
                      {lesson.difficulty}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-text-secondary">
                      <Clock className="h-3 w-3" />
                      {lesson.estimatedMinutes}m read
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-text-primary text-base line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                      {lesson.summary}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-primary font-semibold pt-4 border-t border-neutral-border/40 mt-6">
                  <span>{lesson.viewCount} Views</span>
                  <span className="flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    Read Article <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {!lessonsLoading && totalElements > 9 && (
        <div className="flex justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center justify-center px-4 border border-neutral-border rounded-xl text-xs font-semibold text-text-secondary bg-neutral-card/40">
            Page {currentPage + 1} of {Math.ceil(totalElements / 9)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={(currentPage + 1) * 9 >= totalElements}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
