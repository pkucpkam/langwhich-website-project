import type { Metadata } from "next";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { LoginForm } from "@/components/features/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your LangWhich account to continue your TOEIC journey.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your learning journey"
    >
      <LoginForm />
    </AuthLayout>
  );
}
