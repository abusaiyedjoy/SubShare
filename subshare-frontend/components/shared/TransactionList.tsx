"use client";

import { ArrowUpRight, ArrowDownRight, DollarSign, RefreshCw } from "lucide-react";
import { formatDateTime, getStatusColor, getTransactionTypeLabel } from "@/lib/utils";
import type { Transaction } from "@/types";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export function TransactionList({ transactions, isLoading }: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-lg bg-white/5 border border-white/10"
          />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/20 bg-white/5 p-12 text-center">
        <DollarSign className="mx-auto h-12 w-12 text-gray-600 mb-3" />
        <p className="text-gray-400">No transactions yet</p>
      </div>
    );
  }

  const getTransactionIcon = (type: string) => {
    const icons: Record<string, any> = {
      topup: ArrowDownRight,
      purchase: ArrowUpRight,
      earning: ArrowDownRight,
      refund: ArrowDownRight,
      commission: ArrowUpRight,
    };
    return icons[type.toLowerCase()] || DollarSign;
  };

  const isIncoming = (type: string) => {
    return ["topup", "earning", "refund"].includes(type.toLowerCase());
  };

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => {
        const Icon = getTransactionIcon(transaction.transaction_type);
        const incoming = isIncoming(transaction.transaction_type);
        const statusColors = getStatusColor(transaction.status);

        return (
          <div
            key={transaction.id}
            className="flex items-center justify-between rounded-lg bg-white/5 p-4 border border-white/10 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  incoming ? "bg-green-500/20" : "bg-red-500/20"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    incoming ? "text-green-400" : "text-red-400"
                  }`}
                />
              </div>

              <div>
                <p className="font-medium text-white">
                  {getTransactionTypeLabel(transaction.transaction_type)}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDateTime(transaction.created_at)}
                </p>
                {transaction.notes && (
                  <p className="text-xs text-gray-500 mt-1">{transaction.notes}</p>
                )}
              </div>
            </div>

            <div className="text-right">
              <p
                className={`font-semibold ${
                  incoming ? "text-green-400" : "text-red-400"
                }`}
              >
                {incoming ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
              </p>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors.bg} ${statusColors.text}`}
                >
                  {transaction.status}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}