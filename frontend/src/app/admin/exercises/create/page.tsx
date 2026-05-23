"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { AdminExerciseForm } from "@/features/exercise/components/AdminExerciseForm";

export default function AdminExerciseCreatePage() {
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

      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span>New Practice Formulation</span>
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Specify core metadata constraints to build your interactive exercise card.
        </p>
      </div>

      {/* Main Exercise Form */}
      <AdminExerciseForm />
    </div>
  );
}
