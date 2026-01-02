"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { Search, ChevronRight, Sparkles, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

const platformColors: Record<string, string> = {
  spotify: "bg-green-500",
  youtube: "bg-red-500",
  netflix: "bg-red-600",
  paramount: "bg-blue-500",
  dazn: "bg-secondary-800",
  hbo: "bg-purple-600",
  amazon: "bg-orange-500",
  disney: "bg-blue-600",
  apple: "bg-gradient-to-br from-purple-500 to-pink-500",
};

const categories = [
  { id: "all", name: "All", icon: "🎯" },
  { id: "security", name: "Security", icon: "🔒" },
  { id: "house", name: "House", icon: "🏠" },
  { id: "office", name: "Office", icon: "💼" },
  { id: "apps", name: "Apps", icon: "📱" },
  { id: "music", name: "Music", icon: "🎵" },
  { id: "video", name: "Video", icon: "🎬" },
  { id: "news", name: "News", icon: "📰" },
  { id: "games", name: "Games", icon: "🎮" },
  { id: "sport", name: "Sport", icon: "⚽" },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("United Kingdom");

  const { data: subscriptionsData, isLoading } = useQuery({
    queryKey: ["subscriptions", selectedCategory, searchQuery],
    queryFn: () => apiClient.getSubscriptions({ search: searchQuery }),
  });

  const subscriptions = subscriptionsData?.data || [];
  const featuredCount = subscriptions.length || 571;

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary via-secondary-700 to-secondary-900">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-secondary">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(0, 217, 180) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="container relative mx-auto px-4 py-16 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {featuredCount} services available
              </span>
            </div>
            
            <h1 className="mb-6 text-4xl font-extrabold leading-tight text-white md:text-6xl lg:text-7xl">
              Share and access
              <br />
              <span className="bg-gradient-to-r from-primary to-primary-300 bg-clip-text text-transparent">
                premium subscriptions
              </span>
            </h1>

            <p className="mb-10 text-lg text-gray-300 md:text-xl">
              Share and access premium subscription services at a fraction of the cost.
              Join thousands of users saving money together.
            </p>

            {/* Search Bar */}
            <div className="mx-auto mb-8 flex max-w-2xl flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Spotify, Disney+..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 w-full rounded-xl bg-secondary-700 border border-secondary-600 pl-12 pr-4 text-white placeholder-gray-400 transition-all focus:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="h-14 w-full appearance-none rounded-xl bg-secondary-700 border border-secondary-600 px-6 pr-12 text-white transition-all focus:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary sm:w-auto"
                >
                  <option value="United Kingdom">🇬🇧 United Kingdom</option>
                  <option value="United States">🇺🇸 United States</option>
                  <option value="Canada">🇨🇦 Canada</option>
                  <option value="Australia">🇦🇺 Australia</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? "bg-primary text-secondary shadow-lg shadow-primary/30"
                      : "bg-secondary-700 text-gray-300 hover:bg-secondary-600 border border-secondary-600"
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Subscriptions */}
      <section className="container mx-auto px-4 py-16 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Featured Subscriptions
          </h2>
          <Link
            href="#all"
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-300 transition-all"
          >
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl bg-secondary-700"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {subscriptions.slice(0, 8).map((sub: any, index: number) => {
              const platformName = sub.platform?.name?.toLowerCase() || "";
              const colorClass =
                platformColors[platformName] || "bg-gradient-to-br from-primary to-blue-500";
              
              return (
                <Link
                  key={sub.id}
                  href={`/subscription/${sub.id}`}
                  className="group relative overflow-hidden rounded-2xl bg-secondary-800 border border-secondary-700 transition-all hover:scale-105 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20"
                >
                  <div className={`h-32 ${colorClass} flex items-center justify-center p-6`}>
                    <span className="text-4xl font-bold text-white">
                      {sub.platform?.name?.charAt(0) || "S"}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="mb-2 text-lg font-bold text-white">
                      {sub.platform?.name || "Platform"}
                    </h3>
                    <div className="mb-4 flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">
                        {sub.price_per_hour}€
                      </span>
                      <span className="text-sm text-gray-400">/ month</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        Save ~{Math.floor(sub.price_per_hour * 0.77)}%
                      </span>
                      <ChevronRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      {sub.total_shares_count || 0} shares
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!isLoading && subscriptions.length === 0 && (
          <div className="rounded-2xl border border-dashed border-secondary-600 bg-secondary-800 p-12 text-center">
            <p className="text-lg text-gray-400">
              No subscriptions found. Try adjusting your filters.
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <button className="rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-secondary transition-all hover:bg-primary-400 hover:shadow-lg hover:shadow-primary/30 hover:scale-105">
            See all subscriptions
          </button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-primary to-primary-300 p-12 text-center shadow-2xl">
          <h2 className="mb-4 text-3xl font-bold text-secondary md:text-4xl">
            Start Sharing Today
          </h2>
          <p className="mb-8 text-lg text-secondary-700">
            Join thousands of users saving money on subscriptions
          </p>
          <Link
            href="/register"
            className="inline-block rounded-xl bg-secondary px-8 py-4 text-lg font-semibold text-white transition-all hover:scale-105 hover:shadow-2xl hover:bg-secondary-700"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}