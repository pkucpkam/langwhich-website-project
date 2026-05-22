"use client";

import { useState, useRef } from "react";
import { X, Upload, FileText, ClipboardList, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { VocabularyItemRequest } from "@/types/vocab";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: VocabularyItemRequest[]) => void;
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [activeTab, setActiveTab] = useState<"file" | "paste">("file");
  const [pastedText, setPastedText] = useState("");
  const [fileLoading, setFileLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // TXT/Text parsing logic
  const parseTextContent = (text: string): VocabularyItemRequest[] => {
    const lines = text.split("\n");
    const parsed: VocabularyItemRequest[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Auto-detect separator: tab, then | , then " - ", then "-", then ":"
      let separator = "";
      if (trimmed.includes("\t")) {
        separator = "\t";
      } else if (trimmed.includes("|")) {
        separator = "|";
      } else if (trimmed.includes(" - ")) {
        separator = " - ";
      } else if (trimmed.includes("-")) {
        separator = "-";
      } else if (trimmed.includes(":")) {
        separator = ":";
      }

      let parts: string[] = [];
      if (separator) {
        parts = trimmed.split(separator).map((p) => p.trim());
      } else {
        parts = [trimmed];
      }

      if (parts.length > 0 && parts[0]) {
        parsed.push({
          word: parts[0],
          definition: parts[1] ?? "",
          ipa: parts[2] ?? "",
          wordType: parts[3] ?? "",
          exampleEn: parts[4] ?? "",
          exampleVi: parts[5] ?? "",
        });
      }
    }
    return parsed;
  };

  // Handle Excel and TXT File Parsing
  const handleFileProcess = async (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    
    if (extension === "txt") {
      setFileLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const parsed = parseTextContent(text);
        if (parsed.length > 0) {
          onImport(parsed);
          onClose();
        } else {
          alert("Could not find any valid vocabulary terms in the text file.");
        }
        setFileLoading(false);
      };
      reader.onerror = () => {
        alert("Failed to read text file.");
        setFileLoading(false);
      };
      reader.readAsText(file);
    } else if (extension === "xlsx" || extension === "xls") {
      setFileLoading(true);
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
          onImport(imported);
          onClose();
        } else {
          alert("Excel file is empty or formatted incorrectly.");
        }
      } catch {
        alert("Failed to parse Excel file. Make sure it is a valid .xlsx file.");
      } finally {
        setFileLoading(false);
      }
    } else {
      alert("Unsupported file format. Please upload .xlsx, .xls, or .txt.");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) return;
    const parsed = parseTextContent(pastedText);
    if (parsed.length > 0) {
      onImport(parsed);
      setPastedText("");
      onClose();
    } else {
      alert("Could not parse any terms. Please ensure they match the format guidelines.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-2xl mx-4 rounded-2xl border border-[#1F2937] bg-[#111827] shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F2937] bg-[#111827]">
          <div>
            <h3 className="text-lg font-bold text-[#F9FAFB]">Import Vocabulary</h3>
            <p className="text-xs text-[#9CA3AF]">Choose your preferred method to quickly import words</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs navigation */}
        <div className="flex border-b border-[#1F2937] bg-[#0B1220]/40 px-6">
          <button
            type="button"
            onClick={() => setActiveTab("file")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold transition-all relative border-b-2 ${
              activeTab === "file"
                ? "text-[#2563EB] border-[#2563EB]"
                : "text-[#9CA3AF] border-transparent hover:text-[#F9FAFB]"
            }`}
          >
            <Upload size={14} />
            File Upload (Excel / TXT)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("paste")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold transition-all relative border-b-2 ${
              activeTab === "paste"
                ? "text-[#2563EB] border-[#2563EB]"
                : "text-[#9CA3AF] border-transparent hover:text-[#F9FAFB]"
            }`}
          >
            <ClipboardList size={14} />
            Paste Raw Text
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === "file" ? (
            <div className="space-y-4">
              {/* Drag & Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 ${
                  dragActive
                    ? "border-[#2563EB] bg-[#2563EB]/5"
                    : "border-[#1F2937] hover:border-[#2563EB]/50 bg-[#0B1220]/20"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {fileLoading ? (
                  <>
                    <Loader2 size={32} className="animate-spin text-[#2563EB]" />
                    <p className="text-sm font-semibold text-[#F9FAFB]">Processing file...</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[#1F2937] flex items-center justify-center text-[#9CA3AF]">
                      <Upload size={22} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-[#F9FAFB]">
                        Drag and drop your file here, or <span className="text-[#2563EB] hover:underline">browse</span>
                      </p>
                      <p className="text-xs text-[#9CA3AF] mt-1">Supports Excel (.xlsx, .xls) and Text (.txt)</p>
                    </div>
                  </>
                )}
              </div>

              {/* Format Guidelines */}
              <div className="rounded-xl border border-[#1F2937] bg-[#0B1220]/40 p-4 space-y-3">
                <h4 className="text-xs font-bold text-[#F9FAFB] flex items-center gap-1.5 uppercase tracking-wide">
                  <Info size={12} className="text-[#2563EB]" />
                  Formatting Guidelines
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <span className="font-semibold text-amber-400 flex items-center gap-1">
                      📊 Excel File Structure
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-[#9CA3AF]">
                      <li><strong className="text-[#F9FAFB]">Col A:</strong> Word * (Required)</li>
                      <li><strong className="text-[#F9FAFB]">Col B:</strong> Definition * (Required)</li>
                      <li><strong className="text-[#F9FAFB]">Col C:</strong> IPA (Optional)</li>
                      <li><strong className="text-[#F9FAFB]">Col D:</strong> Word Type (Optional)</li>
                      <li><strong className="text-[#F9FAFB]">Col E:</strong> Example (English)</li>
                      <li><strong className="text-[#F9FAFB]">Col F:</strong> Translation (Vietnamese)</li>
                    </ul>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      <FileText size={12} />
                      Text (.txt) File Structure
                    </span>
                    <p className="text-[#9CA3AF] leading-relaxed">
                      List one vocabulary term per line, separating fields using 
                      <code className="bg-[#1F2937] text-emerald-400 px-1 py-0.5 rounded mx-1 font-mono"> - </code>,
                      <code className="bg-[#1F2937] text-emerald-400 px-1 py-0.5 rounded mx-1 font-mono">|</code>, 
                      <code className="bg-[#1F2937] text-emerald-400 px-1 py-0.5 rounded mx-1 font-mono">:</code>, or tabs.
                    </p>
                    <div className="bg-[#111827] p-2 rounded border border-[#1F2937] text-[10px] font-mono text-[#9CA3AF] space-y-0.5">
                      <div>apple - quả táo</div>
                      <div>banana - quả chuối - /bəˈnæn.ə/</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 flex flex-col h-full">
              {/* Textarea */}
              <div className="flex-1 space-y-1.5">
                <label className="block text-xs font-semibold text-[#9CA3AF]" htmlFor="raw-import-textarea">
                  Paste vocabulary list below:
                </label>
                <textarea
                  id="raw-import-textarea"
                  rows={8}
                  placeholder={`Example:\napple - quả táo\nbanana - quả chuối - /bəˈnæn.ə/ - noun - An yellow fruit - Một quả màu vàng\ncat - con mèo - /kæt/`}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-[#1F2937] bg-[#0B1220] text-[#F9FAFB] placeholder:text-[#9CA3AF]/60 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none font-mono"
                />
              </div>

              {/* paste guidelines */}
              <div className="rounded-xl border border-[#1F2937] bg-[#0B1220]/40 p-4 space-y-2 text-xs">
                <h4 className="font-bold text-[#F9FAFB] flex items-center gap-1.5 uppercase tracking-wide">
                  <Info size={12} className="text-[#2563EB]" />
                  Supported Formats
                </h4>
                <p className="text-[#9CA3AF] leading-relaxed">
                  You can type or paste items. Format each row as follows:
                </p>
                <div className="bg-[#111827] px-3 py-2 rounded border border-[#1F2937] space-y-1 font-mono text-[10px] text-[#9CA3AF]">
                  <div><span className="text-amber-400">Word</span> - <span className="text-emerald-400">Definition</span> - <span className="text-blue-400">IPA</span> - <span className="text-purple-400">Type</span> - <span className="text-pink-400">Example En</span> - <span className="text-indigo-400">Translation Vi</span></div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handlePasteSubmit}
                  disabled={!pastedText.trim()}
                  className="w-full sm:w-auto"
                >
                  Parse & Import ({parseTextContent(pastedText).length} words detected)
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
