"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import {
  Shield,
  Layers,
  FileText,
  PlusCircle,
  ArrowLeft,
  Loader2,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
    } else if (user?.role !== "ADMIN") {
      router.replace("/vocab");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-neutral-background flex flex-col items-center justify-center gap-4">
        <Lock className="h-12 w-12 text-status-error animate-bounce" />
        <h1 className="text-xl font-bold text-text-primary">Unauthorized Access</h1>
        <p className="text-sm text-text-secondary">Redirecting to standard area...</p>
        <Loader2 className="h-6 w-6 animate-spin text-primary mt-2" />
      </div>
    );
  }

  const sidebarLinks = [
    {
      href: "/admin/theory/lessons",
      label: "Lessons Manager",
      icon: FileText,
      active: pathname.startsWith("/admin/theory/lessons") && !pathname.endsWith("/create"),
    },
    {
      href: "/admin/theory/lessons/create",
      label: "Create Lesson",
      icon: PlusCircle,
      active: pathname === "/admin/theory/lessons/create",
    },
    {
      href: "/admin/theory/topics",
      label: "Topics Manager",
      icon: Layers,
      active: pathname === "/admin/theory/topics",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-background flex flex-col md:flex-row">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-neutral-card border-r border-neutral-border p-6 flex flex-col justify-between gap-8 flex-shrink-0">
        <div className="space-y-8">
          {/* Logo Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-border/50">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-text-primary tracking-tight">LangWhich</h2>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block -mt-0.5">
                Admin Console
              </span>
            </div>
          </div>

          {/* Links list */}
          <nav className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block px-3 mb-2">
              Theory Module
            </span>
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <div
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer",
                      link.active
                        ? "bg-primary text-text-primary shadow-lg shadow-primary/10"
                        : "text-text-secondary hover:text-text-primary hover:bg-neutral-background border border-transparent hover:border-neutral-border/50"
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    <span>{link.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Utility controls */}
        <div className="space-y-3">
          <Link href="/theory">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-neutral-background cursor-pointer transition-all border border-neutral-border/40">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to student portal</span>
            </div>
          </Link>
          <div className="text-[10px] text-text-secondary/60 text-center">
            Signed in as <span className="font-bold">{user.username}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 overflow-y-auto px-6 py-10 md:px-10">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
