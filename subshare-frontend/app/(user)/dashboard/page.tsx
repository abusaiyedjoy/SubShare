"use client";

import { Layout } from "@/components/layout/Layout";
import { StatsCard } from "@/components/shared/StatsCard";
import { WalletBalance } from "@/components/shared/WalletBalance";
import { TransactionList } from "@/components/shared/TransactionList";
import { SubscriptionCard } from "@/components/shared/SubscriptionCard";
import { Modal } from "@/components/shared/Modal";
import { TopupForm } from "@/components/forms/TopUpForm";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useState } from "react";
import { Key, Share2, TrendingUp, DollarSign, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSubscriptions } from "@/hooks/useSubscription";
import { SharedSubscription, Transaction } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { transactions, isLoadingTransactions } = useWallet();
  const { mySubscriptions, sharedSubscriptions } = useSubscriptions();
  const [showTopupModal, setShowTopupModal] = useState(false);

  const stats = [
    {
      title: "Active Subscriptions",
      value: mySubscriptions.length,
      icon: Key,
      color: "primary" as const,
    },
    {
      title: "Shared Subscriptions",
      value: sharedSubscriptions.length,
      icon: Share2,
      color: "success" as const,
    },
    {
      title: "Total Earnings",
      value: `$${sharedSubscriptions.reduce((acc: any, sub: any) => acc + (sub.total_shares_count * sub.price_per_hour * 24), 0).toFixed(2)}`,
      icon: TrendingUp,
      color: "info" as const,
    },
    {
      title: "Total Spent",
      value: `$${transactions
        .filter((t: Transaction) => t.transaction_type === "purchase")
        .reduce((acc: number, t: Transaction) => acc + t.amount, 0)
        .toFixed(2)}`,
      icon: DollarSign,
      color: "warning" as const,
    },
  ];

  return (
    <Layout showSidebar={true}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-gray-400">
              Here's what's happening with your subscriptions today.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - 2/3 width */}
          <div className="space-y-6 lg:col-span-2">
            {/* Recent Transactions */}
            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
                <Link
                  href="/wallet"
                  className="flex items-center gap-2 text-sm text-[#00D9B4] hover:text-[#00FFC8] transition-colors"
                >
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <TransactionList
                transactions={transactions.slice(0, 5)}
                isLoading={isLoadingTransactions}
              />
            </div>

            {/* Active Subscriptions */}
            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Active Subscriptions</h2>
                <Link
                  href="/my-access"
                  className="flex items-center gap-2 text-sm text-[#00D9B4] hover:text-[#00FFC8] transition-colors"
                >
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              {mySubscriptions.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {mySubscriptions.slice(0, 4).map((access: any) => (
                    <SubscriptionCard
                      key={access.id}
                      subscription={access.subscription}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Key className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 mb-4">No active subscriptions</p>
                  <Link
                    href="/"
                    className="inline-block rounded-lg bg-gradient-primary px-6 py-2 text-sm font-semibold text-[#0A1628] transition-all hover:shadow-glow-primary hover:scale-105"
                  >
                    Browse Subscriptions
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Wallet Balance */}
            <WalletBalance
              showAddButton={true}
              onAddClick={() => setShowTopupModal(true)}
            />

            {/* Quick Actions */}
            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/share-subscription"
                  className="flex items-center gap-3 rounded-lg bg-white/5 p-4 transition-all hover:bg-white/10 border border-white/10 group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00D9B4]/10 text-[#00D9B4] border border-[#00D9B4]/30">
                    <Share2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white group-hover:text-[#00D9B4] transition-colors">
                      Share Subscription
                    </p>
                    <p className="text-xs text-gray-400">Start earning today</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#00D9B4] group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-lg bg-white/5 p-4 transition-all hover:bg-white/10 border border-white/10 group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    <Key className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white group-hover:text-[#00D9B4] transition-colors">
                      Browse Subscriptions
                    </p>
                    <p className="text-xs text-gray-400">Find great deals</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#00D9B4] group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                  href="/wallet"
                  className="flex items-center gap-3 rounded-lg bg-white/5 p-4 transition-all hover:bg-white/10 border border-white/10 group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400 border border-green-500/30">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white group-hover:text-[#00D9B4] transition-colors">
                      Add Funds
                    </p>
                    <p className="text-xs text-gray-400">Top up your wallet</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#00D9B4] group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>

            {/* My Shares Summary */}
            {sharedSubscriptions.length > 0 && (
              <div className="rounded-2xl bg-gradient-to-br from-green-500/10 to-blue-500/10 p-6 border border-white/10">
                <h2 className="text-xl font-bold text-white mb-4">My Shares</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Total Shares</span>
                    <span className="text-lg font-bold text-white">
                      {sharedSubscriptions.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Active Users</span>
                    <span className="text-lg font-bold text-[#00D9B4]">
                      {sharedSubscriptions.reduce(
                        (acc: number, sub: SharedSubscription) =>
                          acc + sub.total_shares_count,
                        0
                      )}

                    </span>
                  </div>
                  <Link
                    href="/my-shares"
                    className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/20"
                  >
                    Manage Shares <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Topup Modal */}
      <Modal
        isOpen={showTopupModal}
        onClose={() => setShowTopupModal(false)}
        title="Add Funds to Wallet"
        size="md"
      >
        <TopupForm
          onSuccess={() => setShowTopupModal(false)}
          onCancel={() => setShowTopupModal(false)}
        />
      </Modal>
    </Layout>
  );
}