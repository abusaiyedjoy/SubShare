"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Header } from "@/components/layout/Header";
import { Eye, EyeOff, Lock, Mail, User as UserIcon, Loader2, CheckCircle2 } from "lucide-react";
import type { RegisterData } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => apiClient.register(data),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      setError(error.message || "Registration failed");
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      setError("");
      
      // Validation
      if (value.password !== value.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (value.password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }

      registerMutation.mutate(value);
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-500 via-secondary-600 to-secondary-700">
      <Header />
      
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-2xl bg-white/10 p-8 shadow-2xl backdrop-blur-lg">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500">
                <UserIcon className="h-8 w-8 text-secondary-500" />
              </div>
              <h1 className="mb-2 text-3xl font-bold text-white">Create Account</h1>
              <p className="text-gray-300">Join thousands sharing subscriptions</p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/50 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-5"
            >
              {/* Name Field */}
              <form.Field name="name">
                {(field) => (
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium text-gray-200"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        id="name"
                        type="text"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="John Doe"
                        required
                        className="h-12 w-full rounded-lg bg-white/5 pl-12 pr-4 text-white placeholder-gray-400 transition-all focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                )}
              </form.Field>

              {/* Email Field */}
              <form.Field name="email">
                {(field) => (
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-gray-200"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="h-12 w-full rounded-lg bg-white/5 pl-12 pr-4 text-white placeholder-gray-400 transition-all focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                )}
              </form.Field>

              {/* Password Field */}
              <form.Field name="password">
                {(field) => (
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium text-gray-200"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="h-12 w-full rounded-lg bg-white/5 pl-12 pr-12 text-white placeholder-gray-400 transition-all focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {field.state.value && (
                      <p className="mt-2 text-xs text-gray-400">
                        {field.state.value.length >= 8 ? (
                          <span className="flex items-center text-green-400">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Strong password
                          </span>
                        ) : (
                          "At least 8 characters"
                        )}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              {/* Confirm Password Field */}
              <form.Field name="confirmPassword">
                {(field) => (
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-medium text-gray-200"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="h-12 w-full rounded-lg bg-white/5 pl-12 pr-12 text-white placeholder-gray-400 transition-all focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form.Field>

              {/* Terms Checkbox */}
              <div className="flex items-start text-sm">
                <input
                  type="checkbox"
                  required
                  className="mt-1 mr-2 h-4 w-4 rounded border-gray-600 bg-white/5 text-primary-500 focus:ring-2 focus:ring-primary-500"
                />
                <label className="text-gray-300">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary-500 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary-500 hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="flex h-12 w-full items-center justify-center rounded-lg bg-primary-500 font-semibold text-secondary-500 transition-all hover:bg-primary-400 hover:shadow-lg hover:shadow-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-600"></div>
              <span className="px-4 text-sm text-gray-400">or</span>
              <div className="flex-1 border-t border-gray-600"></div>
            </div>

            {/* Sign In Link */}
            <p className="text-center text-sm text-gray-300">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary-500 hover:text-primary-400"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}