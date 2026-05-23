"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth.store";

export function CtaSection() {
  const { isAuthenticated } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const startHref = isMounted && isAuthenticated ? "/dashboard" : "/auth/register";
  const startText = isMounted && isAuthenticated ? "Go to Dashboard" : "Start Learning Free";

  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center relative">
        <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-3xl" />
        <div className="relative glass-card p-12 rounded-2xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-text-primary mb-4">
            Ready to Achieve Your Target Score?
          </h2>
          <p className="text-text-secondary mb-8 max-w-lg mx-auto">
            Join thousands of learners who improved their TOEIC score with LangWhich.
            Start free today — no credit card needed.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href={startHref}>
              <Button variant="primary" size="lg" id="cta-bottom-start">
                {startText}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
