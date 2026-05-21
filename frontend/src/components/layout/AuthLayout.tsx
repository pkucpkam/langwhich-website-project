import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-neutral-background flex flex-col items-center justify-center px-4 py-8">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-600/5 blur-3xl" />
      </div>

      {/* Logo */}
      <Link
        href="/"
        className="relative flex items-center gap-2 font-bold text-xl text-text-primary mb-8 hover:text-primary transition-colors duration-200"
      >
        <BookOpen className="h-7 w-7 text-primary" />
        <span>LangWhich</span>
      </Link>

      {/* Card */}
      <Card
        variant="elevated"
        padding="lg"
        className="relative w-full max-w-md animate-slide-up"
      >
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-text-primary">{title}</h1>
          <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>
        </div>

        {children}
      </Card>
    </main>
  );
}
