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
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.push("/");
    setUserMenuOpen(false);
  };

  const navLinks = [
    { href: "/", label: "Subscriptions" },
    { href: "/blog", label: "Blog" },
    { href: "/help-center", label: "Help Center" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0A1628]/95 backdrop-blur-lg">
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary transition-transform group-hover:scale-110">
              <span className="text-xl font-bold text-[#0A1628]">S</span>
            </div>
            <span className="text-xl font-bold text-white">ShareIt</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-[#00D9B4] ${pathname === link.href ? "text-[#00D9B4]" : "text-gray-300"
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
                {/* Wallet Balance */}
                <div className="hidden items-center space-x-2 rounded-lg bg-white/5 px-4 py-2 border border-white/10 md:flex hover:bg-white/10 transition-colors">
                  <Wallet className="h-4 w-4 text-[#00D9B4]" />
                  <span className="text-sm font-semibold text-white">
                    ${user.balance.toFixed(2)}
                  </span>
                </div>

                {/* User Menu - Desktop */}
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 rounded-lg bg-white/5 px-4 py-2 border border-white/10 transition-colors hover:bg-white/10"
                  >
                    <User className="h-4 w-4 text-[#00D9B4]" />
                    <span className="text-sm font-medium text-white">
                      {user.name}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-[#162845] shadow-xl border border-white/10 z-20 animate-scale-in">
                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                          >
                            <LayoutDashboard className="mr-3 h-4 w-4 text-[#00D9B4]" />
                            Dashboard
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                          >
                            <User className="mr-3 h-4 w-4 text-[#00D9B4]" />
                            Profile
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut className="mr-3 h-4 w-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden items-center space-x-4 md:flex">
                <Link
                  href="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:text-[#00D9B4]"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg gradient-primary px-6 py-2 text-sm font-semibold text-[#0A1628] transition-all hover:shadow-glow-primary hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-gray-300 hover:bg-white/5 md:hidden transition-colors"
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
          <div className="border-t border-white/5 py-4 md:hidden animate-fade-in">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block rounded-lg px-4 py-2 text-sm font-medium transition-colors ${pathname === link.href
                      ? "bg-white/10 text-[#00D9B4]"
                      : "text-gray-300 hover:bg-white/5"
                    }`}
                >
                  {link.label}
                </Link>
              ))}

              {isAuthenticated && user ? (
                <>
                  {/* Mobile Wallet Balance */}
                  <div className="mt-4 rounded-lg bg-white/5 px-4 py-3 border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Balance</span>
                      <span className="text-lg font-semibold text-[#00D9B4]">
                        ${user.balance.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/5"
                  >
                    <LayoutDashboard className="mr-3 h-4 w-4 text-[#00D9B4]" />
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/5"
                  >
                    <User className="mr-3 h-4 w-4 text-[#00D9B4]" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center rounded-lg px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10"
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
                    className="block rounded-lg bg-white/5 px-4 py-2 text-center text-sm font-medium text-white border border-white/10"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg gradient-primary px-4 py-2 text-center text-sm font-semibold text-[#0A1628]"
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