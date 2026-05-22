import {
  BookOpen,
  Brain,
  BarChart3,
  Headphones,
  Target,
  Trophy,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

const features = [
  {
    icon: BookOpen,
    title: "Smart Vocabulary",
    description:
      "Spaced-repetition flashcards with topic-based organization. Learn words in context, not isolation.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: Brain,
    title: "Grammar Mastery",
    description:
      "Structured lessons covering all TOEIC grammar patterns with clear explanations and practice drills.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    icon: Headphones,
    title: "Listening Practice",
    description:
      "Part 1–4 listening exercises with authentic test audio and real-time answer feedback.",
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    icon: Target,
    title: "Full Mock Exams",
    description:
      "Timed, full-length TOEIC simulations scored using the official TOEIC scale. Identify your weak areas.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description:
      "Visual dashboards tracking your improvement over time. Understand exactly where to focus.",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
  {
    icon: Trophy,
    title: "Leaderboards",
    description:
      "Compete with other learners globally. Stay motivated and celebrate your milestones.",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-semibold text-text-primary mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            A complete TOEIC preparation ecosystem — from vocabulary to full mock exams.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                padding="md"
                className="hover:border-primary/40 transition-all duration-200 hover:scale-[1.01] group"
              >
                <div
                  className={`inline-flex p-3 rounded-lg ${feature.bg} mb-4 group-hover:scale-110 transition-transform duration-200`}
                >
                  <Icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
