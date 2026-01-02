"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { Menu, X, Wallet, User, LogOut, LayoutDashboard } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.push("/");
  };

  const navLinks = [
    { href: "/", label: "Subscriptions" },
    { href: "/blog", label: "Blog" },
    { href: "/help-center", label: "Help Center" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-secondary-700/50 bg-secondary-500/95 backdrop-blur supports-[backdrop-filter]:bg-secondary-500/80">
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500">
              <span className="text-xl font-bold text-secondary-500">S</span>
            </div>
            <span className="text-xl font-bold text-white">ShareIt</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary-500 ${
                  pathname === link.href ? "text-primary-500" : "text-gray-300"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <div className="hidden items-center space-x-2 rounded-lg bg-secondary-600 px-4 py-2 md:flex">
                  <Wallet className="h-4 w-4 text-primary-500" />
                  <span className="text-sm font-semibold text-white">
                    ${user.balance.toFixed(2)}
                  </span>
                </div>

                {/* User Menu - Desktop */}
                <div className="relative hidden md:block">
                  <button className="flex items-center space-x-2 rounded-lg bg-secondary-600 px-4 py-2 transition-colors hover:bg-secondary-700">
                    <User className="h-4 w-4 text-primary-500" />
                    <span className="text-sm font-medium text-white">
                      {user.name}
                    </span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LayoutDashboard className="mr-3 h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="mr-3 h-4 w-4" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="hidden items-center space-x-4 md:flex">
                <Link
                  href="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:text-primary-500"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-primary-500 px-6 py-2 text-sm font-semibold text-secondary-500 transition-all hover:bg-primary-400 hover:shadow-lg hover:shadow-primary-500/50"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-gray-300 hover:bg-secondary-600 md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-secondary-700 py-4 md:hidden">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-secondary-600 text-primary-500"
                      : "text-gray-300 hover:bg-secondary-600"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && user ? (
                <>
                  <div className="mt-4 rounded-lg bg-secondary-600 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Balance</span>
                      <span className="text-lg font-semibold text-primary-500">
                        ${user.balance.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-300 hover:bg-secondary-600"
                  >
                    <LayoutDashboard className="mr-3 h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-300 hover:bg-secondary-600"
                  >
                    <User className="mr-3 h-4 w-4" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center rounded-lg px-4 py-2 text-sm font-medium text-red-400 hover:bg-secondary-600"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-y-2 pt-4">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg bg-secondary-600 px-4 py-2 text-center text-sm font-medium text-white"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg bg-primary-500 px-4 py-2 text-center text-sm font-semibold text-secondary-500"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}