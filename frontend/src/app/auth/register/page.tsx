import type { Metadata } from "next";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { RegisterForm } from "@/components/features/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your free LangWhich account and start preparing for TOEIC today.",
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create account"
      subtitle="Start your TOEIC preparation journey — it's free"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
