"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Lock } from "lucide-react";
import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0D1E35] to-[#162845]">
      <Header />

      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-2xl glass-dark p-8 shadow-2xl border border-white/10 animate-scale-in">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow-primary">
                <Lock className="h-8 w-8 text-[#0A1628]" />
              </div>
              <h1 className="mb-2 text-3xl font-bold text-white">Welcome Back</h1>
              <p className="text-gray-300">Sign in to your account to continue</p>
            </div>

            <LoginForm />

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="px-4 text-sm text-gray-400">or</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-300">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#00D9B4] hover:text-[#00FFC8] transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </div>

          {/* Additional Info */}
          <p className="mt-6 text-center text-xs text-gray-400">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-[#00D9B4] hover:text-[#00FFC8] transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-[#00D9B4] hover:text-[#00FFC8] transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}