"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { lessonsApi } from "@/api/lessons.api";
import { foldersApi } from "@/api/folders.api";
import { useAuthStore } from "@/store/auth.store";
import type { Folder, VocabularyItemRequest } from "@/types/vocab";
import { Plus, Trash2, Upload, ArrowLeft, Loader2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

const EMPTY_ITEM: VocabularyItemRequest = {
  word: "",
  definition: "",
  ipa: "",
  wordType: "",
  exampleEn: "",
  exampleVi: "",
};

export default function EditLessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [folderId, setFolderId] = useState<string>("");
  const [folders, setFolders] = useState<Folder[]>([]);
  const [items, setItems] = useState<VocabularyItemRequest[]>([{ ...EMPTY_ITEM }]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchLesson = useCallback(async () => {
    try {
      const data = await lessonsApi.getLessonById(Number(lessonId));
      if (user && data.creatorId !== user.id && user.role !== "ADMIN") {
        router.push("/vocab");
        return;
      }
      setTitle(data.title);
      setDescription(data.description ?? "");
      setIsPrivate(data.isPrivate);
      setFolderId(data.folderId ? String(data.folderId) : "");
      if (data.vocabularyItems && data.vocabularyItems.length > 0) {
        setItems(
          data.vocabularyItems.map((v) => ({
            word: v.word,
            definition: v.definition,
            ipa: v.ipa ?? "",
            wordType: v.wordType ?? "",
            exampleEn: v.exampleEn ?? "",
            exampleVi: v.exampleVi ?? "",
          }))
        );
      }
    } catch {
      router.push("/vocab");
    }
  }, [lessonId, router, user]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        fetchLesson(),
        foldersApi.getMyFolders().then(setFolders).catch(() => {}),
      ]);
      setLoading(false);
    };
    init();
  }, [fetchLesson]);

  const addItem = () => {
    setItems([...items, { ...EMPTY_ITEM }]);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof VocabularyItemRequest, value: string) => {
    setItems(items.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 }) as string[][];

      const imported: VocabularyItemRequest[] = rows
        .filter((row) => row[0] && row[1])
        .map((row) => ({
          word: row[0] ?? "",
          definition: row[1] ?? "",
          ipa: row[2] ?? "",
          wordType: row[3] ?? "",
          exampleEn: row[4] ?? "",
          exampleVi: row[5] ?? "",
        }));

      if (imported.length > 0) {
        setItems(imported);
      }
    } catch {
      alert("Failed to parse Excel file. Make sure it's a valid .xlsx file.");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required";
    const validItems = items.filter((it) => it.word.trim() && it.definition.trim());
    if (validItems.length === 0) errs.items = "Add at least one vocabulary item";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const validItems = items.filter((it) => it.word.trim() && it.definition.trim());
      await lessonsApi.updateLesson(Number(lessonId), {
        title: title.trim(),
        description: description.trim() || undefined,
        isPrivate,
        folderId: folderId ? Number(folderId) : undefined,
        vocabularyItems: validItems,
      });
      router.push(`/vocab/lessons/${lessonId}`);
    } catch {
      setErrors({ submit: "Failed to save changes. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={32} className="animate-spin text-[#2563EB]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/vocab/lessons/${lessonId}`}
          className="p-2 rounded-xl border border-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB]"
          id="edit-lesson-back"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#F9FAFB]">Edit Study Set</h1>
          <p className="text-sm text-[#9CA3AF]">Modify vocabulary words and details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} id="edit-lesson-form">
        {/* Lesson Info */}
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-6 mb-6 space-y-4">
          <h2 className="text-base font-semibold text-[#F9FAFB]">Lesson Details</h2>

          <Input
            id="edit-lesson-title"
            label="Title *"
            placeholder="e.g. TOEIC Vocabulary Part 5"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
          />

          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5" htmlFor="edit-lesson-desc">
              Description
            </label>
            <textarea
              id="edit-lesson-desc"
              placeholder="Brief description of this lesson..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 text-sm rounded-xl border border-[#1F2937] bg-[#0B1220] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5" htmlFor="edit-lesson-folder">
                Folder (optional)
              </label>
              <select
                id="edit-lesson-folder"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-[#1F2937] bg-[#0B1220] text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
              >
                <option value="">No folder</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.icon} {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer pb-0.5" htmlFor="edit-lesson-private">
                <input
                  type="checkbox"
                  id="edit-lesson-private"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-4 h-4 rounded border-[#1F2937] accent-[#2563EB]"
                />
                <span className="text-sm text-[#9CA3AF]">Private lesson</span>
              </label>
            </div>
          </div>
        </div>

        {/* Vocabulary Items */}
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#F9FAFB]">
                Vocabulary Items
              </h2>
              <p className="text-xs text-[#9CA3AF]">{items.length} words</p>
            </div>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelImport}
                className="hidden"
                id="excel-import-input"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#1F2937] text-xs text-[#9CA3AF] hover:text-[#F9FAFB] hover:border-[#2563EB]/50 transition-all"
                id="edit-lesson-import-excel"
              >
                <Upload size={13} />
                Import Excel
              </button>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2563EB] text-xs text-white hover:bg-[#1D4ED8] transition-all font-medium"
                id="edit-lesson-add-word"
              >
                <Plus size={13} />
                Add Word
              </button>
            </div>
          </div>

          {errors.items && (
            <p className="text-sm text-red-400 mb-4">{errors.items}</p>
          )}

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-[#1F2937] bg-[#0B1220] p-4"
                id={`vocab-item-${idx}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <GripVertical size={14} className="text-[#9CA3AF]" />
                  <span className="text-xs font-semibold text-[#9CA3AF]">
                    #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="ml-auto p-1 rounded text-[#9CA3AF] hover:text-red-400 transition-colors"
                    aria-label="Remove word"
                    id={`vocab-item-remove-${idx}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      id={`vocab-item-word-${idx}`}
                      type="text"
                      placeholder="Word *"
                      value={item.word}
                      onChange={(e) => updateItem(idx, "word", e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[#1F2937] bg-[#111827] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
                    />
                  </div>
                  <div>
                    <input
                      id={`vocab-item-def-${idx}`}
                      type="text"
                      placeholder="Definition *"
                      value={item.definition}
                      onChange={(e) => updateItem(idx, "definition", e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[#1F2937] bg-[#111827] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
                    />
                  </div>
                  <div>
                    <input
                      id={`vocab-item-ipa-${idx}`}
                      type="text"
                      placeholder="IPA (optional)"
                      value={item.ipa}
                      onChange={(e) => updateItem(idx, "ipa", e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[#1F2937] bg-[#111827] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
                    />
                  </div>
                  <div>
                    <select
                      id={`vocab-item-type-${idx}`}
                      value={item.wordType}
                      onChange={(e) => updateItem(idx, "wordType", e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[#1F2937] bg-[#111827] text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
                    >
                      <option value="">Word type (optional)</option>
                      <option value="noun">Noun</option>
                      <option value="verb">Verb</option>
                      <option value="adjective">Adjective</option>
                      <option value="adverb">Adverb</option>
                      <option value="phrase">Phrase</option>
                      <option value="idiom">Idiom</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      id={`vocab-item-ex-en-${idx}`}
                      type="text"
                      placeholder="Example sentence (English)"
                      value={item.exampleEn}
                      onChange={(e) => updateItem(idx, "exampleEn", e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[#1F2937] bg-[#111827] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      id={`vocab-item-ex-vi-${idx}`}
                      type="text"
                      placeholder="Example translation (Vietnamese)"
                      value={item.exampleVi}
                      onChange={(e) => updateItem(idx, "exampleVi", e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[#1F2937] bg-[#111827] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-4 w-full py-3 rounded-xl border border-dashed border-[#1F2937] text-sm text-[#9CA3AF] hover:border-[#2563EB]/50 hover:text-[#2563EB] transition-all"
            id="edit-lesson-add-word-bottom"
          >
            + Add another word
          </button>
        </div>

        {errors.submit && (
          <p className="text-sm text-red-400 mb-4">{errors.submit}</p>
        )}

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <Link href={`/vocab/lessons/${lessonId}`}>
            <Button variant="outline" type="button" id="edit-lesson-cancel">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            isLoading={submitting}
            id="edit-lesson-submit"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
