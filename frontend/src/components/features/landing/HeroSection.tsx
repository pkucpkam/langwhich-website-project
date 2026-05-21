import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32 lg:py-40">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-8">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI-powered TOEIC preparation</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight mb-6">
          Master TOEIC with{" "}
          <span className="gradient-text">Intelligent</span>
          <br className="hidden md:block" /> Learning Tools
        </h1>

        {/* Sub-headline */}
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10">
          Vocabulary flashcards, grammar drills, full practice exams, and
          real-time progress tracking — everything you need to achieve your
          target TOEIC score.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/register">
            <Button variant="primary" size="lg" id="hero-cta-start">
              Start for Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" size="lg" id="hero-cta-features">
              See How It Works
            </Button>
          </Link>
        </div>

        {/* Social proof */}
        <p className="mt-8 text-sm text-text-secondary">
          Trusted by <span className="text-text-primary font-semibold">10,000+</span> learners · No credit card required
        </p>
      </div>
    </section>
  );
}
