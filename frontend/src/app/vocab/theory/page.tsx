"use client";

import { useEffect, useState, useCallback } from "react";
import { theoryApi } from "@/api/theory.api";
import type { TheoryArticle, TheoryFolder } from "@/types/theory";
import { BookOpen, Search, Loader2, ArrowLeft, Calendar, Tag, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function TheoryPage() {
  const [articles, setArticles] = useState<TheoryArticle[]>([]);
  const [folders, setFolders] = useState<TheoryFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFolderId, setActiveFolderId] = useState<number | "All">("All");

  // Reading state
  const [selectedArticle, setSelectedArticle] = useState<TheoryArticle | null>(null);

  // Fetch folders on mount
  useEffect(() => {
    async function loadFolders() {
      try {
        const tfList = await theoryApi.getFolders();
        setFolders(tfList);
      } catch {
        // ignore
      }
    }
    loadFolders();
  }, []);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const folderIdParam = activeFolderId === "All" ? undefined : activeFolderId;
      const data = await theoryApi.getArticles(searchQuery, folderIdParam, 0, 100);
      setArticles(data.content);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeFolderId]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchArticles();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeFolderId, fetchArticles]);

  const handleBackToList = () => {
    setSelectedArticle(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {selectedArticle ? (
        /* Reading Layout */
        <article className="space-y-6 max-w-3xl mx-auto animate-fade-in">
          <button
            type="button"
            onClick={handleBackToList}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#111827] transition-all"
            id="theory-read-back"
          >
            <ArrowLeft size={16} />
            Back to Library
          </button>

          <div className="relative glass-card p-8 sm:p-12 rounded-2xl border border-[#1F2937] bg-[#111827]/70 space-y-6">
            {/* Meta */}
            <div className="flex flex-wrap gap-3 items-center text-xs text-[#9CA3AF]">
              {selectedArticle.folder && (
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                  style={{
                    color: selectedArticle.folder.color,
                    borderColor: `${selectedArticle.folder.color}30`,
                    backgroundColor: `${selectedArticle.folder.color}10`,
                  }}
                >
                  {selectedArticle.folder.icon} {selectedArticle.folder.name}
                </span>
              )}
              <span className="flex items-center gap-1 font-mono">
                <Calendar size={13} />
                {selectedArticle.createdAt ? new Date(selectedArticle.createdAt).toLocaleDateString() : "-"}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-[#F9FAFB] tracking-tight leading-tight">
              {selectedArticle.title}
            </h1>

            {/* Summary */}
            {selectedArticle.summary && (
              <p className="text-base text-[#9CA3AF] italic border-l-4 border-[#2563EB]/60 pl-4 py-1 bg-[#2563EB]/5 rounded-r-lg">
                {selectedArticle.summary}
              </p>
            )}

            {/* Divider */}
            <div className="h-px bg-[#1F2937]" />

            {/* Main Content */}
            <div className="prose prose-invert max-w-none text-[#F9FAFB]/90 leading-relaxed font-sans space-y-6 whitespace-pre-wrap">
              {selectedArticle.content}
            </div>
          </div>
        </article>
      ) : (
        /* List Layout */
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-[#F9FAFB] tracking-tight flex items-center justify-center gap-3">
              <BookOpen className="text-[#2563EB] h-8 w-8" />
              TOEIC Learning Hub
            </h1>
            <p className="text-sm md:text-base text-[#9CA3AF] max-w-lg mx-auto">
              Boost your grammar, expand vocabulary strategies, and learn pro tricks to ace the TOEIC exam.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto scrollbar-none pb-2 md:pb-0">
              <button
                type="button"
                onClick={() => setActiveFolderId("All")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-semibold border transition-all flex-shrink-0",
                  activeFolderId === "All"
                    ? "bg-[#2563EB] text-white border-transparent shadow-lg shadow-[#2563EB]/25"
                    : "border-[#1F2937] bg-[#111827] text-[#9CA3AF] hover:text-[#F9FAFB] hover:border-[#2563EB]/50"
                )}
              >
                All Topics
              </button>
              
              {folders.map((fld) => (
                <button
                  key={fld.id}
                  type="button"
                  onClick={() => fld.id && setActiveFolderId(fld.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-semibold border transition-all flex-shrink-0 flex items-center gap-1.5",
                    activeFolderId === fld.id
                      ? "text-white shadow-lg"
                      : "border-[#1F2937] bg-[#111827] text-[#9CA3AF] hover:text-[#F9FAFB]"
                  )}
                  style={{
                    backgroundColor: activeFolderId === fld.id ? fld.color : undefined,
                    borderColor: activeFolderId === fld.id ? "transparent" : undefined,
                    boxShadow: activeFolderId === fld.id ? `0 10px 15px -3px ${fld.color}40` : undefined,
                  }}
                >
                  <span>{fld.icon}</span>
                  <span>{fld.name}</span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#1F2937] bg-[#111827] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
              />
            </div>
          </div>

          {/* Articles Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={36} className="animate-spin text-[#2563EB]" />
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-[#1F2937] bg-[#111827]/30 rounded-2xl">
              <p className="text-[#9CA3AF] text-sm">No articles match your search or filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticle(art)}
                  className="group rounded-2xl border border-[#1F2937] bg-[#111827] p-6 hover:border-[#2563EB]/50 hover:bg-[#111827]/80 hover:scale-[1.01] transition-all cursor-pointer flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs">
                      {art.folder && (
                        <span
                          className="px-2 py-0.5 rounded-md font-semibold border text-[10px]"
                          style={{
                            color: art.folder.color,
                            borderColor: `${art.folder.color}30`,
                            backgroundColor: `${art.folder.color}10`,
                          }}
                        >
                          {art.folder.icon} {art.folder.name}
                        </span>
                      )}
                      <span className="text-[#9CA3AF]">
                        {art.createdAt ? new Date(art.createdAt).toLocaleDateString() : "-"}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-[#F9FAFB] group-hover:text-[#2563EB] transition-colors leading-snug">
                      {art.title}
                    </h2>

                    {art.summary && (
                      <p className="text-sm text-[#9CA3AF] line-clamp-3 leading-relaxed">
                        {art.summary}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] pt-2">
                    <span>Read Study Guide</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
