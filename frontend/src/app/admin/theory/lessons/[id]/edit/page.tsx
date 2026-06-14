"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { theoryApi } from "@/api/theory.api";
import type { TheoryLesson, TheoryLessonRequest } from "@/types/theory";
import { TheoryLessonForm } from "@/components/features/theory/TheoryLessonForm";

export default function EditLessonPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [lesson, setLesson] = useState<TheoryLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadLesson() {
      if (!id) return;
      try {
        const data = await theoryApi.getLessonByIdAdmin(Number(id));
        setLesson(data);
      } catch (error) {
        console.error("Failed to load lesson details in editor", error);
        alert("Failed to load lesson details.");
        router.push("/admin/theory/lessons");
      } finally {
        setLoading(false);
      }
    }
    loadLesson();
  }, [id, router]);

  const handleSubmit = async (request: TheoryLessonRequest) => {
    if (!id) return;
    setSubmitting(true);
    try {
      await theoryApi.updateLesson(Number(id), request);
      router.push("/admin/theory/lessons");
    } catch (error) {
      console.error("Failed to update theory lesson", error);
      alert("Error saving lesson details. Please check unique title rules.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-text-secondary">Loading lesson details for edit...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-text-secondary">Lesson details could not be found.</p>
        <button
          onClick={() => router.push("/admin/theory/lessons")}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold"
        >
          Return to list
        </button>
      </div>
    );
  }

  return (
    <TheoryLessonForm
      initialValues={lesson}
      onSubmitAction={handleSubmit}
      submitting={submitting}
      titleText={`Edit Lesson: ${lesson.title}`}
    />
  );
}
