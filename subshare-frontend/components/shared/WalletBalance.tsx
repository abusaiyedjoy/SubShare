"use client";

import { Wallet, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface WalletBalanceProps {
  showAddButton?: boolean;
  onAddClick?: () => void;
}

export function WalletBalance({ showAddButton = true, onAddClick }: WalletBalanceProps) {
  const { user } = useAuthStore();
  const balance = user?.balance || 0;

  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#00D9B4] to-[#00A68A] p-6 shadow-glow-primary-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-white/80">Total Balance</p>
            <h2 className="text-3xl font-bold text-white">${balance.toFixed(2)}</h2>
          </div>
        </div>

        {showAddButton && onAddClick && (
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/30"
          >
            <Plus className="h-4 w-4" />
            Add Funds
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-white" />
            <span className="text-xs text-white/80">This Month</span>
          </div>
          <p className="text-lg font-bold text-white">$0.00</p>
        </div>

        <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-white" />
            <span className="text-xs text-white/80">Spent</span>
          </div>
          <p className="text-lg font-bold text-white">$0.00</p>
        </div>
      </div>
    </div>
  );
}