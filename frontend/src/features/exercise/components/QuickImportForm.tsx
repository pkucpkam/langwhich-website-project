"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Sparkles,
  HelpCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Clipboard,
  Play,
  RotateCcw,
  BookOpen,
  Check,
  ChevronRight
} from "lucide-react";
import { exerciseApi } from "../api";
import { parseQuickImportText, ParsedImportData, ParsedQuestion } from "../utils/importParser";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface QuickImportFormProps {
  mode: "full" | "questions-only";
  setId?: number; // Required if mode === "questions-only"
  onSuccess?: (createdSetId: number) => void;
  onCancel?: () => void;
}

const TEXT_EXAMPLE = `Title: Quick Tense Mastery Quiz
Difficulty: INTERMEDIATE
Duration: 15
Description: A highly interactive quiz containing past, present, and perfect tense variations to refine advanced grammatical skills.

---

1. She ___ (finish) her masterpiece before the gallery curator arrived yesterday.
A. finishes
B. was finishing
*C. had finished
D. has finished
Explanation: Past perfect tense 'had finished' describes an action completed prior to another past event ('arrived').
Points: 2

2. They ___ (be) studying the syntax of English clauses since early this morning.
Answer: have been | 've been
Explanation: Present perfect continuous matches the action starting in the past and continuing into the present with plural subject 'they'.
Points: 1

3. Choose the correct form: If I ___ (know) his contact details, I would have sent the files.
A. know
B. knew
*C. had known
D. would know
Explanation: Third conditional uses past perfect 'had known' in the conditional clause.
Points: 2`;

const JSON_EXAMPLE = `{
  "title": "Grammar Challenge (JSON)",
  "difficulty": "ADVANCED",
  "estimatedMinutes": 12,
  "description": "JSON structured import for grammar rules.",
  "questions": [
    {
      "type": "MULTIPLE_CHOICE",
      "questionText": "Hardly ___ entered the classroom when the exam bell rang.",
      "points": 2,
      "explanation": "Inversion rule: 'Hardly had subject + past participle...'",
      "options": [
        { "optionText": "she has", "isCorrect": false },
        { "optionText": "had she", "isCorrect": true },
        { "optionText": "she had", "isCorrect": false }
      ]
    },
    {
      "type": "FILL_IN_BLANK",
      "questionText": "Neither the teacher nor the students ___ (be) present at the seminar yesterday.",
      "points": 1,
      "explanation": "With 'neither... nor...', the verb agrees with the closer subject ('students' is plural, hence 'were').",
      "correctAnswers": ["were"]
    }
  ]
}`;

