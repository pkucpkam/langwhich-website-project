"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Bookmark,
  Share2,
} from "lucide-react";
import { theoryApi } from "@/api/theory.api";
import type { TheoryLesson, Difficulty, LessonNavigation } from "@/types/theory";
import { TiptapRenderer } from "@/components/features/theory/TiptapRenderer";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface TocItem {
  text: string;
  id: string;
  level: number;
}

export default function LessonReaderPage() {
  const params = useParams();
  const router = useRouter();
  const lessonSlug = params.lessonSlug as string;

  const [lesson, setLesson] = useState<TheoryLesson | null>(null);
  const [relatedLessons, setRelatedLessons] = useState<TheoryLesson[]>([]);
  const [siblings, setSiblings] = useState<LessonNavigation>({ previous: null, next: null });
  const [loading, setLoading] = useState(true);

  // Layout states
  const [scrollProgress, setScrollProgress] = useState(0);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate Table of Contents from Tiptap JSON content
  const generateToc = (jsonString: string) => {
    try {
      const doc = JSON.parse(jsonString);
      const items: TocItem[] = [];

      const traverse = (node: any) => {
        if (node.type === "heading" && node.content) {
          const text = node.content.map((c: any) => c.text).join("");
          const id = text
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-");
          const level = node.attrs?.level || 1;
          items.push({ text, id, level });
        }
        if (node.content) {
          node.content.forEach(traverse);
        }
      };

      if (doc && doc.content) {
        doc.content.forEach(traverse);
      }
      setToc(items);
    } catch (e) {
      console.error("Failed to parse TOC from Tiptap content", e);
    }
  };

  // Load Lesson content
  const loadLessonData = useCallback(async () => {
    if (!lessonSlug) return;
    setLoading(true);
    try {
      const lessonData = await theoryApi.getLessonBySlug(lessonSlug, true);
      setLesson(lessonData);
      generateToc(lessonData.content);

      // Load related lessons
      const related = await theoryApi.getRelatedLessons(lessonData.id, lessonData.topicId);
      setRelatedLessons(related);

      // Load sibling navigation
      const nav = await theoryApi.getLessonNavigation(lessonData.id, lessonData.topicId);
      setSiblings(nav);
    } catch (error) {
      console.error("Failed to load lesson details", error);
      router.push("/theory");
    } finally {
      setLoading(false);
    }
  }, [lessonSlug, router]);

  useEffect(() => {
    loadLessonData();
  }, [loadLessonData]);

  // Scroll Progress listener
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for highlighting Toc items as user scrolls
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const headingElements = document.querySelectorAll("article h2, article h3, article h4");

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          setActiveId(visibleEntry.target.id);
        }
      },
      { rootMargin: "0px 0px -60% 0px" }
    );

    headingElements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [lesson]);

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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading && !lesson) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 bg-neutral-card/60 animate-pulse rounded-md" />
        <div className="h-10 w-2/3 bg-neutral-card/60 animate-pulse rounded-md" />
        <div className="flex gap-4">
          <div className="h-4 w-24 bg-neutral-card/60 animate-pulse rounded-md" />
          <div className="h-4 w-24 bg-neutral-card/60 animate-pulse rounded-md" />
        </div>
        <div className="h-96 bg-neutral-card/60 animate-pulse rounded-3xl border border-neutral-border/50" />
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Premium Scroll Progress Bar */}
      <div className="fixed top-0 left-0 h-1 bg-neutral-border w-full z-50">
        <div
          style={{ width: `${scrollProgress}%` }}
          className="h-full bg-primary transition-all duration-100 ease-out"
        />
      </div>

      {/* Header breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          href={`/theory/${lesson?.topicSlug}`}
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to category lessons
        </Link>

        <div className="flex gap-2">
          <button
            type="button"
            className="p-2 rounded-lg border border-neutral-border hover:border-text-secondary text-text-secondary hover:text-text-primary transition-all"
            title="Bookmark lesson"
          >
            <Bookmark className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="p-2 rounded-lg border border-neutral-border hover:border-text-secondary text-text-secondary hover:text-text-primary transition-all"
            title="Share lesson"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Lesson link copied to clipboard!");
            }}
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Layout Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Main Content Column (75%) */}
        <section className="lg:col-span-3 space-y-8 bg-neutral-card/30 border border-neutral-border rounded-3xl p-6 sm:p-8">
          {/* Article Header */}
          {lesson && (
            <div className="space-y-4 border-b border-neutral-border/60 pb-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border", getDifficultyColor(lesson.difficulty))}>
                  {lesson.difficulty}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-text-secondary">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  {lesson.estimatedMinutes} mins read
                </span>
                <span className="text-text-secondary/60 text-xs">•</span>
                <span className="flex items-center gap-1 text-[11px] text-text-secondary">
                  <Eye className="h-3.5 w-3.5 text-primary" />
                  {lesson.viewCount} views
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight leading-tight">
                {lesson.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-xs text-text-secondary pt-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Published on {formatDate(lesson.createdAt)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Lesson Main Image (Thumbnail) */}
          {lesson?.thumbnail && (
            <div className="relative overflow-hidden rounded-2xl border border-neutral-border max-h-[350px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lesson.thumbnail}
                alt={lesson.title}
                className="w-full h-auto object-cover max-h-[350px]"
              />
            </div>
          )}

          {/* Summary / Introduction Callout */}
          {lesson?.summary && (
            <div className="p-4 sm:p-5 bg-primary/5 border border-primary/10 rounded-2xl text-text-primary leading-relaxed text-sm">
              <span className="font-bold text-xs uppercase tracking-widest text-primary block mb-1.5">
                Overview & Summary
              </span>
              {lesson.summary}
            </div>
          )}

          {/* Tiptap Article Content */}
          {lesson && (
            <div className="pt-2">
              <TiptapRenderer contentJson={lesson.content} />
            </div>
          )}
        </section>

        {/* Sidebar Table of Contents (25%) */}
        <aside className="hidden lg:block lg:sticky lg:top-24 space-y-6">
          {toc.length > 0 && (
            <div className="bg-neutral-card border border-neutral-border rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-neutral-border/60 pb-2">
                Table of Contents
              </h3>
              <nav className="space-y-1.5 text-xs font-medium">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={cn(
                      "block transition-colors hover:text-primary leading-relaxed",
                      item.level === 2 ? "pl-3 text-text-secondary" : "text-text-secondary",
                      activeId === item.id ? "text-primary border-l-2 border-primary pl-2.5 font-semibold" : ""
                    )}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            </div>
          )}

          <div className="bg-neutral-card/40 border border-neutral-border rounded-2xl p-5 space-y-4 text-center">
            <BookOpen className="h-6 w-6 text-primary mx-auto" />
            <h4 className="text-sm font-semibold text-text-primary">Need Vocabulary Help?</h4>
            <p className="text-[11px] text-text-secondary">
              Study the full vocabulary library built using spaced repetition to reinforce definitions.
            </p>
            <Link href="/vocab">
              <button
                type="button"
                className="w-full mt-2 py-2 px-3 text-xs font-bold bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary hover:text-white transition-all"
              >
                Go to Word sets
              </button>
            </Link>
          </div>
        </aside>
      </div>

      {/* Sibling Path Navigation Links */}
      {(siblings.previous || siblings.next) && (
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-neutral-border/60">
          {siblings.previous ? (
            <Link href={`/theory/${siblings.previous.topicSlug}/${siblings.previous.slug}`}>
              <div className="flex flex-col bg-neutral-card hover:bg-neutral-card/65 border border-neutral-border hover:border-primary/25 rounded-2xl p-5 cursor-pointer transition-all duration-200 group text-left">
                <span className="text-[10px] text-text-secondary font-bold uppercase flex items-center gap-1">
                  <ChevronLeft className="h-3.5 w-3.5" /> Previous Lesson
                </span>
                <span className="font-bold text-text-primary text-sm line-clamp-1 mt-1.5 group-hover:text-primary transition-colors">
                  {siblings.previous.title}
                </span>
              </div>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}

          {siblings.next && (
            <Link href={`/theory/${siblings.next.topicSlug}/${siblings.next.slug}`}>
              <div className="flex flex-col bg-neutral-card hover:bg-neutral-card/65 border border-neutral-border hover:border-primary/25 rounded-2xl p-5 cursor-pointer transition-all duration-200 group text-right">
                <span className="text-[10px] text-text-secondary font-bold uppercase flex items-center justify-end gap-1">
                  Next Lesson <ChevronRight className="h-3.5 w-3.5" />
                </span>
                <span className="font-bold text-text-primary text-sm line-clamp-1 mt-1.5 group-hover:text-primary transition-colors">
                  {siblings.next.title}
                </span>
              </div>
            </Link>
          )}
        </section>
      )}

      {/* Related Lessons List */}
      {relatedLessons.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-neutral-border/60">
          <div>
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-500" />
              <span>Related Articles in Category</span>
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">Explore corresponding reading selections.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedLessons.slice(0, 3).map((item) => (
              <Link key={item.id} href={`/theory/${item.topicSlug}/${item.slug}`}>
                <Card className="hover:scale-[1.01] hover:border-primary/40 transition-all duration-200 group h-full flex flex-col justify-between cursor-pointer p-5 bg-neutral-card/20">
                  <div className="space-y-3">
                    <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold border block w-max", getDifficultyColor(item.difficulty))}>
                      {item.difficulty}
                    </span>
                    <h3 className="font-semibold text-text-primary text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-text-secondary pt-3 border-t border-neutral-border/30 mt-4">
                    <span>{item.estimatedMinutes}m read</span>
                    <span className="flex items-center gap-0.5 text-primary group-hover:translate-x-0.5 transition-transform">
                      Read <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
