"use client";

import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { BookOpen, BarChart3, Target, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
    } else if (user?.role === "ADMIN") {
      router.replace("/admin");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role === "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const quickActions = [
    {
      icon: BookOpen,
      title: "Vocabulary",
      description: "Practice flashcards and word drills",
      href: "/vocab",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      icon: Target,
      title: "Grammar",
      description: "Study grammar rules and exercises",
      href: "/grammar",
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      icon: BarChart3,
      title: "Progress",
      description: "Track your learning progress",
      href: "/progress",
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">
            Welcome back, <span className="gradient-text">{user?.username}</span> 👋
          </h1>
          <p className="text-text-secondary mt-2">Ready to continue your TOEIC journey?</p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <Card
                  padding="md"
                  className="hover:border-primary/40 transition-all duration-200 hover:scale-[1.01] cursor-pointer group h-full"
                >
                  <div className={`inline-flex p-3 rounded-lg ${action.bg} mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-1">{action.title}</h3>
                  <p className="text-sm text-text-secondary">{action.description}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
