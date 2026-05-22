"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import {
  BookOpen,
  Home,
  Library,
  Brain,
  History,
  Trophy,
  Plus,
  LogOut,
  Shield,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/vocab", label: "Home", icon: Home },
  { href: "/vocab/my-lessons", label: "My Lessons", icon: Library },
  { href: "/vocab/srs-review", label: "SRS Review", icon: Brain },
  { href: "/vocab/study-history", label: "History", icon: History },
  { href: "/vocab/leaderboard", label: "Leaderboard", icon: Trophy },
];

export function VocabNavbar() {
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/auth/login";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#1F2937] bg-[#0B1220]/90 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link
          href="/vocab"
          className="flex items-center gap-2 font-bold text-lg text-[#F9FAFB] hover:text-[#2563EB] transition-colors"
          id="vocab-nav-logo"
        >
          <BookOpen className="h-5 w-5 text-[#2563EB]" />
          <span>LangWhich</span>
        </Link>

        {/* Nav links */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname === href || pathname.startsWith(href + "/")
                    ? "bg-[#2563EB]/10 text-[#2563EB]"
                    : "text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1F2937]"
                )}
                id={`vocab-nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <Icon size={15} />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/vocab/create-lesson"
            id="vocab-nav-create"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-all duration-200"
          >
            <Plus size={15} />
            New Lesson
          </Link>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              id="vocab-nav-user"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#1F2937] hover:border-[#2563EB]/50 transition-all duration-200"
            >
              <div className="w-6 h-6 rounded-full bg-[#2563EB]/20 flex items-center justify-center text-xs font-bold text-[#2563EB]">
                {user?.username?.[0]?.toUpperCase() ?? "U"}
              </div>
              <span className="hidden md:inline text-sm text-[#F9FAFB]">
                {user?.username}
              </span>
              {user?.role === "ADMIN" && (
                <Shield size={13} className="text-amber-400" />
              )}
              <ChevronDown size={13} className="text-[#9CA3AF]" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-12 z-20 w-48 rounded-xl border border-[#1F2937] bg-[#0B1220] shadow-xl py-1">
                {user?.role === "ADMIN" && (
                  <Link
                    href="/vocab/admin"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-amber-400 hover:bg-[#1F2937] transition-colors"
                    id="vocab-nav-admin"
                  >
                    <Shield size={14} />
                    Admin Panel
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#9CA3AF] hover:bg-[#1F2937] hover:text-[#F9FAFB] transition-colors"
                  id="vocab-nav-logout"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
