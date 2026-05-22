"use client";

import { useState, useCallback } from "react";
import type { VocabularyItem } from "@/types/vocab";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlashcardProps {
  item: VocabularyItem;
  isFlipped: boolean;
  onFlip: () => void;
}

export function Flashcard({ item, isFlipped, onFlip }: FlashcardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(item.word);
        utterance.lang = "en-US";
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    },
    [item.word]
  );

  return (
    <div
      className="relative w-full cursor-pointer"
      style={{ perspective: "1200px", height: "360px" }}
      onClick={onFlip}
      role="button"
      aria-label={isFlipped ? "Show word" : "Show definition"}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front — Word */}
        <div
          className="absolute inset-0 rounded-2xl border border-[#1F2937] bg-[#111827] flex flex-col items-center justify-center p-8 gap-3"
          style={{ backfaceVisibility: "hidden" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9CA3AF]">
            {item.wordType ?? "word"}
          </p>
          <h2 className="text-4xl font-bold text-[#F9FAFB] text-center">
            {item.word}
          </h2>
          {item.ipa && (
            <p className="text-lg text-[#2563EB] font-mono">{item.ipa}</p>
          )}
          <button
            type="button"
            onClick={speak}
            className={cn(
              "mt-2 p-2 rounded-full border border-[#1F2937] hover:border-[#2563EB] transition-all duration-200",
              isSpeaking && "border-[#2563EB] text-[#2563EB]"
            )}
            aria-label="Pronounce word"
          >
            <Volume2 size={18} className="text-[#9CA3AF]" />
          </button>
          <p className="mt-4 text-xs text-[#9CA3AF]">Click to reveal definition</p>
        </div>

        {/* Back — Definition */}
        <div
          className="absolute inset-0 rounded-2xl border border-[#1F2937] bg-[#111827] flex flex-col items-center justify-center p-8 gap-4"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9CA3AF]">
            definition
          </p>
          <p className="text-2xl font-semibold text-[#F9FAFB] text-center leading-relaxed">
            {item.definition}
          </p>
          {item.exampleEn && (
            <div className="w-full border-t border-[#1F2937] pt-4 space-y-1 text-center">
              <p className="text-sm text-[#9CA3AF] italic">"{item.exampleEn}"</p>
              {item.exampleVi && (
                <p className="text-sm text-[#9CA3AF]">{item.exampleVi}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
