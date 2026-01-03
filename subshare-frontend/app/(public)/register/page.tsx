"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { User as UserIcon } from "lucide-react";
import { RegisterForm } from "@/components/forms/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0D1E35] to-[#162845]">
      <Header />

      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-2xl glass-dark p-8 shadow-2xl border border-white/10 animate-scale-in">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow-primary">
                <UserIcon className="h-8 w-8 text-[#0A1628]" />
              </div>
              <h1 className="mb-2 text-3xl font-bold text-white">Create Account</h1>
              <p className="text-gray-300">Join thousands sharing subscriptions</p>
            </div>

            <RegisterForm />

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="px-4 text-sm text-gray-400">or</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>

            {/* Sign In Link */}
            <p className="text-center text-sm text-gray-300">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#00D9B4] hover:text-[#00FFC8] transition-colors"
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