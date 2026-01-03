"use client";

import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "primary" | "success" | "warning" | "error" | "info";
}

export function StatsCard({ title, value, icon: Icon, trend, color = "primary" }: StatsCardProps) {
  const colorClasses = {
    primary: {
      bg: "bg-[#00D9B4]/10",
      border: "border-[#00D9B4]/30",
      icon: "text-[#00D9B4]",
      text: "text-[#00D9B4]",
    },
    success: {
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      icon: "text-green-400",
      text: "text-green-400",
    },
    warning: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      icon: "text-yellow-400",
      text: "text-yellow-400",
    },
    error: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      icon: "text-red-400",
      text: "text-red-400",
    },
    info: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      icon: "text-blue-400",
      text: "text-blue-400",
    },
  };

  const colors = colorClasses[color];

  return (
    <div className="rounded-2xl bg-white/5 p-6 border border-white/10 hover:bg-white/10 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} border ${colors.border}`}>
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>

        {trend && (
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
              trend.isPositive
                ? "bg-green-500/10 text-green-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      <h3 className="text-sm text-gray-400 mb-1">{title}</h3>
      <p className={`text-3xl font-bold ${colors.text}`}>{value}</p>
    </div>
  );
}