export function QuickImportForm({ mode, setId, onSuccess, onCancel }: QuickImportFormProps) {
  const router = useRouter();

  // Inputs
  const [inputText, setInputText] = useState("");
  const [parsedData, setParsedData] = useState<ParsedImportData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  // States
  const [isImporting, setIsImporting] = useState(false);
  const [importStep, setImportStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [importLogs, setImportLogs] = useState<string[]>([]);
  const [importError, setImportError] = useState<string | null>(null);

  // Load example initially
  useEffect(() => {
    setInputText(TEXT_EXAMPLE);
  }, []);

  const handleParse = () => {
    setParseError(null);
    if (!inputText.trim()) {
      setParseError("Please input or paste some text first.");
      setParsedData(null);
      return;
    }

    try {
      const parsed = parseQuickImportText(inputText);
      if (parsed.questions.length === 0) {
        setParseError("Could not parse any questions. Check format, line dividers, or prefixes.");
        setParsedData(null);
        return;
      }

      if (mode === "full" && !parsed.title) {
        setParseError("Metadata fields (Title) not found. Add 'Title: Your Quiz Title' in the text or verify JSON properties.");
        setParsedData(null);
        return;
      }

      setParsedData(parsed);
    } catch (err: any) {
      setParseError(`Parse error: ${err.message || "Unknown error parsing content"}`);
      setParsedData(null);
    }
  };

  const loadExample = (type: "text" | "json") => {
    setInputText(type === "text" ? TEXT_EXAMPLE : JSON_EXAMPLE);
    setParsedData(null);
    setParseError(null);
  };

  const handleImport = async () => {
    if (!parsedData || parsedData.questions.length === 0) return;

    setIsImporting(true);
    setImportError(null);
    setImportLogs([]);

    // Total steps: 1 (metadata creation if full) + N questions
    const qCount = parsedData.questions.length;
    const computedTotalSteps = mode === "full" ? 1 + qCount : qCount;
    setTotalSteps(computedTotalSteps);

    let currentStepIndex = 0;
    let targetSetId = setId;

    try {
      // Step 1: Create Exercise Set Metadata (Full Mode)
      if (mode === "full") {
        currentStepIndex++;
        setImportStep(currentStepIndex);
        setImportLogs((prev) => [...prev, `🚀 Initiating Exercise Set creation: "${parsedData.title}"`]);

        const setPayload = {
          title: parsedData.title!.trim(),
          description: parsedData.description?.trim() || "Imported quick practice set.",
          difficulty: parsedData.difficulty || "BEGINNER",
          estimatedMinutes: parsedData.estimatedMinutes || 10,
          isPublished: false, // Default to draft, admin can publish later
        };

        const createdSet = await exerciseApi.adminCreateExerciseSet(setPayload);
        targetSetId = createdSet.id;

        setImportLogs((prev) => [
          ...prev,
          `✅ Exercise Set successfully persisted with ID: ${createdSet.id}`
        ]);
      }

      if (!targetSetId) {
        throw new Error("No target Exercise Set ID resolved.");
      }

      // Step 2: Create questions sequentially to preserve sortOrder and prevent DB lock collisions
      for (let i = 0; i < parsedData.questions.length; i++) {
        currentStepIndex++;
        setImportStep(currentStepIndex);

        const q = parsedData.questions[i];
        setImportLogs((prev) => [
          ...prev,
          `📝 Adding Question ${i + 1}/${qCount} (${q.type === "MULTIPLE_CHOICE" ? "MC" : "FIB"})...`
        ]);

        const questionPayload: any = {
          type: q.type,
          questionText: q.questionText,
          explanation: q.explanation || undefined,
          points: q.points,
          sortOrder: i,
        };

        if (q.type === "MULTIPLE_CHOICE") {
          questionPayload.options = q.options?.map((opt, idx) => ({
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            sortOrder: idx,
          }));
        } else {
          questionPayload.correctAnswers = q.correctAnswers;
        }

        await exerciseApi.adminCreateQuestion(targetSetId, questionPayload);

        setImportLogs((prev) => [
          ...prev,
          `⚡ Question ${i + 1} added successfully!`
        ]);
      }

      setImportLogs((prev) => [...prev, `🏁 Import workflow completed flawlessly!`]);

      setTimeout(() => {
        setIsImporting(false);
        alert(mode === "full"
          ? "Quick Test imported successfully! Redirecting to Exercise editor..."
          : "Questions imported successfully!"
        );

        if (onSuccess) {
          onSuccess(targetSetId!);
        } else {
          router.push(`/admin/exercises/${targetSetId}/edit?tab=questions`);
        }
      }, 1000);

    } catch (err: any) {
      console.error("Import workflow aborted", err);
      const errMsg = err.response?.data?.message || err.message || "Unexpected failure occurred.";
      setImportError(errMsg);
      setImportLogs((prev) => [...prev, `❌ CRITICAL ERROR: ${errMsg}`]);
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-border pb-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>{mode === "full" ? "Import Complete Quick Test" : "Import Quick Questions"}</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            {mode === "full"
              ? "Paste questions generated by AI (ChatGPT/Gemini) or JSON to build an entire test instantly."
              : "Append a list of custom parsed questions to this current exercise."}
          </p>
        </div>

        {/* Examples Loader buttons */}
        <div className="flex gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() => loadExample("text")}
            className="text-xs font-semibold px-3 py-1.5 bg-neutral-card/60 hover:bg-neutral-card border border-neutral-border text-text-secondary hover:text-text-primary rounded-lg transition-all"
          >
            Load Markdown Example
          </button>
          <button
            type="button"
            onClick={() => loadExample("json")}
            className="text-xs font-semibold px-3 py-1.5 bg-neutral-card/60 hover:bg-neutral-card border border-neutral-border text-text-secondary hover:text-text-primary rounded-lg transition-all"
          >
            Load JSON Example
          </button>
        </div>
      </div>

      {/* Main interactive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* LEFT COLUMN: Input Textarea */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest block">
              Quiz Source Input
            </label>
            <button
              onClick={() => {
                navigator.clipboard.readText().then(text => {
                  setInputText(text);
                });
              }}
              className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1.5"
              type="button"
              title="Paste from clipboard"
            >
              <Clipboard className="h-3 w-3" />
              <span>Paste Clipboard</span>
            </button>
          </div>

          <div className="relative group border border-[#1F2937] focus-within:border-primary rounded-2xl overflow-hidden bg-[#111827] shadow-xl transition-all">
            {/* Dynamic Syntax Header Bar */}
            <div className="flex items-center justify-between bg-[#111827] border-b border-[#1F2937] px-4 py-2.5 text-[10px] font-bold tracking-wider">
              <div className="flex items-center gap-2 text-[#9CA3AF]">
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span>SOURCE CODE EDITOR</span>
              </div>
              {inputText.trim() ? (
                inputText.trim().startsWith("{") || inputText.trim().startsWith("[") ? (
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest">
                    JSON Format Detected
                  </span>
                ) : (
                  <span className="bg-primary/10 text-primary border border-primary/25 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest animate-pulse">
                    AI Text Format Detected
                  </span>
                )
              ) : (
                <span className="text-[#9CA3AF]/40 uppercase tracking-widest text-[9px]">Awaiting Input</span>
              )}
            </div>

            {/* Textarea Input */}
            <textarea
              className="w-full h-[400px] p-4 bg-[#0B1220] text-slate-100 font-mono text-xs leading-relaxed placeholder-[#9CA3AF]/40 focus:outline-none resize-none overflow-y-auto"
              placeholder={
                mode === "full"
                  ? "Title: Present Perfect Quiz\nDifficulty: BEGINNER\nDuration: 10\nDescription: Basic test.\n\n---\n\n1. She ___ here since 2018.\nA. lives\n*B. has lived\nExplanation: Tense marker since + past year..."
                  : "1. She ___ here since 2018.\nA. lives\n*B. has lived\nExplanation: Tense marker since + past year..."
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="primary"
              onClick={handleParse}
              className="bg-primary hover:bg-primary-hover flex-1 text-xs font-bold py-2.5"
            >
              <Play className="h-3.5 w-3.5 mr-1.5" />
              Parse & Preview Content
            </Button>
            <button
              type="button"
              onClick={() => {
                setInputText("");
                setParsedData(null);
                setParseError(null);
              }}
              className="px-4 py-2 border border-neutral-border hover:border-text-secondary rounded-xl text-text-secondary hover:text-text-primary text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* PARSING ERROR MESSAGES */}
          {parseError && (
            <div className="bg-red-500/10 border border-red-500/25 text-red-400 p-4 rounded-2xl text-xs flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold">Parsing Validation Failed</p>
                <p className="mt-0.5 opacity-90">{parseError}</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Parse Preview Panel */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-widest block">
            Interactive Parse Preview
          </label>

          <div className="border border-neutral-border rounded-2xl bg-neutral-card/45 h-[450px] flex flex-col overflow-hidden">
            {!parsedData ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-text-secondary space-y-3">
                <FileText className="h-10 w-10 opacity-40 text-text-secondary" />
                <h4 className="text-sm font-bold text-text-primary">Ready to parse</h4>
                <p className="text-[11px] max-w-xs leading-relaxed">
                  Provide your structured raw text or valid JSON object in the left panel, and click &quot;Parse & Preview&quot; to inspect parsed items before database persistence.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Parsed Metadata Header (Mode Full) */}
                {mode === "full" && (
                  <div className="bg-neutral-card border-b border-neutral-border p-4 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-[11px] uppercase tracking-widest font-bold text-text-secondary">Parsed Metadata</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-text-primary leading-snug">{parsedData.title}</h3>
                      {parsedData.description && (
                        <p className="text-[10px] text-text-secondary line-clamp-2 mt-0.5 leading-normal">{parsedData.description}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-primary/10 border border-primary/25 text-primary">
                        {parsedData.difficulty || "BEGINNER"}
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-neutral-background border border-neutral-border text-text-secondary">
                        ⏱️ {parsedData.estimatedMinutes || 10} Mins
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                        📚 {parsedData.questions.length} Question{parsedData.questions.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                )}

                {/* Parsed Questions List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-neutral-background/10">
                  {mode === "questions-only" && (
                    <div className="text-[10px] uppercase font-bold text-text-secondary tracking-widest flex items-center gap-1.5 pb-2 border-b border-neutral-border/50">
                      <span>Importing {parsedData.questions.length} Question{parsedData.questions.length !== 1 ? "s" : ""}</span>
                    </div>
                  )}

                  {parsedData.questions.map((q, idx) => (
                    <div key={idx} className="bg-neutral-card border border-neutral-border rounded-xl p-3.5 space-y-2.5 transition-all hover:border-neutral-border/80">
                      <div className="flex items-center justify-between border-b border-neutral-border/40 pb-1.5">
                        <span className="text-[10px] font-bold bg-neutral-background px-2 py-0.5 rounded border border-neutral-border/30 text-text-secondary">
                          Question {idx + 1} • {q.type === "MULTIPLE_CHOICE" ? "MC" : "FIB"}
                        </span>
                        <span className="text-[10px] font-bold text-primary">
                          {q.points} Point{q.points !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <p className="text-[11px] font-semibold text-text-primary leading-relaxed">{q.questionText}</p>

                      {/* Display MC options */}
                      {q.type === "MULTIPLE_CHOICE" && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={cn(
                                "p-2 rounded-lg border text-[10px] font-semibold flex items-center justify-between gap-1.5",
                                opt.isCorrect
                                  ? "bg-emerald-500/5 border-emerald-500/25 text-emerald-400"
                                  : "bg-neutral-background/50 border-neutral-border/60 text-text-secondary"
                              )}
                            >
                              <span className="truncate">{String.fromCharCode(65 + oIdx)}. {opt.optionText}</span>
                              {opt.isCorrect && <CheckCircle className="h-3 w-3 shrink-0 text-emerald-400" />}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Display FIB accepted answers */}
                      {q.type === "FILL_IN_BLANK" && q.correctAnswers && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest self-center mr-1">Correct answers:</span>
                          {q.correctAnswers.map((ansVal, aIdx) => (
                            <span
                              key={aIdx}
                              className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded text-[10px] font-bold"
                            >
                              {ansVal}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Display Explanation */}
                      {q.explanation && (
                        <p className="text-[10px] italic text-text-secondary bg-neutral-background/40 border border-neutral-border/20 p-2 rounded-lg leading-normal">
                          💡 <span className="font-semibold text-text-primary">Reasoning:</span> {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Import triggers */}
                <div className="p-4 bg-neutral-card border-t border-neutral-border flex gap-3">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleImport}
                    className="bg-emerald-600 hover:bg-emerald-500 flex-1 text-xs font-bold py-2.5 text-white"
                  >
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                    Confirm & Save to Database
                  </Button>
                  {onCancel && (
                    <button
                      type="button"
                      onClick={onCancel}
                      className="px-4 py-2 hover:bg-neutral-background border border-neutral-border rounded-xl text-text-secondary hover:text-text-primary text-xs font-semibold transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEQUENTIAL IMPORT PROGRESS MODAL OVERLAY */}
      {isImporting && (
        <div className="fixed inset-0 bg-neutral-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-card border border-neutral-border rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 text-primary animate-spin shrink-0" />
              <div>
                <h3 className="font-bold text-text-primary text-base">Database Sync In Progress</h3>
                <p className="text-xs text-text-secondary mt-0.5">Saving your curated exercise card metadata and questions...</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
                <span>Completed Tasks</span>
                <span className="text-primary font-mono">{importStep} / {totalSteps} ({Math.round((importStep / totalSteps) * 100)}%)</span>
              </div>
              <div className="w-full bg-neutral-background h-2 rounded-full overflow-hidden border border-neutral-border/60">
                <div
                  className="bg-primary h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(importStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Steps execution logs */}
            <div className="bg-neutral-background border border-neutral-border rounded-xl p-3 h-32 overflow-y-auto font-mono text-[10px] text-text-secondary leading-relaxed space-y-1">
              {importLogs.map((log, idx) => (
                <div key={idx} className="flex gap-1.5 items-start">
                  <ChevronRight className="h-3 w-3 mt-0.5 text-text-secondary shrink-0" />
                  <span className="text-text-primary">{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
