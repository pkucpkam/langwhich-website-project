"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Navbar } from "@/components/layout/Navbar";
import { VocabSubNavbar } from "@/components/layout/VocabSubNavbar";

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
    <div className="min-h-screen bg-[#0B1220] flex flex-col">
      <Navbar />
      <VocabSubNavbar />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
