"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/store/auth.store";

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must be at most 50 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z.string().email("Please enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);

    try {
      const response = await authApi.register({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      setAuth(response.user, response.access_token, response.refresh_token);
      router.push("/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data;
        if (apiError?.errors) {
          const firstError = Object.values(apiError.errors)[0] as string;
          setServerError(firstError);
        } else {
          setServerError(apiError?.message ?? "Registration failed. Please try again.");
        }
      } else {
        setServerError("Network error. Please check your connection.");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      {serverError && (
        <Alert
          variant="error"
          message={serverError}
          onDismiss={() => setServerError(null)}
        />
      )}

      <Input
        id="register-username"
        label="Username"
        type="text"
        placeholder="johndoe"
        autoComplete="username"
        error={errors.username?.message}
        helperText="Letters, numbers and underscores only"
        {...register("username")}
      />

      <Input
        id="register-email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        id="register-password"
        label="Password"
        type="password"
        placeholder="Create a strong password"
        autoComplete="new-password"
        error={errors.password?.message}
        helperText="Min 8 chars, 1 uppercase, 1 number"
        {...register("password")}
      />

      <Input
        id="register-confirm-password"
        label="Confirm Password"
        type="password"
        placeholder="Repeat your password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <p className="text-xs text-text-secondary">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="text-primary hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>
        .
      </p>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isSubmitting}
        id="register-submit-btn"
      >
        Create Account
      </Button>

      <p className="text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-primary hover:text-primary-hover font-medium transition-colors duration-200"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
