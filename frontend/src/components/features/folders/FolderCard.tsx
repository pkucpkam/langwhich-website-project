"use client";

import type { Folder } from "@/types/vocab";
import Link from "next/link";
import { BookOpen, Pencil, Trash2 } from "lucide-react";

interface FolderCardProps {
  folder: Folder;
  isOwner?: boolean;
  onEdit?: (folder: Folder) => void;
  onDelete?: (id: number) => void;
}

export function FolderCard({
  folder,
  isOwner = false,
  onEdit,
  onDelete,
}: FolderCardProps) {
  return (
    <div
      className="group relative rounded-2xl border border-[#1F2937] bg-[#111827] p-5 hover:border-opacity-60 transition-all duration-200 hover:shadow-lg"
      style={{
        borderColor: `${folder.color}30`,
        boxShadow: "none",
      }}
      id={`folder-card-${folder.id}`}
    >
      {/* Owner actions */}
      {isOwner && (
        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit?.(folder)}
            className="p-1.5 rounded-lg bg-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
            aria-label="Edit folder"
            id={`folder-card-edit-${folder.id}`}
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(folder.id)}
            className="p-1.5 rounded-lg bg-[#1F2937] text-[#9CA3AF] hover:text-red-400 transition-colors"
            aria-label="Delete folder"
            id={`folder-card-delete-${folder.id}`}
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}

      <Link href={`/vocab/folder/${folder.id}`} id={`folder-card-link-${folder.id}`}>
        <div className="flex flex-col items-center text-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
            style={{ backgroundColor: `${folder.color}15` }}
          >
            {folder.icon}
          </div>
          <div>
            <h3 className="font-semibold text-[#F9FAFB] text-sm leading-snug">
              {folder.name}
            </h3>
            <div className="mt-1 flex items-center justify-center gap-1 text-xs text-[#9CA3AF]">
              <BookOpen size={11} />
              <span>{folder.lessonCount} lessons</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
