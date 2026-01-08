"use client";

import { Layout } from "@/components/layout/Layout";
import { TransactionList } from "@/components/shared/TransactionList";
import { LoadingSpinner } from "@/components/shared/LoadingSpenner";
import { useAdmin } from "@/hooks/useAdmin";
import { useState } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Download,
  Filter,
  Search,
  Calendar
} from "lucide-react";

export default function AdminTransactionsPage() {
  const { transactions, isLoadingTransactions } = useAdmin();
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  const filteredTransactions = transactions?.filter(t => filterType === "all" || t.transaction_type === filterType)
    .filter(t => filterStatus === "all" || t.status === filterStatus)
    .filter(t => 
      !searchQuery || 
      t.user_id.toString().includes(searchQuery) ||
      (t.reference_id && t.reference_id.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const stats = {
    totalRevenue: transactions?.filter(t => t.transaction_type === "purchase" && t.status === "completed")
      .reduce((acc, t) => acc + t.amount, 0),
    totalCommission: transactions?.filter(t => t.transaction_type === "commission")
      .reduce((acc, t) => acc + t.amount, 0),
    totalTopups: transactions?.filter(t => t.transaction_type === "topup" && t.status === "completed")
      .reduce((acc, t) => acc + t.amount, 0),
    totalRefunds: transactions?.filter(t => t.transaction_type === "refund")
      .reduce((acc, t) => acc + t.amount, 0),
  };

  if (isLoadingTransactions) {
    return (
      <Layout showSidebar={true}>
        <LoadingSpinner size="lg" text="Loading transactions..." />
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">All Transactions</h1>
            <p className="text-gray-400">Monitor all platform transactions</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-gradient-primary px-6 py-3 font-semibold text-[#0A1628] transition-all hover:shadow-glow-primary hover:scale-105">
            <Download className="h-5 w-5" />
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 border border-green-500/30">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <span className="text-sm text-gray-400">Total Revenue</span>
            </div>
            <p className="text-3xl font-bold text-green-400">
              ${stats.totalRevenue.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00D9B4]/10 border border-[#00D9B4]/30">
                <DollarSign className="h-5 w-5 text-[#00D9B4]" />
              </div>
              <span className="text-sm text-gray-400">Commission Earned</span>
            </div>
            <p className="text-3xl font-bold text-[#00D9B4]">
              ${stats.totalCommission.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/30">
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
              <span className="text-sm text-gray-400">Total Topups</span>
            </div>
            <p className="text-3xl font-bold text-blue-400">
              ${stats.totalTopups.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/30">
                <TrendingDown className="h-5 w-5 text-red-400" />
              </div>
              <span className="text-sm text-gray-400">Total Refunds</span>
            </div>
            <p className="text-3xl font-bold text-red-400">
              ${stats.totalRefunds.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-200">
                <Filter className="h-4 w-4" />
                Transaction Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-10 w-full rounded-lg bg-white/5 px-4 text-sm text-white border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] transition-all"
              >
                <option value="all" className="bg-[#0A1628]">All Types</option>
                <option value="topup" className="bg-[#0A1628]">Top Up</option>
                <option value="purchase" className="bg-[#0A1628]">Purchase</option>
                <option value="earning" className="bg-[#0A1628]">Earning</option>
                <option value="refund" className="bg-[#0A1628]">Refund</option>
                <option value="commission" className="bg-[#0A1628]">Commission</option>
              </select>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-200">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-10 w-full rounded-lg bg-white/5 px-4 text-sm text-white border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] transition-all"
              >
                <option value="all" className="bg-[#0A1628]">All Status</option>
                <option value="pending" className="bg-[#0A1628]">Pending</option>
                <option value="completed" className="bg-[#0A1628]">Completed</option>
                <option value="failed" className="bg-[#0A1628]">Failed</option>
                <option value="cancelled" className="bg-[#0A1628]">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-200">
                <Calendar className="h-4 w-4" />
                Date Range
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="h-10 w-full rounded-lg bg-white/5 px-4 text-sm text-white border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] transition-all"
              >
                <option value="all" className="bg-[#0A1628]">All Time</option>
                <option value="today" className="bg-[#0A1628]">Today</option>
                <option value="week" className="bg-[#0A1628]">This Week</option>
                <option value="month" className="bg-[#0A1628]">This Month</option>
                <option value="year" className="bg-[#0A1628]">This Year</option>
              </select>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-200">
                <Search className="h-4 w-4" />
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="User ID or Reference..."
                className="h-10 w-full rounded-lg bg-white/5 px-4 text-sm text-white placeholder-gray-400 border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Transaction Summary */}
        <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">
              Transaction History ({filteredTransactions?.length})
            </h2>
            <div className="text-sm text-gray-400">
              Showing {filteredTransactions?.length} of {transactions?.length} transactions
            </div>
          </div>

          <TransactionList transactions={filteredTransactions ?? []} />
        </div>
      </div>
    </Layout>
  );
}