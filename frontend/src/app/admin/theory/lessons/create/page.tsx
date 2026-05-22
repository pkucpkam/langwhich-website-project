"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { theoryApi } from "@/api/theory.api";
import type { TheoryLessonRequest } from "@/types/theory";
import { TheoryLessonForm } from "@/components/features/theory/TheoryLessonForm";

export default function CreateLessonPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (request: TheoryLessonRequest) => {
    setSubmitting(true);
    try {
      await theoryApi.createLesson(request);
      router.push("/admin/theory/lessons");
    } catch (error) {
      console.error("Failed to create theory lesson", error);
      alert("Error publishing lesson. Please verify unique title/slug rules.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TheoryLessonForm
      onSubmitAction={handleSubmit}
      submitting={submitting}
      titleText="Create New Theory Lesson"
    />
  );
}
