import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "LangWhich — TOEIC Learning Platform",
    template: "%s | LangWhich",
  },
  description:
    "Master TOEIC with AI-powered vocabulary flashcards, grammar lessons, and full practice exams. Track your progress and achieve your target score.",
  keywords: ["TOEIC", "English learning", "vocabulary", "grammar", "practice exam"],
  authors: [{ name: "LangWhich Team" }],
  openGraph: {
    title: "LangWhich — TOEIC Learning Platform",
    description: "Master TOEIC with AI-powered learning tools",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-neutral-background text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
