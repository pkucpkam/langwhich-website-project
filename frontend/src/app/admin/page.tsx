"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { adminApi, type UserSummary } from "@/api/admin.api";
import { lessonsApi } from "@/api/lessons.api";
import { theoryApi } from "@/api/theory.api";
import type { Lesson, Folder } from "@/types/vocab";
import type { TheoryArticle, TheoryFolder } from "@/types/theory";
import { Users, BookOpen, FolderOpen, Loader2, Star, Plus, Lock, Globe, X, FileText, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const FOLDER_COLORS = ["#2563EB", "#22C55E", "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6"];
const FOLDER_ICONS = ["📚", "💼", "💡", "🎯", "🔥", "🌍", "💻", "🎨", "🌟"];

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Top-level module derived from URL query parameter (tab=vocab, tab=theory, tab=users)
  const activeModule = searchParams.get("tab") || "vocab";

  // Local sub-tabs
  const [vocabSubTab, setVocabSubTab] = useState<"folders" | "sets">("folders");
  const [theorySubTab, setTheorySubTab] = useState<"folders" | "articles">("folders");

  const [loading, setLoading] = useState(true);

  // Data states
  const [usersList, setUsersList] = useState<UserSummary[]>([]);
  const [lessonsList, setLessonsList] = useState<Lesson[]>([]);
  const [vocabFoldersList, setVocabFoldersList] = useState<Folder[]>([]);
  const [theoryFoldersList, setTheoryFoldersList] = useState<TheoryFolder[]>([]);
  const [theoryArticlesList, setTheoryArticlesList] = useState<TheoryArticle[]>([]);

  // Vocab Folder modal
  const [vocabFolderModalOpen, setVocabFolderModalOpen] = useState(false);
  const [vocabFolderName, setVocabFolderName] = useState("");
  const [vocabFolderDesc, setVocabFolderDesc] = useState("");
  const [vocabFolderColor, setVocabFolderColor] = useState(FOLDER_COLORS[0]);
  const [vocabFolderIcon, setVocabFolderIcon] = useState(FOLDER_ICONS[0]);
  const [vocabFolderSubmitting, setVocabFolderSubmitting] = useState(false);

  // Theory Folder modal
  const [theoryFolderModalOpen, setTheoryFolderModalOpen] = useState(false);
  const [selectedTheoryFolder, setSelectedTheoryFolder] = useState<TheoryFolder | null>(null);
  const [theoryFolderName, setTheoryFolderName] = useState("");
  const [theoryFolderDesc, setTheoryFolderDesc] = useState("");
  const [theoryFolderColor, setTheoryFolderColor] = useState(FOLDER_COLORS[0]);
  const [theoryFolderIcon, setTheoryFolderIcon] = useState(FOLDER_ICONS[0]);
  const [theoryFolderSubmitting, setTheoryFolderSubmitting] = useState(false);

  // Theory Article modal
  const [theoryArticleModalOpen, setTheoryArticleModalOpen] = useState(false);
  const [selectedTheoryArticle, setSelectedTheoryArticle] = useState<TheoryArticle | null>(null);
  const [theoryArticleTitle, setTheoryArticleTitle] = useState("");
  const [theoryArticleSummary, setTheoryArticleSummary] = useState("");
  const [theoryArticleContent, setTheoryArticleContent] = useState("");
  const [theoryArticleFolderId, setTheoryArticleFolderId] = useState<number | "">("");
  const [theoryArticleSubmitting, setTheoryArticleSubmitting] = useState(false);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeModule === "users") {
        const uData = await adminApi.getUsers(0, 100);
        setUsersList(uData.content);
      } else if (activeModule === "vocab") {
        if (vocabSubTab === "folders") {
          const fData = await adminApi.getOfficialFolders();
          setVocabFoldersList(fData);
        } else {
          const lData = await adminApi.getAllLessons(0, 100);
          setLessonsList(lData.content);
        }
      } else if (activeModule === "theory") {
        if (theorySubTab === "folders") {
          const tfData = await theoryApi.getFolders();
          setTheoryFoldersList(tfData);
        } else {
          const taData = await theoryApi.getArticles(undefined, undefined, 0, 100);
          setTheoryArticlesList(taData.content);

          const tfData = await theoryApi.getFolders();
          setTheoryFoldersList(tfData);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [activeModule, vocabSubTab, theorySubTab]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // ===== VOCAB FOLDER ACTION =====
  const handleCreateVocabFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vocabFolderName.trim()) return;

    setVocabFolderSubmitting(true);
    try {
      await adminApi.createOfficialFolder({
        name: vocabFolderName.trim(),
        description: vocabFolderDesc.trim() || undefined,
        color: vocabFolderColor,
        icon: vocabFolderIcon,
      });
      setVocabFolderModalOpen(false);
      await loadAdminData();
    } catch {
      alert("Failed to create vocabulary folder.");
    } finally {
      setVocabFolderSubmitting(false);
    }
  };

  const handleToggleVocabPrivacy = async (id: number) => {
    try {
      await lessonsApi.togglePrivacy(id);
      await loadAdminData();
    } catch {
      // ignore
    }
  };

  const handleDeleteVocabLesson = async (id: number) => {
    if (!confirm("Are you sure you want to delete this study set? This action cannot be undone.")) return;
    try {
      await adminApi.deleteLesson(id);
      await loadAdminData();
    } catch {
      alert("Failed to delete the study set.");
    }
  };

  // ===== THEORY FOLDER ACTIONS =====
  const handleOpenTheoryFolderModal = (folder: TheoryFolder | null = null) => {
    setSelectedTheoryFolder(folder);
    if (folder) {
      setTheoryFolderName(folder.name);
      setTheoryFolderDesc(folder.description || "");
      setTheoryFolderColor(folder.color || FOLDER_COLORS[0]);
      setTheoryFolderIcon(folder.icon || FOLDER_ICONS[0]);
    } else {
      setTheoryFolderName("");
      setTheoryFolderDesc("");
      setTheoryFolderColor(FOLDER_COLORS[0]);
      setTheoryFolderIcon(FOLDER_ICONS[0]);
    }
    setTheoryFolderModalOpen(true);
  };

  const handleSaveTheoryFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theoryFolderName.trim()) return;

    setTheoryFolderSubmitting(true);
    try {
      const payload: TheoryFolder = {
        name: theoryFolderName.trim(),
        description: theoryFolderDesc.trim() || undefined,
        color: theoryFolderColor,
        icon: theoryFolderIcon,
      };

      if (selectedTheoryFolder?.id) {
        await adminApi.updateTheoryFolder(selectedTheoryFolder.id, payload);
      } else {
        await adminApi.createTheoryFolder(payload);
      }
      setTheoryFolderModalOpen(false);
      await loadAdminData();
    } catch {
      alert("Failed to save the theory folder.");
    } finally {
      setTheoryFolderSubmitting(false);
    }
  };

  const handleDeleteTheoryFolder = async (id: number) => {
    if (!confirm("Are you sure you want to delete this theory folder? Articles inside will lose their collection links.")) return;
    try {
      await adminApi.deleteTheoryFolder(id);
      await loadAdminData();
    } catch {
      alert("Failed to delete the theory folder.");
    }
  };

  // ===== THEORY ARTICLE ACTIONS =====
  const handleOpenTheoryArticleModal = (article: TheoryArticle | null = null) => {
    setSelectedTheoryArticle(article);
    if (article) {
      setTheoryArticleTitle(article.title);
      setTheoryArticleSummary(article.summary || "");
      setTheoryArticleContent(article.content);
      setTheoryArticleFolderId(article.folder?.id ?? "");
    } else {
      setTheoryArticleTitle("");
      setTheoryArticleSummary("");
      setTheoryArticleContent("");
      setTheoryArticleFolderId(theoryFoldersList[0]?.id ?? "");
    }
    setTheoryArticleModalOpen(true);
  };

  const handleSaveTheoryArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theoryArticleTitle.trim() || !theoryArticleContent.trim()) return;

    setTheoryArticleSubmitting(true);
    try {
      const payload: TheoryArticle = {
        title: theoryArticleTitle.trim(),
        category: "",
        summary: theoryArticleSummary.trim() || undefined,
        content: theoryArticleContent.trim(),
      };

      const folderId = theoryArticleFolderId ? Number(theoryArticleFolderId) : undefined;

      if (selectedTheoryArticle?.id) {
        await adminApi.updateTheoryArticle(selectedTheoryArticle.id, payload, folderId);
      } else {
        await adminApi.createTheoryArticle(payload, folderId);
      }
      setTheoryArticleModalOpen(false);
      await loadAdminData();
    } catch {
      alert("Failed to save the theory article.");
    } finally {
      setTheoryArticleSubmitting(false);
    }
  };

  const handleDeleteTheoryArticle = async (id: number) => {
    if (!confirm("Are you sure you want to delete this theory article?")) return;
    try {
      await adminApi.deleteTheoryArticle(id);
      await loadAdminData();
    } catch {
      alert("Failed to delete the theory article.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F2937] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#F9FAFB] capitalize flex items-center gap-2">
            {activeModule === "vocab" && <BookOpen className="text-[#2563EB]" />}
            {activeModule === "theory" && <FileText className="text-[#2563EB]" />}
            {activeModule === "users" && <Users className="text-[#2563EB]" />}
            {activeModule === "vocab" && "Vocabulary Database"}
            {activeModule === "theory" && "Theory Content Hub"}
            {activeModule === "users" && "User Directory"}
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-1">
            {activeModule === "vocab" && "Manage curated collections and student vocab sheets"}
            {activeModule === "theory" && "Post and categorize grammar sheets and tips"}
            {activeModule === "users" && "Review members registered on the platform"}
          </p>
        </div>

        {/* Action Buttons */}
        {activeModule === "vocab" && vocabSubTab === "folders" && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setVocabFolderName("");
              setVocabFolderDesc("");
              setVocabFolderColor(FOLDER_COLORS[0]);
              setVocabFolderIcon(FOLDER_ICONS[0]);
              setVocabFolderModalOpen(true);
            }}
          >
            <Plus size={15} />
            Official Collection
          </Button>
        )}

        {activeModule === "theory" && theorySubTab === "folders" && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenTheoryFolderModal(null)}
          >
            <Plus size={15} />
            New Folder
          </Button>
        )}

        {activeModule === "theory" && theorySubTab === "articles" && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenTheoryArticleModal(null)}
            disabled={theoryFoldersList.length === 0}
            title={theoryFoldersList.length === 0 ? "Create a Theory Folder first" : ""}
          >
            <Plus size={15} />
            New Article
          </Button>
        )}
      </div>

      {/* Sub tabs in content area */}
      {activeModule === "vocab" && (
        <div className="flex gap-4 border-b border-[#1F2937] pb-2">
          <button
            type="button"
            onClick={() => setVocabSubTab("folders")}
            className={cn(
              "text-xs font-bold transition-all relative pb-2 px-1",
              vocabSubTab === "folders"
                ? "text-[#2563EB] border-b-2 border-[#2563EB]"
                : "text-[#9CA3AF] hover:text-[#F9FAFB]"
            )}
          >
            Official Collections ({vocabFoldersList.length})
          </button>
          <button
            type="button"
            onClick={() => setVocabSubTab("sets")}
            className={cn(
              "text-xs font-bold transition-all relative pb-2 px-1",
              vocabSubTab === "sets"
                ? "text-[#2563EB] border-b-2 border-[#2563EB]"
                : "text-[#9CA3AF] hover:text-[#F9FAFB]"
            )}
          >
            Study Sets ({lessonsList.length})
          </button>
        </div>
      )}

      {activeModule === "theory" && (
        <div className="flex gap-4 border-b border-[#1F2937] pb-2">
          <button
            type="button"
            onClick={() => setTheorySubTab("folders")}
            className={cn(
              "text-xs font-bold transition-all relative pb-2 px-1",
              theorySubTab === "folders"
                ? "text-[#2563EB] border-b-2 border-[#2563EB]"
                : "text-[#9CA3AF] hover:text-[#F9FAFB]"
            )}
          >
            Topic Folders ({theoryFoldersList.length})
          </button>
          <button
            type="button"
            onClick={() => setTheorySubTab("articles")}
            className={cn(
              "text-xs font-bold transition-all relative pb-2 px-1",
              theorySubTab === "articles"
                ? "text-[#2563EB] border-b-2 border-[#2563EB]"
                : "text-[#9CA3AF] hover:text-[#F9FAFB]"
            )}
          >
            Study Guides ({theoryArticlesList.length})
          </button>
        </div>
      )}

      {/* Main Panel Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[#2563EB]" />
        </div>
      ) : activeModule === "users" ? (
        /* USERS */
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] overflow-hidden shadow-xl animate-fade-in">
          <div className="px-6 py-4 border-b border-[#1F2937] bg-[#0B1220]/50 text-[11px] font-bold text-[#9CA3AF] grid grid-cols-12 gap-2">
            <span className="col-span-2">USER ID</span>
            <span className="col-span-4">USERNAME</span>
            <span className="col-span-4">EMAIL</span>
            <span className="col-span-2 text-right">ROLE</span>
          </div>
          <div className="divide-y divide-[#1F2937]">
            {usersList.map((usr) => (
              <div key={usr.id} className="px-6 py-3.5 text-sm grid grid-cols-12 gap-2 items-center">
                <span className="col-span-2 font-mono text-xs text-[#9CA3AF]">#{usr.id}</span>
                <span className="col-span-4 text-[#F9FAFB] font-semibold">{usr.username}</span>
                <span className="col-span-4 text-[#9CA3AF] text-xs">{usr.email}</span>
                <span className="col-span-2 text-right">
                  <span
                    className={cn(
                      "inline-block px-2 py-0.5 rounded text-[10px] font-bold",
                      usr.role === "ADMIN"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-[#1F2937] text-[#9CA3AF]"
                    )}
                  >
                    {usr.role}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : activeModule === "vocab" && vocabSubTab === "folders" ? (
        /* VOCAB FOLDERS */
        vocabFoldersList.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[#1F2937] rounded-2xl text-[#9CA3AF] text-sm">
            No official vocabulary collections curated. Click "Official Collection" to add one!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-fade-in">
            {vocabFoldersList.map((folder) => (
              <div
                key={folder.id}
                className="rounded-2xl border p-5 flex flex-col items-center text-center gap-3"
                style={{
                  borderColor: `${folder.color}30`,
                  backgroundColor: `${folder.color}05`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${folder.color}15` }}
                >
                  {folder.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-[#F9FAFB] text-xs truncate max-w-full">
                    {folder.name}
                  </h3>
                  <span className="text-[10px] text-[#9CA3AF] block mt-1">
                    {folder.lessonCount} sets
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeModule === "vocab" && vocabSubTab === "sets" ? (
        /* VOCAB STUDY SETS */
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] overflow-hidden shadow-xl animate-fade-in">
          <div className="px-6 py-4 border-b border-[#1F2937] bg-[#0B1220]/50 text-[11px] font-bold text-[#9CA3AF] grid grid-cols-12 gap-2">
            <span className="col-span-4">SET TITLE</span>
            <span className="col-span-3">CREATOR</span>
            <span className="col-span-2">TERMS</span>
            <span className="col-span-3 text-right">ACTIONS</span>
          </div>
          <div className="divide-y divide-[#1F2937]">
            {lessonsList.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-[#9CA3AF]">
                No study sets exist in the system yet.
              </div>
            ) : (
              lessonsList.map((lesson) => (
                <div key={lesson.id} className="px-6 py-3.5 text-sm grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4 flex items-center gap-2 min-w-0">
                    {lesson.isOfficial && (
                      <Star size={14} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                    )}
                    <span className="text-[#F9FAFB] font-semibold truncate">{lesson.title}</span>
                  </div>
                  <span className="col-span-3 text-[#9CA3AF] text-xs truncate">{lesson.creatorUsername}</span>
                  <span className="col-span-2 text-[#9CA3AF] text-xs">{lesson.wordCount} terms</span>
                  <div className="col-span-3 text-right flex justify-end items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleVocabPrivacy(lesson.id)}
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors",
                        lesson.isPrivate
                          ? "bg-[#1F2937] text-[#9CA3AF]"
                          : "bg-green-500/10 text-green-400 border border-green-500/20"
                      )}
                    >
                      {lesson.isPrivate ? <Lock size={10} /> : <Globe size={10} />}
                      {lesson.isPrivate ? "Private" : "Public"}
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push(`/vocab/edit/${lesson.id}`)}
                      className="p-1.5 rounded-lg border border-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] transition-all"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteVocabLesson(lesson.id)}
                      className="p-1.5 rounded-lg border border-[#1F2937] text-[#9CA3AF] hover:text-red-400 hover:border-red-500/20 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : activeModule === "theory" && theorySubTab === "folders" ? (
        /* THEORY FOLDERS */
        theoryFoldersList.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[#1F2937] rounded-2xl text-[#9CA3AF] text-sm">
            No theory folders curated. Click "New Folder" to add one!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
            {theoryFoldersList.map((folder) => (
              <div
                key={folder.id}
                className="rounded-2xl border p-5 flex flex-col justify-between gap-5 relative group"
                style={{
                  borderColor: `${folder.color}30`,
                  backgroundColor: `${folder.color}05`,
                }}
              >
                <div className="flex justify-between items-start">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${folder.color}15` }}
                  >
                    {folder.icon}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleOpenTheoryFolderModal(folder)}
                      className="p-1 rounded hover:bg-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB]"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => folder.id && handleDeleteTheoryFolder(folder.id)}
                      className="p-1 rounded hover:bg-red-500/10 text-red-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-[#F9FAFB] text-sm truncate">{folder.name}</h3>
                  {folder.description && (
                    <p className="text-[11px] text-[#9CA3AF] line-clamp-2 mt-1">{folder.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* THEORY ARTICLES */
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] overflow-hidden shadow-xl animate-fade-in">
          <div className="px-6 py-4 border-b border-[#1F2937] bg-[#0B1220]/50 text-[11px] font-bold text-[#9CA3AF] grid grid-cols-12 gap-2">
            <span className="col-span-5">ARTICLE TITLE</span>
            <span className="col-span-3">COLLECTION FOLDER</span>
            <span className="col-span-2">CREATED AT</span>
            <span className="col-span-2 text-right">ACTIONS</span>
          </div>
          <div className="divide-y divide-[#1F2937]">
            {theoryArticlesList.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-[#9CA3AF]">
                No theory articles posted yet. Click "New Article" to add one!
              </div>
            ) : (
              theoryArticlesList.map((art) => (
                <div key={art.id} className="px-6 py-3.5 text-sm grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5 flex flex-col min-w-0">
                    <span className="text-[#F9FAFB] font-semibold truncate">{art.title}</span>
                    {art.summary && <span className="text-[11px] text-[#9CA3AF] truncate max-w-sm">{art.summary}</span>}
                  </div>
                  <span className="col-span-3 truncate">
                    {art.folder ? (
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                        style={{
                          color: art.folder.color,
                          borderColor: `${art.folder.color}30`,
                          backgroundColor: `${art.folder.color}10`,
                        }}
                      >
                        {art.folder.icon} {art.folder.name}
                      </span>
                    ) : (
                      <span className="text-[#9CA3AF] italic text-xs">Uncategorized</span>
                    )}
                  </span>
                  <span className="col-span-2 text-[#9CA3AF] font-mono text-xs">
                    {art.createdAt ? new Date(art.createdAt).toLocaleDateString() : "-"}
                  </span>
                  <div className="col-span-2 text-right flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenTheoryArticleModal(art)}
                      className="p-1.5 rounded-lg border border-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] transition-all"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => art.id && handleDeleteTheoryArticle(art.id)}
                      className="p-1.5 rounded-lg border border-[#1F2937] text-[#9CA3AF] hover:text-red-400 hover:border-red-500/20 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Official VOCAB Folder Modal */}
      {vocabFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setVocabFolderModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-[#1F2937] bg-[#111827] p-6 shadow-2xl animate-fade-in">
            <button
              type="button"
              onClick={() => setVocabFolderModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
            >
              <X size={16} />
            </button>
            <h3 className="text-base font-bold text-[#F9FAFB] mb-4">New Official Collection</h3>
            <form onSubmit={handleCreateVocabFolder} className="space-y-4">
              <Input
                id="vocab-folder-name"
                label="Folder Name *"
                placeholder="e.g. TOEIC Part 1 Keywords"
                value={vocabFolderName}
                onChange={(e) => setVocabFolderName(e.target.value)}
                required
              />
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5" htmlFor="vocab-folder-desc">Description</label>
                <textarea
                  id="vocab-folder-desc"
                  placeholder="Official directory description..."
                  value={vocabFolderDesc}
                  onChange={(e) => setVocabFolderDesc(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#1F2937] bg-[#0B1220] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5">Select Icon</label>
                <div className="flex flex-wrap gap-2">
                  {FOLDER_ICONS.map((ico) => (
                    <button
                      type="button"
                      key={ico}
                      onClick={() => setVocabFolderIcon(ico)}
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center text-lg border transition-all",
                        vocabFolderIcon === ico ? "border-[#2563EB] bg-[#2563EB]/10" : "border-[#1F2937] bg-[#0B1220]"
                      )}
                    >
                      {ico}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5">Color Theme</label>
                <div className="flex gap-2">
                  {FOLDER_COLORS.map((col) => (
                    <button
                      type="button"
                      key={col}
                      onClick={() => setVocabFolderColor(col)}
                      style={{ backgroundColor: col }}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        vocabFolderColor === col ? "border-[#F9FAFB] scale-110" : "border-transparent opacity-80"
                      )}
                      aria-label={`Color ${col}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" size="sm" onClick={() => setVocabFolderModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" isLoading={vocabFolderSubmitting}>Create Collection</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official THEORY Folder Modal */}
      {theoryFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setTheoryFolderModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-[#1F2937] bg-[#111827] p-6 shadow-2xl animate-fade-in">
            <button
              type="button"
              onClick={() => setTheoryFolderModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
            >
              <X size={16} />
            </button>
            <h3 className="text-base font-bold text-[#F9FAFB] mb-4">
              {selectedTheoryFolder ? "Edit Theory Folder" : "New Theory Folder"}
            </h3>
            <form onSubmit={handleSaveTheoryFolder} className="space-y-4">
              <Input
                id="theory-folder-name"
                label="Folder Name *"
                placeholder="e.g. Grammar Fundamentals"
                value={theoryFolderName}
                onChange={(e) => setTheoryFolderName(e.target.value)}
                required
              />
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5" htmlFor="theory-folder-desc">Description</label>
                <textarea
                  id="theory-folder-desc"
                  placeholder="Official directory description..."
                  value={theoryFolderDesc}
                  onChange={(e) => setTheoryFolderDesc(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#1F2937] bg-[#0B1220] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5">Select Icon</label>
                <div className="flex flex-wrap gap-2">
                  {FOLDER_ICONS.map((ico) => (
                    <button
                      type="button"
                      key={ico}
                      onClick={() => setTheoryFolderIcon(ico)}
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center text-lg border transition-all",
                        theoryFolderIcon === ico ? "border-[#2563EB] bg-[#2563EB]/10" : "border-[#1F2937] bg-[#0B1220]"
                      )}
                    >
                      {ico}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5">Color Theme</label>
                <div className="flex gap-2">
                  {FOLDER_COLORS.map((col) => (
                    <button
                      type="button"
                      key={col}
                      onClick={() => setTheoryFolderColor(col)}
                      style={{ backgroundColor: col }}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        theoryFolderColor === col ? "border-[#F9FAFB] scale-110" : "border-transparent opacity-80"
                      )}
                      aria-label={`Color ${col}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" size="sm" onClick={() => setTheoryFolderModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" isLoading={theoryFolderSubmitting}>
                  {selectedTheoryFolder ? "Save Changes" : "Create Folder"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Theory Article Modal */}
      {theoryArticleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setTheoryArticleModalOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl mx-4 rounded-2xl border border-[#1F2937] bg-[#111827] p-6 shadow-2xl overflow-y-auto max-h-[90vh] animate-fade-in">
            <button
              type="button"
              onClick={() => setTheoryArticleModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
            >
              <X size={16} />
            </button>
            <h3 className="text-base font-bold text-[#F9FAFB] mb-4">
              {selectedTheoryArticle ? "Edit Theory Article" : "New Theory Article"}
            </h3>
            <form onSubmit={handleSaveTheoryArticle} className="space-y-4">
              <Input
                id="theory-article-title"
                label="Article Title *"
                placeholder="e.g. Master the Present Perfect Tense"
                value={theoryArticleTitle}
                onChange={(e) => setTheoryArticleTitle(e.target.value)}
                required
              />
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5" htmlFor="theory-article-folder">Theory Folder *</label>
                <select
                  id="theory-article-folder"
                  value={theoryArticleFolderId}
                  onChange={(e) => setTheoryArticleFolderId(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#1F2937] bg-[#0B1220] text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                >
                  {theoryFoldersList.map((fld) => (
                    <option key={fld.id} value={fld.id}>
                      {fld.icon} {fld.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5" htmlFor="theory-article-summary">Summary / Intro</label>
                <textarea
                  id="theory-article-summary"
                  placeholder="Brief summary displayed in list views..."
                  value={theoryArticleSummary}
                  onChange={(e) => setTheoryArticleSummary(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#1F2937] bg-[#0B1220] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5" htmlFor="theory-article-content">Article Content *</label>
                <textarea
                  id="theory-article-content"
                  placeholder="Write the full content of the theory article here..."
                  value={theoryArticleContent}
                  onChange={(e) => setTheoryArticleContent(e.target.value)}
                  rows={8}
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#1F2937] bg-[#0B1220] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all font-sans"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-[#1F2937]">
                <Button type="button" variant="outline" size="sm" onClick={() => setTheoryArticleModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" isLoading={theoryArticleSubmitting}>
                  {selectedTheoryArticle ? "Save Changes" : "Post Article"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}
