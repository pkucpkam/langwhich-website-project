"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, Brain, History, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const subLinks = [
  { href: "/vocab", label: "Overview", icon: Home },
  { href: "/vocab/my-lessons", label: "My Lessons", icon: Library },
  { href: "/vocab/srs-review", label: "SRS Review", icon: Brain },
  { href: "/vocab/study-history", label: "Study History", icon: History },
];

export function VocabSubNavbar() {
  const pathname = usePathname();

  return (
    <div className="w-full bg-[#0B1220] border-b border-[#1F2937] sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-between">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 h-full overflow-x-auto no-scrollbar whitespace-nowrap">
          {subLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/vocab" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-2 h-full text-xs font-semibold tracking-wide transition-all duration-200 px-1 border-b-2",
                  isActive
                    ? "text-[#2563EB] border-[#2563EB]"
                    : "text-[#9CA3AF] border-transparent hover:text-[#F9FAFB]"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", isActive ? "text-[#2563EB]" : "text-[#9CA3AF]/60")} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="hidden sm:flex items-center">
          <Link
            href="/vocab/create-lesson"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-all duration-200"
          >
            <Plus size={12} />
            <span>Create Lesson</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
