"use client";

import { Layout } from "@/components/layout/Layout";
import { WalletBalance } from "@/components/shared/WalletBalance";
import { TransactionList } from "@/components/shared/TransactionList";
import { Modal } from "@/components/shared/Modal";
import { Badge } from "@/components/shared/Badge";
import { useWallet } from "@/hooks/useWallet";
import { useState } from "react";
import { Download, Filter, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { TopupForm } from "@/components/forms/TopUpForm";
import { TopupRequest, Transaction } from "@/types";

export default function WalletPage() {
  const { 
    transactions, 
    topupRequests, 
    isLoadingTransactions, 
    isLoadingTopupRequests 
  } = useWallet();
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");

  const filteredTransactions = filterType === "all" 
    ? transactions 
    : transactions.filter((t: Transaction) => t.transaction_type === filterType);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-400" />;
    }
  };

  return (
    <Layout showSidebar={true}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Wallet</h1>
            <p className="text-gray-400">Manage your funds and transactions</p>
          </div>
          <button
            onClick={() => setShowTopupModal(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-primary px-6 py-3 font-semibold text-[#0A1628] transition-all hover:shadow-glow-primary hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            Add Funds
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Transactions */}
            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Transaction History</h2>
                <div className="flex items-center gap-3">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="h-10 rounded-lg bg-white/5 px-4 text-sm text-white border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] transition-all"
                  >
                    <option value="all" className="bg-[#0A1628]">All Transactions</option>
                    <option value="topup" className="bg-[#0A1628]">Top Up</option>
                    <option value="purchase" className="bg-[#0A1628]">Purchase</option>
                    <option value="earning" className="bg-[#0A1628]">Earning</option>
                    <option value="refund" className="bg-[#0A1628]">Refund</option>
                  </select>
                  <button className="flex h-10 items-center gap-2 rounded-lg bg-white/5 px-4 text-sm font-medium text-white transition-all hover:bg-white/10 border border-white/10">
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>
              <TransactionList
                transactions={filteredTransactions}
                isLoading={isLoadingTransactions}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet Balance Card */}
            <WalletBalance 
              showAddButton={false}
            />

            {/* Topup Requests */}
            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Topup Requests</h2>
              
              {isLoadingTopupRequests ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded-lg bg-white/5" />
                  ))}
                </div>
              ) : topupRequests.length > 0 ? (
                <div className="space-y-3">
                  {topupRequests.slice(0, 5).map((request: TopupRequest) => (
                    <div
                      key={request.id}
                      className="rounded-lg bg-white/5 p-4 border border-white/10"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-white">
                            ${request.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDateTime(request.created_at)}
                          </p>
                        </div>
                        <Badge
                          variant={
                            request.status === "approved"
                              ? "success"
                              : request.status === "rejected"
                              ? "error"
                              : "warning"
                          }
                        >
                          <span className="flex items-center gap-1">
                            {getStatusIcon(request.status)}
                            {request.status}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        Ref: {request.transaction_id}
                      </p>
                      {request.review_notes && (
                        <p className="mt-2 text-xs text-gray-400 italic">
                          Note: {request.review_notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Clock className="h-10 w-10 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No pending requests</p>
                </div>
              )}
            </div>

            {/* Payment Info */}
            <div className="rounded-2xl bg-[#00D9B4]/10 p-6 border border-[#00D9B4]/30">
              <h3 className="text-lg font-bold text-[#00D9B4] mb-3">
                Payment Information
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p><strong>Bank:</strong> Example Bank</p>
                <p><strong>Account:</strong> 1234567890</p>
                <p><strong>Routing:</strong> 987654321</p>
                <p><strong>Swift:</strong> EXAMPLEXXX</p>
              </div>
              <p className="mt-4 text-xs text-gray-400">
                Use these details when making a payment. Include your user ID in the reference.
              </p>
            </div>
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