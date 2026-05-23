"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import Link from "next/link";
import {
  Shield,
  BookOpen,
  FileText,
  Users,
  LogOut,
  ArrowLeft,
  Loader2,
  Menu,
  X,
  Lock,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      if (!isAuthenticated) {
        router.replace("/auth/login");
      } else if (user?.role !== "ADMIN") {
        router.replace("/vocab");
      }
    }
  }, [isMounted, isAuthenticated, user, router]);

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/auth/login";
  };

  if (!isMounted || !isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#0B1220] flex flex-col items-center justify-center gap-4">
        <Lock className="h-12 w-12 text-[#EF4444] animate-bounce" />
        <h1 className="text-xl font-bold text-[#F9FAFB]">Unauthorized Access</h1>
        <p className="text-sm text-[#9CA3AF]">Redirecting to standard area...</p>
        <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
      </div>
    );
  }

  const sidebarLinks = [
    {
      href: "/admin?tab=vocab",
      activeTab: "vocab",
      label: "Vocabulary Hub",
      icon: BookOpen,
      desc: "Manage folders & study sets",
    },
    {
      href: "/admin/theory/lessons",
      activeTab: "theory",
      label: "Theory Hub",
      icon: FileText,
      desc: "Manage guides & collections",
    },
    {
      href: "/admin/exercises",
      activeTab: "exercises",
      label: "Exercise Hub",
      icon: Award,
      desc: "Manage practice worksheets",
    },
    {
      href: "/admin?tab=users",
      activeTab: "users",
      label: "User Directory",
      icon: Users,
      desc: "Manage registered members",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B1220] flex text-[#F9FAFB] flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#1F2937] bg-[#111827] flex-shrink-0">
        {/* Brand Logo */}
        <div className="h-16 flex items-center gap-2 px-6 border-b border-[#1F2937]">
          <Shield className="h-5 w-5 text-amber-400" />
          <span className="font-bold text-lg tracking-tight">LangWhich Admin</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            // Determine active based on current query tab or pathname
            const isTabActive = pathname.startsWith("/admin") && (
              (link.activeTab === "vocab" && pathname === "/admin" && (!window.location.search || window.location.search.includes("tab=vocab"))) ||
              (link.activeTab === "theory" && pathname.startsWith("/admin/theory")) ||
              (link.activeTab === "exercises" && pathname.startsWith("/admin/exercises")) ||
              (link.activeTab === "users" && pathname === "/admin" && window.location.search.includes("tab=users"))
            );
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-start gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isTabActive
                    ? "bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/15"
                    : "text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1F2937]"
                )}
              >
                <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="block text-sm font-semibold truncate">{link.label}</span>
                  <span className={cn(
                    "block text-[11px] truncate mt-0.5",
                    isTabActive ? "text-blue-100" : "text-[#9CA3AF]"
                  )}>
                    {link.desc}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-[#1F2937] bg-[#0B1220]/30 space-y-2">
          {/* Back to site */}
          <Link
            href="/vocab"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1F2937] transition-all"
          >
            <ArrowLeft size={14} />
            <span>Return to Site</span>
          </Link>

          {/* User info */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#1F2937]/50 rounded-xl">
            <div className="min-w-0">
              <span className="block text-xs font-bold text-amber-400">ADMIN</span>
              <span className="block text-xs text-[#9CA3AF] truncate max-w-[120px]">
                {user.username}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#9CA3AF] hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-[#1F2937] bg-[#111827] flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-400" />
          <span className="font-bold text-base">LangWhich Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg border border-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Drawer Menu */}
      <aside
        className={cn(
          "md:hidden fixed top-16 bottom-0 left-0 w-64 border-r border-[#1F2937] bg-[#111827] z-40 transform transition-transform duration-300 flex flex-col justify-between",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="px-4 py-6 space-y-2">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isTabActive = pathname.startsWith("/admin") && (
              (link.activeTab === "vocab" && pathname === "/admin" && (!window.location.search || window.location.search.includes("tab=vocab"))) ||
              (link.activeTab === "theory" && pathname.startsWith("/admin/theory")) ||
              (link.activeTab === "exercises" && pathname.startsWith("/admin/exercises")) ||
              (link.activeTab === "users" && pathname === "/admin" && window.location.search.includes("tab=users"))
            );
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-start gap-3 px-4 py-3 rounded-xl transition-all",
                  isTabActive
                    ? "bg-[#2563EB] text-white shadow-lg"
                    : "text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1F2937]"
                )}
              >
                <Icon className="h-5 w-5 mt-0.5" />
                <div>
                  <span className="block text-sm font-semibold">{link.label}</span>
                  <span className="block text-[10px] text-[#9CA3AF] mt-0.5">{link.desc}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#1F2937] bg-[#0B1220]/30 space-y-2">
          <Link
            href="/vocab"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-[#9CA3AF] hover:text-[#F9FAFB]"
          >
            <ArrowLeft size={14} />
            <span>Return to Site</span>
          </Link>
          <div className="flex items-center justify-between px-4 py-2 bg-[#1F2937]/50 rounded-xl">
            <span className="text-xs text-[#9CA3AF] font-bold">{user.username}</span>
            <button type="button" onClick={handleLogout} className="text-[#9CA3AF] hover:text-red-400">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Page Area */}
      <div className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0">
        <main className="flex-1 overflow-y-auto p-6 md:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
