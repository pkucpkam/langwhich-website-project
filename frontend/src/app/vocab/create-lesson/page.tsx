"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { lessonsApi } from "@/api/lessons.api";
import { foldersApi } from "@/api/folders.api";
import type { Folder, VocabularyItemRequest } from "@/types/vocab";
import { Plus, Trash2, Upload, ArrowLeft, Loader2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { ImportModal } from "@/components/features/lessons/ImportModal";

const EMPTY_ITEM: VocabularyItemRequest = {
  word: "",
  definition: "",
  ipa: "",
  wordType: "",
  exampleEn: "",
  exampleVi: "",
};

export default function CreateLessonPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [folderId, setFolderId] = useState<string>("");
  const [folders, setFolders] = useState<Folder[]>([]);
  const [items, setItems] = useState<VocabularyItemRequest[]>([{ ...EMPTY_ITEM }]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [importModalOpen, setImportModalOpen] = useState(false);

  useEffect(() => {
    foldersApi.getMyFolders().then(setFolders).catch(() => {});
  }, []);

  const addItem = () => {
    setItems([...items, { ...EMPTY_ITEM }]);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof VocabularyItemRequest, value: string) => {
    setItems(items.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
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
      const lesson = await lessonsApi.createLesson({
        title: title.trim(),
        description: description.trim() || undefined,
        isPrivate,
        folderId: folderId ? Number(folderId) : undefined,
        vocabularyItems: validItems,
      });
      router.push(`/vocab/lessons/${lesson.id}`);
    } catch {
      setErrors({ submit: "Failed to create lesson. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/vocab" className="p-2 rounded-xl border border-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB]" id="create-lesson-back">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#F9FAFB]">Create New Lesson</h1>
            <p className="text-sm text-[#9CA3AF]">Add vocabulary words and save as a study set</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/vocab">
            <Button variant="outline" type="button" id="create-lesson-cancel-top">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            form="create-lesson-form"
            variant="primary"
            isLoading={submitting}
            id="create-lesson-submit-top"
          >
            Create Lesson
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} id="create-lesson-form">
        {/* Lesson Info */}
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-6 mb-6 space-y-4">
          <h2 className="text-base font-semibold text-[#F9FAFB]">Lesson Details</h2>

          <Input
            id="create-lesson-title"
            label="Title *"
            placeholder="e.g. TOEIC Vocabulary Part 5"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
          />

          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5" htmlFor="create-lesson-desc">
              Description
            </label>
            <textarea
              id="create-lesson-desc"
              placeholder="Brief description of this lesson..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 text-sm rounded-xl border border-[#1F2937] bg-[#0B1220] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5" htmlFor="create-lesson-folder">
                Folder (optional)
              </label>
              <select
                id="create-lesson-folder"
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
              <label className="flex items-center gap-2 cursor-pointer pb-0.5" htmlFor="create-lesson-private">
                <input
                  type="checkbox"
                  id="create-lesson-private"
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
              <button
                type="button"
                onClick={() => setImportModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#1F2937] text-xs text-[#9CA3AF] hover:text-[#F9FAFB] hover:border-[#2563EB]/50 transition-all font-medium"
                id="create-lesson-import-btn"
              >
                <Upload size={13} />
                Quick Import
              </button>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2563EB] text-xs text-white hover:bg-[#1D4ED8] transition-all font-medium"
                id="create-lesson-add-word"
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
            id="create-lesson-add-word-bottom"
          >
            + Add another word
          </button>
        </div>

        {errors.submit && (
          <p className="text-sm text-red-400 mb-4">{errors.submit}</p>
        )}
      </form>

      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={(importedItems) => setItems(importedItems)}
      />
    </div>
  );
}
