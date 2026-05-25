"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Filter,
  Sparkles,
  TrendingUp,
  Clock,
  ChevronRight,
  GraduationCap,
  ArrowRight,
  BookOpenCheck,
} from "lucide-react";
import { theoryApi } from "@/api/theory.api";
import type { TheoryTopic, TheoryLesson, Difficulty } from "@/types/theory";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

export default function TheoryHomepage() {
  const [topics, setTopics] = useState<TheoryTopic[]>([]);
  const [popularLessons, setPopularLessons] = useState<TheoryLesson[]>([]);
  const [latestLessons, setLatestLessons] = useState<TheoryLesson[]>([]);

  // Filtering / Search state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "ALL">("ALL");

  // Dynamic lesson search results
  const [searchResults, setSearchResults] = useState<TheoryLesson[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load static dashboard blocks
  useEffect(() => {
    async function loadDashboard() {
      try {
        const [topicsData, popularData, latestData] = await Promise.all([
          theoryApi.getPublishedTopics(),
          theoryApi.getPopularLessons(),
          theoryApi.getLatestLessons(),
        ]);
        setTopics(topicsData);
        setPopularLessons(popularData);
        setLatestLessons(latestData);
      } catch (error) {
        console.error("Failed to load theory dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  // Fetch search results based on inputs
  const fetchSearchResults = useCallback(async () => {
    setSearchLoading(true);
    try {
      const data = await theoryApi.getPublishedLessons({
        search: debouncedSearch.trim() || undefined,
        difficulty: selectedDifficulty === "ALL" ? undefined : selectedDifficulty,
        page: currentPage,
        size: 6,
      });
      setSearchResults(data.content);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error("Failed to search theory lessons", error);
    } finally {
      setSearchLoading(false);
    }
  }, [debouncedSearch, selectedDifficulty, currentPage]);

  useEffect(() => {
    // Only search dynamically if there is a query or a difficulty filter selected
    if (debouncedSearch.trim() || selectedDifficulty !== "ALL") {
      fetchSearchResults();
    } else {
      setSearchResults([]);
      setTotalElements(0);
    }
  }, [debouncedSearch, selectedDifficulty, currentPage, fetchSearchResults]);

  // Reset page on filter changes
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

  const isFiltering = debouncedSearch.trim() !== "" || selectedDifficulty !== "ALL";

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 via-neutral-card to-neutral-background border border-neutral-border p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 animate-fade-in">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/25 text-primary-light border border-primary/30">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Complete Learning Modules</span>
          </div>
          <h1 className="text-4xl font-extrabold text-text-primary tracking-tight leading-tight md:text-5xl">
            Master English Grammar & Skills
          </h1>
          <p className="text-base text-text-secondary leading-relaxed">
            Boost your TOEIC scores with structured lessons designed by expert educators. 
            Deepen your listening comprehension and solidify critical grammar constructs natively.
          </p>
          <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
            <Link href="#topics">
              <Button variant="primary">Browse Topics</Button>
            </Link>
            <Link href="/vocab">
              <Button variant="outline">Learn Vocabulary</Button>
            </Link>
          </div>
        </div>
        <div className="hidden lg:flex w-72 h-72 items-center justify-center bg-primary/5 border border-primary/10 rounded-3xl p-6 relative">
          <div className="absolute inset-0 bg-primary/10 blur-xl opacity-20" />
          <GraduationCap className="h-40 w-40 text-primary animate-pulse-slow" />
        </div>
      </section>

      {/* Search and Filters */}
      <section className="bg-neutral-card border border-neutral-border rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search grammar lessons, listening skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-neutral-border bg-neutral-background text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Difficulty Filters */}
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

      {/* Dynamic Search Results Section */}
      {isFiltering && (
        <section className="space-y-6 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <BookOpenCheck className="h-5 w-5 text-primary" />
              <span>Search Results ({totalElements})</span>
            </h2>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedDifficulty("ALL");
              }}
              className="text-xs text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>

          {searchLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-44 bg-neutral-card/60 animate-pulse rounded-2xl border border-neutral-border/50" />
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-16 bg-neutral-card/40 rounded-2xl border border-neutral-border/50 p-6">
              <Search className="h-10 w-10 text-text-secondary mx-auto mb-3" />
              <h3 className="text-base font-semibold text-text-primary">No lessons found</h3>
              <p className="text-xs text-text-secondary max-w-xs mx-auto mt-1">
                We couldn&apos;t find any lessons matching your criteria. Try adjusting your keywords or filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((lesson) => (
                <Link key={lesson.id} href={`/theory/${lesson.topicSlug}/${lesson.slug}`}>
                  <Card className="hover:scale-[1.01] hover:border-primary/40 transition-all duration-200 h-full flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-primary font-medium tracking-wide uppercase">
                          {lesson.topicName}
                        </span>
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", getDifficultyColor(lesson.difficulty))}>
                          {lesson.difficulty}
                        </span>
                      </div>
                      <h3 className="font-bold text-text-primary text-base line-clamp-2 group-hover:text-primary transition-colors">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                        {lesson.summary}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-text-secondary pt-4 border-t border-neutral-border/40 mt-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {lesson.estimatedMinutes}m read
                      </span>
                      <span>•</span>
                      <span>{lesson.viewCount} views</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Main Categories (Topics) */}
      {!isFiltering && (
        <section id="topics" className="space-y-6 scroll-mt-20">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Learning Path Categories</h2>
            <p className="text-sm text-text-secondary mt-1">
              Structured modules to strengthen fundamental competencies.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-44 bg-neutral-card/60 animate-pulse rounded-2xl border border-neutral-border/50" />
              ))}
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center py-16 bg-neutral-card/40 rounded-2xl border border-neutral-border/50">
              <BookOpen className="h-10 w-10 text-text-secondary mx-auto mb-3" />
              <h3 className="text-base font-semibold text-text-primary">No topics available</h3>
              <p className="text-xs text-text-secondary mt-1">Check back later for exciting new modules!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic) => (
                <Link key={topic.id} href={`/theory/${topic.slug}`}>
                  <Card className="hover:scale-[1.01] hover:border-primary/30 transition-all duration-200 group h-full flex flex-col justify-between cursor-pointer">
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-primary/20 transition-colors">
                        {topic.icon || "📘"}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-text-primary text-lg group-hover:text-primary transition-colors">
                          {topic.name}
                        </h3>
                        <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                          {topic.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-primary font-semibold pt-4 border-t border-neutral-border/40 mt-6">
                      <span>{topic.lessonCount || 0} Lessons</span>
                      <span className="flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                        Start Studying <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Grid of Latest & Popular Lessons (When not searching) */}
      {!isFiltering && !loading && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular Lessons */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-500" />
                <span>Popular Lessons</span>
              </h2>
            </div>

            <div className="space-y-3">
              {popularLessons.slice(0, 4).map((lesson) => (
                <Link key={lesson.id} href={`/theory/${lesson.topicSlug}/${lesson.slug}`} className="block">
                  <div className="flex items-center gap-4 bg-neutral-card hover:bg-neutral-card/75 border border-neutral-border hover:border-primary/25 rounded-2xl p-4 cursor-pointer transition-all duration-200 group">
                    <div className="hidden sm:block w-16 h-16 rounded-xl bg-neutral-background border border-neutral-border/60 overflow-hidden relative flex-shrink-0">
                      {lesson.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={lesson.thumbnail} alt={lesson.title} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary font-bold bg-primary/10">
                          {lesson.topicName?.[0] || "T"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <div className="flex items-center justify-between text-[10px] text-text-secondary font-medium">
                        <span>{lesson.topicName}</span>
                        <span className={cn("px-1.5 py-0.2 rounded border", getDifficultyColor(lesson.difficulty))}>
                          {lesson.difficulty}
                        </span>
                      </div>
                      <h3 className="font-semibold text-text-primary text-sm line-clamp-1 group-hover:text-primary transition-colors">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-text-secondary line-clamp-1 leading-relaxed">
                        {lesson.summary}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Latest Lessons */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>Recently Added</span>
              </h2>
            </div>

            <div className="space-y-3">
              {latestLessons.slice(0, 4).map((lesson) => (
                <Link key={lesson.id} href={`/theory/${lesson.topicSlug}/${lesson.slug}`} className="block">
                  <div className="flex items-center gap-4 bg-neutral-card hover:bg-neutral-card/75 border border-neutral-border hover:border-primary/25 rounded-2xl p-4 cursor-pointer transition-all duration-200 group">
                    <div className="hidden sm:block w-16 h-16 rounded-xl bg-neutral-background border border-neutral-border/60 overflow-hidden relative flex-shrink-0">
                      {lesson.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={lesson.thumbnail} alt={lesson.title} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary font-bold bg-primary/10">
                          {lesson.topicName?.[0] || "T"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <div className="flex items-center justify-between text-[10px] text-text-secondary font-medium">
                        <span>{lesson.topicName}</span>
                        <span className={cn("px-1.5 py-0.2 rounded border", getDifficultyColor(lesson.difficulty))}>
                          {lesson.difficulty}
                        </span>
                      </div>
                      <h3 className="font-semibold text-text-primary text-sm line-clamp-1 group-hover:text-primary transition-colors">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-text-secondary line-clamp-1 leading-relaxed">
                        {lesson.summary}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
