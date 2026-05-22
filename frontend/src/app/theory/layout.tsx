"use client";

import { Navbar } from "@/components/layout/Navbar";

export default function TheoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-background flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {children}
      </main>
    </div>
  );
}
