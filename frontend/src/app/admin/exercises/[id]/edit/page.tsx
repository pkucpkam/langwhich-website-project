"use client";

import React, { use } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { AdminExerciseForm } from "@/features/exercise/components/AdminExerciseForm";

interface EditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AdminExerciseEditPage({ params }: EditPageProps) {
  const resolvedParams = use(params);
  const setId = parseInt(resolvedParams.id, 10);

  if (isNaN(setId)) {
    return (
      <div className="p-8 text-center bg-neutral-card border border-neutral-border rounded-2xl">
        <h2 className="text-lg font-bold text-text-primary">Invalid Param</h2>
        <p className="text-sm text-text-secondary mt-1">Exercise Set ID must be a valid integer.</p>
        <Link href="/admin/exercises" className="inline-block mt-4 text-primary hover:underline text-sm font-semibold">
          Back to exercises
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/admin/exercises"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors border border-neutral-border bg-neutral-card/45 px-3 py-1.5 rounded-lg"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span>Practice Sheet Configuration</span>
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Adjust topic metadata constraints and populate custom Multiple Choice / Fill-in-Blank cards.
        </p>
      </div>

      {/* Main Exercise Form */}
      <AdminExerciseForm setId={setId} />
    </div>
  );
}
