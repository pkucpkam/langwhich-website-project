"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Edit3, Sparkles } from "lucide-react";
import { AdminExerciseForm } from "@/features/exercise/components/AdminExerciseForm";
import { QuickImportForm } from "@/features/exercise/components/QuickImportForm";
import { cn } from "@/lib/utils";

export default function AdminExerciseCreatePage() {
  const [activeTab, setActiveTab] = useState<"manual" | "import">("manual");

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
          Specify core metadata constraints or import a full quick test in seconds.
        </p>
      </div>

      {/* Tabs Switch */}
      <div className="flex border-b border-neutral-border gap-6">
        <button
          onClick={() => setActiveTab("manual")}
          className={cn(
            "pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2",
            activeTab === "manual"
              ? "border-primary text-primary"
              : "border-transparent text-text-secondary hover:text-text-primary"
          )}
        >
          <Edit3 className="h-4 w-4" />
          <span>Manual Formulation</span>
        </button>
        <button
          onClick={() => setActiveTab("import")}
          className={cn(
            "pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2",
            activeTab === "import"
              ? "border-primary text-primary"
              : "border-transparent text-text-secondary hover:text-text-primary"
          )}
        >
          <Sparkles className="h-4 w-4 animate-pulse text-amber-400" />
          <span>Quick Test Import</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "manual" ? (
        <AdminExerciseForm />
      ) : (
        <QuickImportForm mode="full" />
      )}
    </div>
  );
}
