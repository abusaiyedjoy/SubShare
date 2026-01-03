"use client";

import Link from "next/link";
import { TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import type { SharedSubscription } from "@/types";

interface SubscriptionCardProps {
  subscription: SharedSubscription;
}

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

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const platformName = subscription.platform?.name?.toLowerCase() || "";
  const colorHex = platformColors[platformName] || "#00D9B4";
  const dailyPrice = subscription.price_per_hour * 24;
  const monthlyPrice = dailyPrice * 30;

  return (
    <Link
      href={`/subscription/${subscription.id}`}
      className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10 border border-white/10 card-hover block"
    >
      {/* Header with Platform Color */}
      <div
        className="h-32 flex items-center justify-center p-6 relative"
        style={{
          background: `linear-gradient(135deg, ${colorHex} 0%, ${colorHex}CC 100%)`,
        }}
      >
        <span className="text-4xl font-bold text-white drop-shadow-lg">
          {subscription.platform?.name?.charAt(0) || "S"}
        </span>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {subscription.is_verified ? (
            <div className="flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400 backdrop-blur-sm border border-green-500/30">
              <CheckCircle className="h-3 w-3" />
              Verified
            </div>
          ) : (
            <div className="flex items-center gap-1 rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400 backdrop-blur-sm border border-yellow-500/30">
              <Clock className="h-3 w-3" />
              Pending
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="mb-2 text-lg font-bold text-white">
          {subscription.platform?.name || "Platform"}
        </h3>

        {/* Pricing */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold text-[#00D9B4]">
              ${subscription.price_per_hour}
            </span>
            <span className="text-sm text-gray-400">/ hour</span>
          </div>
          <div className="text-xs text-gray-400">
            ${dailyPrice.toFixed(2)}/day · ${monthlyPrice.toFixed(2)}/month
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm border-t border-white/10 pt-3">
          <div className="flex items-center gap-1 text-gray-400">
            <TrendingUp className="h-4 w-4 text-[#00D9B4]" />
            <span>{subscription.total_shares_count || 0} shares</span>
          </div>
          <span className="text-[#00D9B4] font-medium group-hover:translate-x-1 transition-transform">
            View Details →
          </span>
        </div>

        {/* Expiration if exists */}
        {subscription.expires_at && (
          <div className="mt-3 text-xs text-gray-400">
            Expires: {new Date(subscription.expires_at).toLocaleDateString()}
          </div>
        )}
      </div>
    </Link>
  );
}