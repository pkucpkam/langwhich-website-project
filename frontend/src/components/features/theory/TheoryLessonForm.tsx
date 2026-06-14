"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  FolderOpen,
  HelpCircle,
  Clock,
  Layout,
  Bookmark,
} from "lucide-react";
import { theoryApi } from "@/api/theory.api";
import type { TheoryTopic, TheoryLesson, TheoryLessonRequest, Difficulty } from "@/types/theory";
import { TiptapEditor } from "./TiptapEditor";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface TheoryLessonFormProps {
  initialValues?: TheoryLesson;
  onSubmitAction: (request: TheoryLessonRequest) => Promise<void>;
  submitting: boolean;
  titleText: string;
}

export function TheoryLessonForm({
  initialValues,
  onSubmitAction,
  submitting,
  titleText,
}: TheoryLessonFormProps) {
  const router = useRouter();

  // Form Fields
  const [title, setTitle] = useState("");
  const [topicId, setTopicId] = useState<number | "">("");
  const [summary, setSummary] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("BEGINNER");
  const [estimatedMinutes, setEstimatedMinutes] = useState(5);
  const [isPublished, setIsPublished] = useState(true);
  const [content, setContent] = useState("");
  
  // Validation alert state
  const [alertOpen, setAlertOpen] = useState(false);

  // Categories Dropdown list
  const [topics, setTopics] = useState<TheoryTopic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);

  useEffect(() => {
    async function loadTopics() {
      try {
        const data = await theoryApi.getAllTopicsAdmin();
        setTopics(data);
        if (data.length > 0 && !initialValues) {
          setTopicId("");
        }
      } catch (error) {
        console.error("Failed to load topics inside editor form", error);
      } finally {
        setLoadingTopics(false);
      }
    }
    loadTopics();
  }, [initialValues]);

  // Load initial values if editing
  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title ?? "");
      setTopicId(initialValues.topicId ?? "");
      setSummary(initialValues.summary || "");
      setThumbnail(initialValues.thumbnail || "");
      setDifficulty(initialValues.difficulty ?? "BEGINNER");
      setEstimatedMinutes(initialValues.estimatedMinutes ?? 5);
      setIsPublished(initialValues.isPublished ?? true);
      setContent(initialValues.content ?? "");
    }
  }, [initialValues]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setAlertOpen(true);
      return;
    }

    const request: TheoryLessonRequest = {
      topicId: topicId ? Number(topicId) : undefined,
      title: title.trim(),
      summary: summary.trim() || undefined,
      thumbnail: thumbnail.trim() || undefined,
      content,
      difficulty,
      estimatedMinutes: Number(estimatedMinutes) || 5,
      isPublished,
    };

    await onSubmitAction(request);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-8">
      {/* Top action block */}
      <div className="flex items-center justify-between border-b border-neutral-border pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/admin/theory/lessons")}
            className="p-1.5 hover:bg-neutral-card rounded-lg text-text-secondary hover:text-text-primary transition-all"
            title="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-text-primary">{titleText}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/theory/lessons")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={submitting}
          >
            {initialValues ? "Update Lesson" : "Publish Lesson"}
          </Button>
        </div>
      </div>

      {/* Main metadata grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left main form editor (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border border-neutral-border bg-neutral-card space-y-4">
            <Input
              label="Lesson Title *"
              placeholder="e.g. Mastering Inversion in Sentence Structures"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Brief Introduction / Summary Callout
              </label>
              <textarea
                placeholder="Give a short overview to spark students' interest..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-border bg-neutral-background text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              />
            </div>
          </Card>

          {/* Tiptap WYSIWYG Editor Block */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider pl-1">
              Article Content Editor (WYSIWYG) *
            </label>
            <TiptapEditor
              value={content}
              onChangeAction={setContent}
              placeholder="Enter rich text, headers, images, tables..."
            />
          </div>
        </div>

        {/* Right configuration sidebar (1/3) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 border border-neutral-border bg-neutral-card space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-neutral-border/60 pb-2">
              Metadata & Attributes
            </h3>

            {/* Category Dropdown Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Topic Category Track (Optional)
              </label>
              {loadingTopics ? (
                <div className="h-10 w-full bg-neutral-background animate-pulse rounded-xl border border-neutral-border" />
              ) : (
                <select
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-border bg-neutral-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="">No Category</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.icon} {topic.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Difficulty Level */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={cn(
                      "py-2 rounded-xl text-[10px] font-bold border transition-all text-center",
                      difficulty === diff
                        ? "bg-primary/10 text-primary border-primary"
                        : "bg-neutral-background text-text-secondary border-neutral-border hover:border-text-secondary"
                    )}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Minutes */}
            <div className="space-y-1.5">
              <Input
                label="Estimated Reading Duration (Minutes)"
                type="number"
                min={1}
                placeholder="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10) || 1)}
              />
            </div>

            {/* Thumbnail Image URL */}
            <div className="space-y-1.5">
              <Input
                label="Header Thumbnail URL"
                placeholder="https://images.unsplash.com/..."
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
              />
            </div>

            {/* Publish Toggle Checkbox */}
            <div className="flex items-center gap-2 border-t border-neutral-border/60 pt-4">
              <input
                type="checkbox"
                id="lessonPublish"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-border text-primary bg-neutral-background focus:ring-2 focus:ring-primary focus:ring-offset-0"
              />
              <label htmlFor="lessonPublish" className="text-xs font-semibold text-text-primary cursor-pointer select-none">
                Publish immediately (Publicly readable)
              </label>
            </div>
          </Card>

          {/* Help Tips Callout */}
          <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex gap-3 text-text-secondary leading-relaxed">
            <Layout className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-[11px] space-y-1">
              <span className="font-bold text-text-primary block">Formatting Guide</span>
              <p>Header styling generates sidebar TOC headings recursively.</p>
              <p>Embed code snippets or standard tables utilizing toolbar extensions directly.</p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={alertOpen}
        title="Required Fields Missing"
        description="Please fill in all the required fields: Title, Topic category track, and Lesson content."
        variant="error"
        onClose={() => setAlertOpen(false)}
      />
    </form>
  );
}
