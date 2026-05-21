"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { VocabNavbar } from "@/components/layout/VocabNavbar";

export default function VocabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#0B1220]">
      <VocabNavbar />
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
