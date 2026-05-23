"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";

import React, { useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Image as ImageIcon,
  Table as TableIcon,
  Undo,
  Redo,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Highlighter,
  Trash2,
  Plus,
  Grid3X3,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TiptapEditorProps {
  value: string; // JSON Tiptap string
  onChangeAction: (jsonValue: string) => void;
  placeholder?: string;
  onAutosaveAction?: () => void;
}

export function TiptapEditor({
  value,
  onChangeAction,
  placeholder = "Write your TOEIC learning content here...",
  onAutosaveAction,
}: TiptapEditorProps) {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("saved");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-2xl border border-neutral-border max-w-full max-h-[400px] object-cover my-6 transition-transform duration-200 hover:scale-[1.005]",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "w-full border-collapse my-6 border border-neutral-border rounded-xl overflow-hidden",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "border-b border-neutral-border/50 last:border-0 hover:bg-neutral-card/10 transition-colors",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "px-4 py-3 bg-neutral-card font-semibold text-text-primary border-r border-neutral-border/50 last:border-r-0 text-left",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "px-4 py-3 border-r border-neutral-border/50 last:border-r-0 text-text-secondary text-left",
        },
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChangeAction(JSON.stringify(json));
      setSaveStatus("saving");
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none text-text-secondary focus:outline-none min-h-[400px] p-6 text-base leading-7 space-y-4",
      },
    },
  });

  // Load initial value
  useEffect(() => {
    if (editor && value && editor.isEmpty) {
      try {
        const parsed = JSON.parse(value);
        editor.commands.setContent(parsed);
      } catch (e) {
        editor.commands.setContent(value);
      }
    }
  }, [editor, value]);

  // Debounced autosave indicator
  useEffect(() => {
    if (saveStatus === "saving") {
      const timer = setTimeout(() => {
        setSaveStatus("saved");
        if (onAutosaveAction) onAutosaveAction();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus, onAutosaveAction]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-[450px] rounded-2xl border border-neutral-border bg-neutral-card/50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-text-secondary">Loading rich text editor...</p>
        </div>
      </div>
    );
  }

  const addImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const insertLink = () => {
    const url = prompt("Enter link URL:");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-neutral-border bg-neutral-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 transition-all duration-300">
      {/* Editor Toolbar (Sticky) */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between border-b border-neutral-border bg-neutral-card/95 backdrop-blur-md px-4 py-2 gap-2">
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded-lg hover:bg-neutral-background transition-colors ${editor.isActive("heading", { level: 1 }) ? "text-primary bg-neutral-background" : "text-text-secondary"}`}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded-lg hover:bg-neutral-background transition-colors ${editor.isActive("heading", { level: 2 }) ? "text-primary bg-neutral-background" : "text-text-secondary"}`}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded-lg hover:bg-neutral-background transition-colors ${editor.isActive("heading", { level: 3 }) ? "text-primary bg-neutral-background" : "text-text-secondary"}`}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </button>

          <div className="w-[1px] h-6 bg-neutral-border mx-1" />

          {/* Standard Marks */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-lg hover:bg-neutral-background transition-colors ${editor.isActive("bold") ? "text-primary bg-neutral-background" : "text-text-secondary"}`}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-lg hover:bg-neutral-background transition-colors ${editor.isActive("italic") ? "text-primary bg-neutral-background" : "text-text-secondary"}`}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded-lg hover:bg-neutral-background transition-colors ${editor.isActive("underline") ? "text-primary bg-neutral-background" : "text-text-secondary"}`}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight({ color: "rgba(37, 99, 235, 0.25)" }).run()}
            className={`p-2 rounded-lg hover:bg-neutral-background transition-colors ${editor.isActive("highlight") ? "text-primary bg-neutral-background" : "text-text-secondary"}`}
            title="Highlight Note"
          >
            <Highlighter className="h-4 w-4" />
          </button>

          <div className="w-[1px] h-6 bg-neutral-border mx-1" />

          {/* Lists & Blocks */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-lg hover:bg-neutral-background transition-colors ${editor.isActive("bulletList") ? "text-primary bg-neutral-background" : "text-text-secondary"}`}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded-lg hover:bg-neutral-background transition-colors ${editor.isActive("orderedList") ? "text-primary bg-neutral-background" : "text-text-secondary"}`}
            title="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded-lg hover:bg-neutral-background transition-colors ${editor.isActive("blockquote") ? "text-primary bg-neutral-background" : "text-text-secondary"}`}
            title="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 rounded-lg hover:bg-neutral-background transition-colors ${editor.isActive("codeBlock") ? "text-primary bg-neutral-background" : "text-text-secondary"}`}
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </button>

          <div className="w-[1px] h-6 bg-neutral-border mx-1" />

          {/* Media & Advanced */}
          <button
            type="button"
            onClick={addImage}
            className="p-2 rounded-lg hover:bg-neutral-background text-text-secondary transition-colors"
            title="Add Image URL"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={addTable}
            className={`p-2 rounded-lg hover:bg-neutral-background transition-colors ${editor.isActive("table") ? "text-primary bg-neutral-background" : "text-text-secondary"}`}
            title="Insert Table"
          >
            <TableIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={insertLink}
            className={`p-2 rounded-lg hover:bg-neutral-background transition-colors ${editor.isActive("link") ? "text-primary bg-neutral-background" : "text-text-secondary"}`}
            title="Insert Link"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
        </div>

        {/* History */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded-lg hover:bg-neutral-background text-text-secondary disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded-lg hover:bg-neutral-background text-text-secondary disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </button>

          {/* Save Status Badge */}
          <div className="flex items-center gap-1.5 ml-2 text-xs font-medium border border-neutral-border/80 px-2.5 py-1 rounded-full bg-neutral-card/40">
            {saveStatus === "saved" ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-status-success" />
                <span className="text-text-secondary">Draft Saved</span>
              </>
            ) : (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-primary font-semibold">Autosaving...</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Table Helpers (Only shows when cursor is inside a table) */}
      {editor.isActive("table") && (
        <div className="flex flex-wrap items-center gap-2 bg-neutral-card/60 px-4 py-2 border-b border-neutral-border text-xs text-text-secondary animate-fade-in">
          <span className="flex items-center gap-1 font-semibold text-text-primary mr-2">
            <Grid3X3 className="h-3.5 w-3.5 text-primary" /> Table Actions:
          </span>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            className="px-2 py-1 bg-neutral-background border border-neutral-border hover:border-primary rounded transition-all"
          >
            Add Col Before
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="px-2 py-1 bg-neutral-background border border-neutral-border hover:border-primary rounded transition-all"
          >
            Add Col After
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="px-2 py-1 bg-neutral-background border border-neutral-border hover:border-status-error/50 text-status-error hover:bg-status-error/10 rounded transition-all"
          >
            Delete Col
          </button>
          <div className="w-[1px] h-4 bg-neutral-border" />
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowBefore().run()}
            className="px-2 py-1 bg-neutral-background border border-neutral-border hover:border-primary rounded transition-all"
          >
            Add Row Before
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="px-2 py-1 bg-neutral-background border border-neutral-border hover:border-primary rounded transition-all"
          >
            Add Row After
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="px-2 py-1 bg-neutral-background border border-neutral-border hover:border-status-error/50 text-status-error hover:bg-status-error/10 rounded transition-all"
          >
            Delete Row
          </button>
          <div className="w-[1px] h-4 bg-neutral-border" />
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="px-2 py-1 bg-status-error/20 border border-status-error/30 text-status-error hover:bg-status-error/30 rounded flex items-center gap-1 transition-all"
          >
            <Trash2 className="h-3 w-3" /> Delete Table
          </button>
        </div>
      )}

      {/* Editor Content Area */}
      <div className="bg-neutral-background overflow-y-auto max-h-[600px] border-b border-neutral-border/50">
        <EditorContent editor={editor} />
      </div>

      {/* Editor Footer / Info */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-card/30 text-xs text-text-secondary border-t border-neutral-border/50">
        <div className="flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Rich Text JSON Editor • Autosaves drafts automatically</span>
        </div>
        <div>
          <span>
            Words: {editor.storage.characterCount?.words?.() || 0} • Chars:{" "}
            {editor.storage.characterCount?.characters?.() || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
