"use client";

import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/shared/Badge";
import { Modal } from "@/components/shared/Modal";
import { LoadingSpinner } from "@/components/shared/LoadingSpenner";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";
import { 
  Users, 
  Search, 
  Filter,
  DollarSign,
  Eye,
  Plus,
  Minus
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/shared/EmptyStats";

export default function AdminUsersPage() {
  const { 
    users, 
    isLoadingUsers, 
    adjustUserBalance,
    adjustUserBalanceMutation
  } = useAdmin();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract">("add");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const handleAdjustBalance = async () => {
    if (!selectedUser || !amount) {
      toast.error("Please enter an amount");
      return;
    }

    try {
      await adjustUserBalance({
        id: selectedUser.id,
        amount: parseFloat(amount),
        // type: adjustmentType,
        notes: notes ?? "",
      });
      toast.success(`Balance ${adjustmentType === "add" ? "added" : "deducted"} successfully`);
      setBalanceModalOpen(false);
      setSelectedUser(null);
      setAmount("");
      setNotes("");
    } catch (error: any) {
      toast.error(error.message || "Failed to adjust balance");
    }
  };

  const openBalanceModal = (user: any, type: "add" | "subtract") => {
    setSelectedUser(user);
    setAdjustmentType(type);
    setAmount("");
    setNotes("");
    setBalanceModalOpen(true);
  };

  const filteredUsers = users?.filter(u => roleFilter === "all" || u.role === roleFilter)
    .filter(u => 
      !searchQuery || 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const stats = {
    totalUsers: users?.length || 0,
    admins: users?.filter(u => u.role === "admin").length || 0,
    regularUsers: users?.filter(u => u.role === "user").length || 0,
    totalBalance: users?.reduce((acc, u) => acc + u.balance, 0) || 0,
  };

  if (isLoadingUsers) {
    return (
      <Layout showSidebar={true}>
        <LoadingSpinner size="lg" text="Loading users..." />
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-400">Manage platform users and their accounts</p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 text-[#00D9B4]" />
              <span className="text-sm text-gray-400">Total Users</span>
            </div>
            <p className="text-3xl font-bold text-[#00D9B4]">{stats.totalUsers}</p>
          </div>

          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 text-purple-400" />
              <span className="text-sm text-gray-400">Admins</span>
            </div>
            <p className="text-3xl font-bold text-purple-400">{stats.admins}</p>
          </div>

          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-gray-400">Regular Users</span>
            </div>
            <p className="text-3xl font-bold text-blue-400">{stats.regularUsers}</p>
          </div>

          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              <span className="text-sm text-gray-400">Total Balance</span>
            </div>
            <p className="text-3xl font-bold text-green-400">
              ${stats.totalBalance.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 rounded-lg bg-white/5 px-4 text-sm text-white border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] transition-all"
            >
              <option value="all" className="bg-[#0A1628]">All Roles</option>
              <option value="user" className="bg-[#0A1628]">Users</option>
              <option value="admin" className="bg-[#0A1628]">Admins</option>
            </select>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="h-10 w-full rounded-lg bg-white/5 pl-12 pr-4 text-sm text-white placeholder-gray-400 border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] transition-all"
            />
          </div>
        </div>

        {/* Users List */}
        {filteredUsers?.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Users Found"
            description="No users match your search criteria"
          />
        ) : (
          <div className="space-y-4">
            {filteredUsers?.map((user) => (
              <div
                key={user.id}
                className="rounded-2xl bg-white/5 p-6 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary text-xl font-bold text-[#0A1628]">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">{user.name}</h3>
                        <Badge variant={user.role === "admin" ? "info" : "default"}>
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openBalanceModal(user, "add")}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/20 text-green-400 transition-colors hover:bg-green-500/30 border border-green-500/30"
                      title="Add Balance"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => openBalanceModal(user, "subtract")}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/20 text-red-400 transition-colors hover:bg-red-500/30 border border-red-500/30"
                      title="Deduct Balance"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-gray-400 transition-colors hover:bg-white/10 border border-white/10">
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">User ID</p>
                    <p className="font-medium text-white">#{user.id}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Balance</p>
                    <p className="text-lg font-bold text-[#00D9B4]">
                      ${user.balance.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Member Since</p>
                    <p className="font-medium text-white">
                      {formatDate(user.created_at)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Last Updated</p>
                    <p className="font-medium text-white">
                      {formatDate(user.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Adjust Balance Modal */}
      <Modal
        isOpen={balanceModalOpen}
        onClose={() => setBalanceModalOpen(false)}
        title={adjustmentType === "add" ? "Add Balance" : "Deduct Balance"}
        size="md"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="rounded-lg bg-white/5 p-4 border border-white/10">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400">User</p>
                  <p className="font-medium text-white">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-gray-400">Current Balance</p>
                  <p className="font-medium text-[#00D9B4]">
                    ${selectedUser.balance.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Amount (USD) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-12 w-full rounded-lg bg-white/5 pl-12 pr-4 text-white placeholder-gray-400 border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a reason for this adjustment..."
                rows={3}
                className="w-full rounded-lg bg-white/5 px-4 py-3 text-white placeholder-gray-400 border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] transition-all resize-none"
              />
            </div>

            {amount && (
              <div className="rounded-lg bg-[#00D9B4]/10 border border-[#00D9B4]/30 p-4">
                <p className="text-sm text-[#00D9B4]">
                  New balance will be:{" "}
                  <strong>
                    ${(
                      adjustmentType === "add"
                        ? selectedUser.balance + parseFloat(amount)
                        : selectedUser.balance - parseFloat(amount)
                    ).toFixed(2)}
                  </strong>
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setBalanceModalOpen(false)}
                className="flex-1 h-12 rounded-lg bg-white/5 font-medium text-white transition-all hover:bg-white/10 border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustBalance}
                disabled={adjustUserBalanceMutation.isPending || !amount}
                className={`flex-1 h-12 rounded-lg font-semibold text-white transition-all ${
                  adjustmentType === "add"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {adjustUserBalanceMutation.isPending
                  ? "Processing..."
                  : adjustmentType === "add"
                  ? "Add Balance"
                  : "Deduct Balance"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}