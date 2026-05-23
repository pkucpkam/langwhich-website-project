"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Layers,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import { theoryApi } from "@/api/theory.api";
import type { TheoryTopic, TheoryTopicRequest } from "@/types/theory";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<TheoryTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Edit / Form states
  const [editingTopic, setEditingTopic] = useState<TheoryTopic | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📘");
  const [orderIndex, setOrderIndex] = useState(0);
  const [isPublished, setIsPublished] = useState(true);

  // Modal states
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: "success" | "error";
  }>({
    isOpen: false,
    title: "",
    description: "",
    variant: "success",
  });

  const loadTopics = async () => {
    setLoading(true);
    try {
      const data = await theoryApi.getAllTopicsAdmin();
      setTopics(data);
    } catch (error) {
      console.error("Failed to fetch admin topics list", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const resetForm = () => {
    setEditingTopic(null);
    setName("");
    setDescription("");
    setIcon("📘");
    setOrderIndex(topics.length);
    setIsPublished(true);
  };

  const handleEdit = (topic: TheoryTopic) => {
    setEditingTopic(topic);
    setName(topic.name);
    setDescription(topic.description || "");
    setIcon(topic.icon || "📘");
    setOrderIndex(topic.orderIndex);
    setIsPublished(topic.isPublished);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    const request: TheoryTopicRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      icon: icon.trim() || undefined,
      orderIndex,
      isPublished,
    };

    try {
      if (editingTopic) {
        await theoryApi.updateTopic(editingTopic.id, request);
      } else {
        await theoryApi.createTopic(request);
      }
      resetForm();
      await loadTopics();
      setAlertConfig({
        isOpen: true,
        title: "Category Saved",
        description: editingTopic ? "Category topic updated successfully!" : "New category topic created successfully!",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to save theory topic", error);
      setAlertConfig({
        isOpen: true,
        title: "Save Failed",
        description: "Error saving topic. Please verify unique title/slug rules.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  return (
    <div className="space-y-8">
      {/* Header Title */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Layers className="h-6 w-6 text-primary" />
          <span>Category Topics Manager</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Configure structured TOEIC topic tracks and publish learning branches.
        </p>
      </div>

      {/* Premium Sub-Navigation Tabs */}
      <div className="flex border-b border-neutral-border gap-6">
        <Link
          href="/admin/theory/lessons"
          className="pb-3 text-sm font-semibold border-b-2 border-transparent text-text-secondary hover:text-text-primary transition-all"
        >
          Lessons Catalog
        </Link>
        <Link
          href="/admin/theory/topics"
          className="pb-3 text-sm font-semibold border-b-2 border-primary text-primary transition-all"
        >
          Category Topics
        </Link>
      </div>

      {/* Side-by-side or stacked layout depending on viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Editor Form Panel (1/3) */}
        <div className="lg:col-span-1">
          <Card className="p-6 border border-neutral-border bg-neutral-card">
            <h2 className="text-base font-bold text-text-primary mb-4 flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-primary" />
              <span>{editingTopic ? "Edit Category Details" : "Create New Category"}</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Topic Title *"
                placeholder="e.g. Listening Comprehension"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Brief description
                </label>
                <textarea
                  placeholder="Summarize what students will master inside this module..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-border bg-neutral-background text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Topic Icon"
                  placeholder="Emoji (e.g. 🎧)"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                />
                <Input
                  label="Order Sort Index"
                  type="number"
                  placeholder="0"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(parseInt(e.target.value, 10) || 0)}
                />
              </div>

              {/* Publish Checkbox */}
              <div className="flex items-center gap-2 py-1.5">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-border text-primary bg-neutral-background focus:ring-2 focus:ring-primary focus:ring-offset-0"
                />
                <label htmlFor="isPublished" className="text-xs font-semibold text-text-primary cursor-pointer select-none">
                  Publish immediately (Visible to students)
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                {editingTopic && (
                  <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
                  {editingTopic ? "Save Changes" : "Create Topic"}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Topics Table List (2/3) */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex items-center justify-center py-20 border border-neutral-border bg-neutral-card/20 rounded-2xl">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-neutral-border rounded-2xl bg-neutral-card/10">
              <Layers className="h-10 w-10 text-text-secondary mx-auto mb-3" />
              <h3 className="text-base font-semibold text-text-primary">No topics defined</h3>
              <p className="text-xs text-text-secondary mt-1">Use the builder sidebar to create your first learning path!</p>
            </div>
          ) : (
            <div className="border border-neutral-border rounded-2xl bg-neutral-card/25 overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-neutral-border bg-neutral-card/60 text-text-primary font-bold text-xs uppercase tracking-wider">
                    <th className="px-4 py-3.5 w-12 text-center">Icon</th>
                    <th className="px-4 py-3.5">Topic Details</th>
                    <th className="px-4 py-3.5 w-24 text-center">Index</th>
                    <th className="px-4 py-3.5 w-28 text-center">Status</th>
                    <th className="px-4 py-3.5 w-20 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-border/60">
                  {topics.map((topic) => (
                    <tr key={topic.id} className="hover:bg-neutral-card/45 transition-colors">
                      <td className="px-4 py-4 text-center text-xl">{topic.icon || "📘"}</td>
                      <td className="px-4 py-4 space-y-0.5">
                        <div className="font-bold text-text-primary">{topic.name}</div>
                        <div className="text-xs text-text-secondary line-clamp-1">{topic.description}</div>
                        <div className="text-[10px] text-text-secondary/50 font-mono mt-0.5">slug: {topic.slug}</div>
                      </td>
                      <td className="px-4 py-4 text-center font-mono font-semibold text-text-secondary">
                        {topic.orderIndex}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center">
                          {topic.isPublished ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle className="h-3 w-3" /> Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              <XCircle className="h-3 w-3" /> Draft
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(topic)}
                            className="p-1.5 hover:bg-neutral-background rounded-lg border border-neutral-border/60 hover:border-primary text-text-secondary hover:text-primary transition-all"
                            title="Edit topic"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(topic.id)}
                            className="p-1.5 hover:bg-status-error/10 rounded-lg border border-neutral-border/60 hover:border-status-error text-text-secondary hover:text-status-error transition-all"
                            title="Delete topic"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reusable Modals */}
      <Modal
        isOpen={deleteId !== null}
        title="Delete Category Topic"
        description="Are you sure you want to delete this topic? All lessons associated with it will be deleted!"
        variant="danger"
        confirmLabel="Delete Category"
        onConfirm={async () => {
          if (deleteId === null) return;
          try {
            await theoryApi.deleteTopic(deleteId);
            await loadTopics();
            if (editingTopic?.id === deleteId) {
              resetForm();
            }
            setAlertConfig({
              isOpen: true,
              title: "Category Deleted",
              description: "Category topic has been successfully deleted.",
              variant: "success",
            });
          } catch (error) {
            console.error("Failed to delete theory topic", error);
            setAlertConfig({
              isOpen: true,
              title: "Deletion Failed",
              description: "Error deleting topic. Please try again.",
              variant: "error",
            });
          } finally {
            setDeleteId(null);
          }
        }}
        onClose={() => setDeleteId(null)}
      />

      <Modal
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        description={alertConfig.description}
        variant={alertConfig.variant}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
