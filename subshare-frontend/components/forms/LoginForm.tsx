"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import type { LoginCredentials } from "@/types";

export function LoginForm() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const loginMutation = useMutation({
        mutationFn: (credentials: LoginCredentials) => apiClient.login(credentials),
        onSuccess: (data) => {
            setAuth(data.user, data.token);
            router.push("/dashboard");
        },
        onError: (error: Error) => {
            setError(error.message || "Invalid credentials");
        },
    });

    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
        onSubmit: async ({ value }) => {
            setError("");
            loginMutation.mutate(value);
        },
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
            className="space-y-6"
        >
            {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-4 text-sm text-red-300 animate-scale-in">
                    {error}
                </div>
            )}

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
                                className="h-12 w-full rounded-lg bg-white/5 pl-12 pr-4 text-white placeholder-gray-400 transition-all border border-white/10 focus:bg-white/10 focus:border-[#00D9B4]"
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
                                className="h-12 w-full rounded-lg bg-white/5 pl-12 pr-12 text-white placeholder-gray-400 transition-all border border-white/10 focus:bg-white/10 focus:border-[#00D9B4]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </form.Field>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-300 cursor-pointer hover:text-white transition-colors">
                    <input
                        type="checkbox"
                        className="mr-2 h-4 w-4 rounded border-gray-600 bg-white/5 text-[#00D9B4] focus:ring-2 focus:ring-[#00D9B4] focus:ring-offset-0"
                    />
                    Remember me
                </label>
                <Link
                    href="/forgot-password"
                    className="font-medium text-[#00D9B4] hover:text-[#00FFC8] transition-colors"
                >
                    Forgot password?
                </Link>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loginMutation.isPending}
                className="flex h-12 w-full items-center justify-center rounded-lg gradient-primary font-semibold text-[#0A1628] transition-all hover:shadow-glow-primary hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
                {loginMutation.isPending ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                    </>
                ) : (
                    "Sign In"
                )}
            </button>
        </form>
    );
}