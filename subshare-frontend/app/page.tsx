"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { Search, ChevronRight, Sparkles, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";

const platformColors: Record<string, string> = {
  spotify: "#1DB954",
  youtube: "#FF0000",
  netflix: "#E50914",
  paramount: "#0064FF",
  dazn: "#000000",
  hbo: "#9333EA",
  amazon: "#FF9900",
  disney: "#113CCF",
  apple: "#A855F7",
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
    <div className="min-h-screen bg-gradient-to-b from-[#0A1628] via-[#0D1E35] to-[#162845]">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-10"></div>
        <div className="container relative mx-auto px-4 py-16 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">

            <h1 className="mb-6 text-4xl font-extrabold leading-tight text-white md:text-6xl lg:text-7xl animate-slide-in-left">
              <span className="gradient-text">{featuredCount} services</span>{" "}
              available
              <br />
              for{" "}
              <span className="gradient-text">co-subscription</span>
            </h1>

            <p className="mb-10 text-lg text-gray-300 md:text-xl animate-slide-in-right">
              Share and access premium subscription services at a fraction of the cost.
              Join thousands of users saving money together.
            </p>

            {/* Search Bar */}
            <div className="mx-auto mb-8 flex max-w-2xl flex-col gap-4 sm:flex-row animate-scale-in">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Spotify, Disney+..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 w-full rounded-xl bg-white/5 pl-12 pr-4 text-white placeholder-gray-400 backdrop-blur-sm transition-all border border-white/10 focus:bg-white/10 focus:border-[#00D9B4]"
                />
              </div>
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="h-14 w-full appearance-none rounded-xl bg-white/5 px-6 pr-12 text-white backdrop-blur-sm transition-all border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] sm:w-auto"
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
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${selectedCategory === category.id
                      ? "gradient-primary text-[#0A1628] shadow-glow-primary scale-105"
                      : "bg-white/5 text-gray-300 hover:bg-white/10 backdrop-blur-sm border border-white/10"
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
            className="flex items-center gap-2 text-sm font-medium text-[#00D9B4] hover:gap-3 transition-all"
          >
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl bg-white/5 border border-white/10"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {subscriptions.slice(0, 8).map((sub: any, index: number) => {
              const platformName = sub.platform?.name?.toLowerCase() || "";
              const colorHex = platformColors[platformName] || "#00D9B4";

              return (
                <Link
                  key={sub.id}
                  href={`/subscription/${sub.id}`}
                  className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10 border border-white/10 card-hover"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className="h-32 flex items-center justify-center p-6"
                    style={{
                      background: `linear-gradient(135deg, ${colorHex} 0%, ${colorHex}CC 100%)`
                    }}
                  >
                    <span className="text-4xl font-bold text-white drop-shadow-lg">
                      {sub.platform?.name?.charAt(0) || "S"}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="mb-2 text-lg font-bold text-white">
                      {sub.platform?.name || "Platform"}
                    </h3>
                    <div className="mb-4 flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-[#00D9B4]">
                        {sub.price_per_hour}€
                      </span>
                      <span className="text-sm text-gray-400">/ month</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        Participate for ~{Math.floor(sub.price_per_hour * 0.77)} %
                      </span>
                      <ChevronRight className="h-4 w-4 text-[#00D9B4] transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm border border-white/20">
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
          <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-12 text-center backdrop-blur-sm">
            <p className="text-lg text-gray-400">
              No subscriptions found. Try adjusting your filters.
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <button className="rounded-xl gradient-primary px-8 py-4 text-lg font-semibold text-[#0A1628] transition-all hover:shadow-glow-primary hover:scale-105">
            See all subscriptions
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}