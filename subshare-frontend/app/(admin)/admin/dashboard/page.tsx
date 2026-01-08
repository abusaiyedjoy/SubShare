"use client";

import { Layout } from "@/components/layout/Layout";
import { StatsCard } from "@/components/shared/StatsCard";
import { TransactionList } from "@/components/shared/TransactionList";
import { Badge } from "@/components/shared/Badge";
import { useAdmin } from "@/hooks/useAdmin";
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp,
  AlertCircle,
  FileCheck,
  Clock,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpenner";

export default function AdminDashboardPage() {
  const { 
    stats, 
    isLoadingStats,
    transactions,
    isLoadingTransactions,
    topupRequests,
    pendingVerifications,
    reports
  } = useAdmin();

  if (isLoadingStats) {
    return (
      <Layout showSidebar={true}>
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </Layout>
    );
  }

  const dashboardStats = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "primary" as const,
      trend: { value: 12, isPositive: true },
    },
    {
      title: "Total Subscriptions",
      value: stats.totalSubscriptions,
      icon: Package,
      color: "info" as const,
      trend: { value: 8, isPositive: true },
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "success" as const,
      trend: { value: 15, isPositive: true },
    },
    {
      title: "Total Commission",
      value: `$${(stats?.totalCommission ?? 0).toFixed(2)}`,
      icon: TrendingUp,
      color: "warning" as const,
    },
  ];

  const pendingStats = [
    {
      title: "Pending Topups",
      value: stats.pendingTopups,
      icon: Clock,
      href: "/admin/topup-requests",
      color: "warning" as const,
    },
    {
      title: "Pending Verifications",
      value: stats.pendingVerifications,
      icon: FileCheck,
      href: "/admin/verifications",
      color: "info" as const,
    },
    {
      title: "Active Reports",
      value: reports?.filter(r => r.status === "pending").length,
      icon: AlertCircle,
      href: "/admin/reports",
      color: "error" as const,
    },
  ];

  return (
    <Layout showSidebar={true}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Overview of platform performance and activities</p>
        </div>

        {/* Main Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {dashboardStats.map((stat) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              trend={stat.trend}
            />
          ))}
        </div>

        {/* Pending Actions */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Pending Actions</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {pendingStats.map((stat) => (
              <Link
                key={stat.title}
                href={stat.href}
                className="group rounded-2xl bg-white/5 p-6 border border-white/10 hover:bg-white/10 transition-all card-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    stat.color === "warning" ? "bg-yellow-500/10 border border-yellow-500/30" :
                    stat.color === "info" ? "bg-blue-500/10 border border-blue-500/30" :
                    "bg-red-500/10 border border-red-500/30"
                  }`}>
                    <stat.icon className={`h-6 w-6 ${
                      stat.color === "warning" ? "text-yellow-400" :
                      stat.color === "info" ? "text-blue-400" :
                      "text-red-400"
                    }`} />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#00D9B4] group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-sm text-gray-400 mb-1">{stat.title}</h3>
                <p className={`text-3xl font-bold ${
                  stat.color === "warning" ? "text-yellow-400" :
                  stat.color === "info" ? "text-blue-400" :
                  "text-red-400"
                }`}>
                  {stat.value}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 rounded-2xl bg-white/5 p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
              <Link
                href="/admin/transactions"
                className="flex items-center gap-2 text-sm text-[#00D9B4] hover:text-[#00FFC8] transition-colors"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <TransactionList
              transactions={(transactions || []).slice(0, 5)}
              isLoading={isLoadingTransactions}
            />
          </div>

          {/* Quick Links & Notifications */}
          <div className="space-y-6">
            {/* Recent Topup Requests */}
            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <h2 className="text-lg font-bold text-white mb-4">Recent Topup Requests</h2>
              {(topupRequests || []).length > 0 ? (
                <div className="space-y-3">
                  {(topupRequests || []).slice(0, 3).map((request) => (
                    <div
                      key={request.id}
                      className="rounded-lg bg-white/5 p-3 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-white">
                          ${request.amount.toFixed(2)}
                        </p>
                        <Badge
                          variant={
                            request.status === "approved"
                              ? "success"
                              : request.status === "rejected"
                              ? "error"
                              : "warning"
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">
                        {request.user?.name} • {formatDateTime(request.created_at)}
                      </p>
                    </div>
                  ))}
                  <Link
                    href="/admin/topup-requests"
                    className="flex items-center justify-center gap-2 rounded-lg bg-white/5 p-2 text-sm text-[#00D9B4] hover:bg-white/10 transition-colors"
                  >
                    View All <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No pending requests</p>
              )}
            </div>

            {/* Pending Verifications */}
            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <h2 className="text-lg font-bold text-white mb-4">Pending Verifications</h2>
              {(pendingVerifications || []).length > 0 ? (
                <div className="space-y-3">
                  {(pendingVerifications || []).slice(0, 3).map((sub) => (
                    <div
                      key={sub.id}
                      className="rounded-lg bg-white/5 p-3 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-white">
                          {sub.platform?.name}
                        </p>
                        <Badge variant="warning">Pending</Badge>
                      </div>
                      <p className="text-xs text-gray-400">
                        ${sub.price_per_hour}/hr • {formatDateTime(sub.created_at)}
                      </p>
                    </div>
                  ))}
                  <Link
                    href="/admin/verifications"
                    className="flex items-center justify-center gap-2 rounded-lg bg-white/5 p-2 text-sm text-[#00D9B4] hover:bg-white/10 transition-colors"
                  >
                    View All <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No pending verifications</p>
              )}
            </div>

            {/* System Status */}
            <div className="rounded-2xl bg-gradient-to-br from-green-500/10 to-blue-500/10 p-6 border border-white/10">
              <h2 className="text-lg font-bold text-white mb-4">System Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">API Status</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-sm font-medium text-green-400">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Database</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-sm font-medium text-green-400">Connected</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Active Users</span>
                  <span className="text-sm font-medium text-white">{stats.activeAccesses}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}