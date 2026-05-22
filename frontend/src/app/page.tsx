import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/features/landing/HeroSection";
import { FeaturesSection } from "@/components/features/landing/FeaturesSection";
import { CtaSection } from "@/components/features/landing/CtaSection";

export const metadata: Metadata = {
  title: "LangWhich — Master TOEIC with AI-Powered Learning",
  description:
    "The most effective way to prepare for TOEIC. Vocabulary flashcards, grammar lessons, and full mock exams with AI-driven progress tracking.",
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CtaSection />
      </main>
      <footer className="border-t border-neutral-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-text-secondary">
          <p>© 2025 LangWhich. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-text-primary transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-text-primary transition-colors">Terms</a>
            <a href="/contact" className="hover:text-text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
}
