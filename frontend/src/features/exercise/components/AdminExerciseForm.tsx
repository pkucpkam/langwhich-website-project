"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  BookOpen,
  HelpCircle,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  Edit,
  Loader2,
} from "lucide-react";
import { exerciseApi } from "../api";
import { theoryApi } from "@/api/theory.api";
import type { TheoryTopic } from "@/types/theory";
import type { AdminQuestion, Difficulty, ExerciseType } from "../types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface AdminExerciseFormProps {
  setId?: number; // Present only in edit mode
}

export function AdminExerciseForm({ setId }: AdminExerciseFormProps) {
  const router = useRouter();
  const isEditMode = !!setId;

  // Metadata form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("BEGINNER");
  const [estimatedMinutes, setEstimatedMinutes] = useState(10);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [topicId, setTopicId] = useState<number | null>(null);

  // Topics cache
  const [topics, setTopics] = useState<TheoryTopic[]>([]);

  // Page level statuses
  const [loading, setLoading] = useState(isEditMode);
  const [savingMetadata, setSavingMetadata] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Questions builder states
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<"metadata" | "questions">("metadata");

  // Question Form States (for creating/updating a single question)
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null); // null = creating new
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [qType, setQType] = useState<ExerciseType>("MULTIPLE_CHOICE");
  const [qText, setQText] = useState("");
  const [qPoints, setQPoints] = useState(1);
  const [qExplanation, setQExplanation] = useState("");

  // MC options state
  const [options, setOptions] = useState<{ optionText: string; isCorrect: boolean }[]>([
    { optionText: "", isCorrect: true },
    { optionText: "", isCorrect: false },
  ]);

  // FIB correct answers state
  const [fibAnswers, setFibAnswers] = useState<string[]>([]);
  const [fibInput, setFibInput] = useState("");

  // Validation errors
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch topics
  useEffect(() => {
    async function fetchTopics() {
      try {
        const data = await theoryApi.getAllTopicsAdmin();
        setTopics(data);
      } catch (err) {
        console.error("Failed to load theory topics", err);
      }
    }
    fetchTopics();
  }, []);

  // Fetch exercise details if in edit mode
  useEffect(() => {
    if (!isEditMode || setId === undefined) return;

    async function loadDetails() {
      try {
        setLoading(true);
        setError(null);
        const data = await exerciseApi.adminGetExerciseSetDetail(setId as number);

        setTitle(data.title);
        setDescription(data.description || "");
        setDifficulty(data.difficulty);
        setEstimatedMinutes(data.estimatedMinutes);
        setThumbnailUrl(data.thumbnailUrl || "");
        setIsPublished(data.isPublished);
        setTopicId(data.topicId || null);
        setQuestions(data.questions || []);
      } catch (err: any) {
        console.error("Failed to load exercise set details", err);
        setError("We couldn't load this exercise set. It may have been deleted.");
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [isEditMode, setId]);

  // Save metadata
  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    try {
      setSavingMetadata(true);
      setError(null);

      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        topicId: topicId,
        difficulty,
        estimatedMinutes,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        isPublished,
      };

      if (isEditMode && setId) {
        await exerciseApi.adminUpdateExerciseSet(setId, payload);
        alert("Metadata updated successfully!");
      } else {
        const createdSet = await exerciseApi.adminCreateExerciseSet(payload);
        alert("Exercise Set created! Let's add some practice questions next.");
        router.push(`/admin/exercises/${createdSet.id}/edit?tab=questions`);
      }
    } catch (err: any) {
      console.error("Failed to save metadata", err);
      setError(err.response?.data?.message || "Failed to save exercise set metadata.");
    } finally {
      setSavingMetadata(false);
    }
  };

  // Switch tab in Edit mode
  const handleTabChange = (tab: "metadata" | "questions") => {
    setActiveTab(tab);
    setFormError(null);
    setShowQuestionForm(false);
  };

  // Reorder questions on backend
  const syncReorder = async (updatedQuestions: AdminQuestion[]) => {
    try {
      const ids = updatedQuestions.map((q) => q.id);
      await exerciseApi.adminReorderQuestions(ids);
    } catch (err) {
      console.error("Failed to sync reorder with server", err);
      alert("Error syncing new question order with the server.");
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const list = [...questions];
    const temp = list[index];
    list[index] = list[index - 1];
    list[index - 1] = temp;
    setQuestions(list);
    await syncReorder(list);
  };

  const handleMoveDown = async (index: number) => {
    if (index === questions.length - 1) return;
    const list = [...questions];
    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;
    setQuestions(list);
    await syncReorder(list);
  };

  // Add dynamic MC Option row
  const addOptionRow = () => {
    setOptions([...options, { optionText: "", isCorrect: false }]);
  };

  // Remove dynamic MC Option row
  const removeOptionRow = (idx: number) => {
    if (options.length <= 2) {
      alert("Multiple choice questions require at least 2 options.");
      return;
    }
    setOptions(options.filter((_, i) => i !== idx));
  };

  const handleOptionTextChange = (idx: number, text: string) => {
    const list = [...options];
    list[idx].optionText = text;
    setOptions(list);
  };

  const handleOptionCorrectChange = (idx: number) => {
    const list = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === idx, // Enforce single correct option
    }));
    setOptions(list);
  };

  // FIB correct answers dynamic list
  const addFibAnswer = () => {
    if (!fibInput.trim()) return;
    if (fibAnswers.includes(fibInput.trim())) return;
    setFibAnswers([...fibAnswers, fibInput.trim()]);
    setFibInput("");
  };

  const removeFibAnswer = (ansText: string) => {
    setFibAnswers(fibAnswers.filter((a) => a !== ansText));
  };

  // Trigger editing a question
  const startEditQuestion = (q: AdminQuestion) => {
    setEditingQuestionId(q.id);
    setQType(q.type);
    setQText(q.questionText);
    setQPoints(q.points);
    setQExplanation(q.explanation || "");

    if (q.type === "MULTIPLE_CHOICE") {
      setOptions(
        q.options?.map((o) => ({
          optionText: o.optionText,
          isCorrect: o.isCorrect,
        })) || []
      );
    } else {
      setFibAnswers(q.correctAnswers || []);
      setFibInput("");
    }

    setFormError(null);
    setShowQuestionForm(true);
  };

  const startNewQuestion = () => {
    setEditingQuestionId(null);
    setQType("MULTIPLE_CHOICE");
    setQText("");
    setQPoints(1);
    setQExplanation("");
    setOptions([
      { optionText: "", isCorrect: true },
      { optionText: "", isCorrect: false },
    ]);
    setFibAnswers([]);
    setFibInput("");
    setFormError(null);
    setShowQuestionForm(true);
  };

  const handleDeleteQuestion = async (qId: number) => {
    if (!confirm("Are you sure you want to permanently delete this question?")) return;
    try {
      await exerciseApi.adminDeleteQuestion(qId);
      setQuestions(questions.filter((q) => q.id !== qId));
    } catch (err) {
      console.error("Failed to delete question", err);
      alert("Error deleting question.");
    }
  };

  // Save/Submit Question Form
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!qText.trim()) {
      setFormError("Question text is required");
      return;
    }

    const payload: any = {
      type: qType,
      questionText: qText.trim(),
      explanation: qExplanation.trim() || undefined,
      points: qPoints,
      sortOrder: questions.length,
    };

    if (qType === "MULTIPLE_CHOICE") {
      const validOptions = options.filter((o) => o.optionText.trim());
      if (validOptions.length < 2) {
        setFormError("Multiple choice questions require at least 2 non-empty option choices.");
        return;
      }
      const hasCorrect = validOptions.some((o) => o.isCorrect);
      if (!hasCorrect) {
        setFormError("You must select at least one correct option.");
        return;
      }
      payload.options = validOptions.map((o, idx) => ({
        optionText: o.optionText.trim(),
        isCorrect: o.isCorrect,
        sortOrder: idx,
      }));
    } else {
      if (fibAnswers.length === 0) {
        setFormError("You must add at least one accepted fill-in-blank text answer.");
        return;
      }
      payload.correctAnswers = fibAnswers;
    }

    try {
      if (setId === undefined) return;

      if (editingQuestionId) {
        const updated = await exerciseApi.adminUpdateQuestion(editingQuestionId, payload);
        setQuestions((prev) => prev.map((q) => (q.id === editingQuestionId ? updated : q)));
        alert("Question updated successfully!");
      } else {
        const created = await exerciseApi.adminCreateQuestion(setId as number, payload);
        setQuestions([...questions, created]);
        alert("New question added!");
      }
      setShowQuestionForm(false);
    } catch (err: any) {
      console.error("Failed to save question", err);
      setFormError(err.response?.data?.message || "Failed to save question details.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-text-secondary gap-3">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-semibold tracking-wider uppercase animate-pulse">
          Loading catalog parameters...
        </p>
      </div>
    );
  }

  if (error && !title) {
    return (
      <div className="bg-neutral-card border border-neutral-border rounded-2xl p-8 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-status-error mx-auto" />
        <h2 className="text-lg font-bold text-text-primary">Failed to load editor</h2>
        <p className="text-sm text-text-secondary">{error}</p>
        <Button variant="primary" size="sm" onClick={() => router.push("/admin/exercises")}>
          Back to Catalog
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Sub-Navigation and tabs in Edit Mode */}
      {isEditMode && (
        <div className="flex border-b border-neutral-border gap-6">
          <button
            onClick={() => handleTabChange("metadata")}
            className={cn(
              "pb-3 text-sm font-semibold border-b-2 transition-all",
              activeTab === "metadata"
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            )}
          >
            Exercise Metadata
          </button>
          <button
            onClick={() => handleTabChange("questions")}
            className={cn(
              "pb-3 text-sm font-semibold border-b-2 transition-all",
              activeTab === "questions"
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            )}
          >
            Practice Questions ({questions.length})
          </button>
        </div>
      )}

      {/* ERROR MESSAGE DISPLAY */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* METADATA SECTION */}
      {(!isEditMode || activeTab === "metadata") && (
        <form onSubmit={handleSaveMetadata} className="bg-neutral-card border border-neutral-border rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-text-primary">
            {isEditMode ? "Edit Practice Metadata" : "Create New Exercise Set"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                Exercise Title
              </label>
              <input
                type="text"
                placeholder="e.g. Master Subject-Verb Agreement"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-border bg-neutral-background text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Topic Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                Grammar Category Topic
              </label>
              <select
                value={topicId || ""}
                onChange={(e) => setTopicId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-border bg-neutral-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">General (No specific grammar topic)</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Estimated Minutes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                Estimated Duration (Minutes)
              </label>
              <input
                type="number"
                min={1}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                required
                className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-border bg-neutral-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                Target Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-border bg-neutral-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="BEGINNER">BEGINNER</option>
                <option value="INTERMEDIATE">INTERMEDIATE</option>
                <option value="ADVANCED">ADVANCED</option>
              </select>
            </div>

            {/* Thumbnail URL */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                Thumbnail Image URL
              </label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/... (or blank for default)"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-border bg-neutral-background text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                Short Description / Guidelines
              </label>
              <textarea
                placeholder="Give students a brief summary of what this practice set tests and tips to succeed."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-border bg-neutral-background text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center gap-3 md:col-span-2 py-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary focus:ring-2 bg-neutral-background border-neutral-border"
              />
              <label htmlFor="isPublished" className="text-sm font-semibold text-text-primary cursor-pointer select-none">
                Publish immediately (Visible to standard student users)
              </label>
            </div>
          </div>

          <div className="flex gap-4 border-t border-neutral-border pt-6">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="bg-primary hover:bg-primary-hover font-bold text-sm min-w-36"
              isLoading={savingMetadata}
            >
              <Save className="h-4 w-4 mr-2" />
              {isEditMode ? "Update Metadata" : "Save & Continue"}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => router.push("/admin/exercises")}
              className="text-sm font-semibold"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* PRACTICE QUESTIONS BUILDER SECTION */}
      {isEditMode && activeTab === "questions" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Left Panel: Questions List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-text-primary text-base">Questions Catalog</h3>
              <Button
                variant="primary"
                size="sm"
                onClick={startNewQuestion}
                className="bg-primary hover:bg-primary-hover font-bold text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Question
              </Button>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-neutral-border rounded-2xl bg-neutral-card/15 p-6 space-y-2">
                <HelpCircle className="h-8 w-8 text-text-secondary mx-auto" />
                <p className="text-xs text-text-secondary">No questions added yet. Let&apos;s build one!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className={cn(
                      "bg-neutral-card border rounded-xl p-4 flex gap-3 transition-all",
                      editingQuestionId === q.id
                        ? "border-primary shadow shadow-primary/20 bg-primary/5"
                        : "border-neutral-border hover:border-neutral-border/80"
                    )}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold bg-neutral-background px-2 py-0.5 rounded border border-neutral-border/40 text-text-secondary">
                          Q{idx + 1} • {q.type === "MULTIPLE_CHOICE" ? "MC" : "FIB"}
                        </span>
                        <span className="text-[9px] font-bold text-primary">
                          {q.points} Point{q.points !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-text-primary line-clamp-2 leading-relaxed">
                        {q.questionText}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col items-center justify-center gap-1.5 shrink-0 border-l border-neutral-border/60 pl-3">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveUp(idx)}
                          className="p-1 hover:bg-neutral-background rounded border border-neutral-border/60 text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:hover:bg-transparent"
                          title="Move question up"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === questions.length - 1}
                          onClick={() => handleMoveDown(idx)}
                          className="p-1 hover:bg-neutral-background rounded border border-neutral-border/60 text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:hover:bg-transparent"
                          title="Move question down"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => startEditQuestion(q)}
                          className="p-1 hover:bg-primary/10 rounded border border-neutral-border/60 hover:border-primary text-text-secondary hover:text-primary"
                          title="Edit question text and answers"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1 hover:bg-status-error/10 rounded border border-neutral-border/60 hover:border-status-error text-text-secondary hover:text-status-error"
                          title="Delete question card"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel: Question Editor Form Card */}
          <div className="lg:col-span-3">
            {showQuestionForm ? (
              <form onSubmit={handleSaveQuestion} className="bg-neutral-card border border-neutral-border rounded-2xl p-6 space-y-6 sticky top-28">
                <div className="flex items-center justify-between border-b border-neutral-border pb-4">
                  <h3 className="font-bold text-text-primary text-base">
                    {editingQuestionId ? "Update Question Details" : "Construct New Question"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowQuestionForm(false)}
                    className="text-xs font-semibold px-2.5 py-1.5 hover:bg-neutral-background border border-neutral-border rounded-lg text-text-secondary hover:text-text-primary transition-all"
                  >
                    Cancel
                  </button>
                </div>

                {/* Form level error display */}
                {formError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs flex items-center gap-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Type Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block">
                    Question Format Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setQType("MULTIPLE_CHOICE")}
                      className={cn(
                        "px-4 py-3 rounded-xl border text-xs font-bold transition-all",
                        qType === "MULTIPLE_CHOICE"
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-neutral-background border-neutral-border hover:border-text-secondary text-text-secondary"
                      )}
                    >
                      Multiple Choice
                    </button>
                    <button
                      type="button"
                      onClick={() => setQType("FILL_IN_BLANK")}
                      className={cn(
                        "px-4 py-3 rounded-xl border text-xs font-bold transition-all",
                        qType === "FILL_IN_BLANK"
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-neutral-background border-neutral-border hover:border-text-secondary text-text-secondary"
                      )}
                    >
                      Fill in Blank
                    </button>
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block">
                    Question Prompt / Text
                  </label>
                  <textarea
                    placeholder={
                      qType === "MULTIPLE_CHOICE"
                        ? "e.g. Choose the correct verb form: She ___ (go) to school everyday."
                        : "e.g. They ___ (be) studying English since 2020. [Blank answers below will accept correct values]"
                    }
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    required
                    rows={3}
                    className="w-full px-4 py-3 text-xs rounded-xl border border-neutral-border bg-neutral-background text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                {/* Points */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block">
                    Question Weight (Points)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={qPoints}
                    onChange={(e) => setQPoints(Math.max(1, parseInt(e.target.value) || 1))}
                    required
                    className="w-full px-4 py-3 text-xs rounded-xl border border-neutral-border bg-neutral-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                {/* MULTIPLE CHOICE BUILDER FIELDS */}
                {qType === "MULTIPLE_CHOICE" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block">
                        Options & Choices (Select one correct bubble)
                      </label>
                      <button
                        type="button"
                        onClick={addOptionRow}
                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add Option Choice
                      </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correct_option"
                            checked={opt.isCorrect}
                            onChange={() => handleOptionCorrectChange(oIdx)}
                            className="w-4 h-4 text-primary focus:ring-primary focus:ring-2 bg-neutral-background border-neutral-border"
                          />
                          <input
                            type="text"
                            placeholder={`Choice ${String.fromCharCode(65 + oIdx)}`}
                            value={opt.optionText}
                            onChange={(e) => handleOptionTextChange(oIdx, e.target.value)}
                            required
                            className="flex-1 px-3 py-2 text-xs rounded-lg border border-neutral-border bg-neutral-background text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => removeOptionRow(oIdx)}
                            className="p-2 text-text-secondary hover:text-status-error hover:bg-status-error/10 rounded-lg transition-colors border border-neutral-border/50 hover:border-status-error"
                            title="Remove choice"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FILL IN BLANK BUILDER FIELDS */}
                {qType === "FILL_IN_BLANK" && (
                  <div className="space-y-3.5">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block">
                      Accepted Correct Blank Answers (FIB)
                    </label>

                    {/* Add blank form */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. has been"
                        value={fibInput}
                        onChange={(e) => setFibInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addFibAnswer();
                          }
                        }}
                        className="flex-1 px-3 py-2.5 text-xs rounded-xl border border-neutral-border bg-neutral-background text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      />
                      <Button
                        type="button"
                        variant="primary"
                        onClick={addFibAnswer}
                        className="bg-primary text-xs font-bold px-3 py-2 shrink-0"
                      >
                        Add Answer Value
                      </Button>
                    </div>

                    {/* Current blank tags */}
                    {fibAnswers.length === 0 ? (
                      <p className="text-[10px] text-text-secondary italic">
                        Please specify at least one correct fill blank text. Multiple options can be specified for flexibility.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border border-neutral-border bg-neutral-background/40">
                        {fibAnswers.map((ansVal, aIdx) => (
                          <div
                            key={aIdx}
                            className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-1 rounded-md text-xs font-semibold"
                          >
                            <span>{ansVal}</span>
                            <button
                              type="button"
                              onClick={() => removeFibAnswer(ansVal)}
                              className="text-emerald-400 hover:text-emerald-300 font-bold ml-1 text-sm focus:outline-none"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Explanation */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block">
                    Grammar Rule Explanation / Hint
                  </label>
                  <textarea
                    placeholder="Provide explanatory context for correct options (e.g. why 'has been' is correct based on the present perfect continuous rules)."
                    value={qExplanation}
                    onChange={(e) => setQExplanation(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 text-xs rounded-xl border border-neutral-border bg-neutral-background text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex gap-3 border-t border-neutral-border pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="bg-primary hover:bg-primary-hover font-bold text-xs"
                  >
                    <Save className="h-3.5 w-3.5 mr-1" />
                    {editingQuestionId ? "Save Changes" : "Save Question Card"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowQuestionForm(false)}
                    className="text-xs font-semibold px-3 py-1.5 hover:bg-neutral-background border border-neutral-border rounded-lg text-text-secondary hover:text-text-primary transition-all"
                  >
                    Discard Form
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-neutral-card border border-neutral-border rounded-2xl p-8 text-center space-y-4 sticky top-28 py-20 bg-neutral-card/25 border-dashed">
                <FileText className="h-12 w-12 text-text-secondary/60 mx-auto" />
                <h3 className="text-base font-bold text-text-primary">Interactive Question Workspace</h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                  Select an existing question card to modify, or click &quot;Add Question&quot; to build a new Multiple Choice or Fill-in-Blank grammar item.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startNewQuestion}
                  className="font-bold border-primary text-primary hover:bg-primary/10"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add First Question Card
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
