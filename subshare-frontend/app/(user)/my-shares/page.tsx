"use client";

import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/shared/Badge";
import { Modal } from "@/components/shared/Modal";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  DollarSign,
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  Share2
} from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import { useSubscriptions } from "@/hooks/useSubscription";
import { LoadingSpinner } from "@/components/shared/LoadingSpenner";
import { EmptyState } from "@/components/shared/EmptyStats";
import { SharedSubscription } from "@/types";

export default function MySharesPage() {
  const { sharedSubscriptions, isLoadingSharedSubscriptions, deleteSubscription } = useSubscriptions();
  const { toast } = useToast();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({});

  const handleDelete = async () => {
    if (!selectedSubscription) return;

    try {
      await deleteSubscription(selectedSubscription.id);
      toast.success("Subscription deleted successfully");
      setDeleteModalOpen(false);
      setSelectedSubscription(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete subscription");
    }
  };

  const togglePassword = (id: number) => {
    setShowPassword((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoadingSharedSubscriptions) {
    return (
      <Layout showSidebar={true}>
        <LoadingSpinner size="lg" text="Loading your shares..." />
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Shares</h1>
            <p className="text-gray-400">
              Manage your shared subscriptions and earnings
            </p>
          </div>
          <Link
            href="/share-subscription"
            className="flex items-center gap-2 rounded-lg gradient-primary px-6 py-3 font-semibold text-[#0A1628] transition-all hover:shadow-glow-primary hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            Share New
          </Link>
        </div>

        {/* Stats */}
        {sharedSubscriptions.length > 0 && (
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00D9B4]/10 border border-[#00D9B4]/30">
                  <Share2 className="h-5 w-5 text-[#00D9B4]" />
                </div>
                <span className="text-sm text-gray-400">Total Shares</span>
              </div>
              <p className="text-3xl font-bold text-white">{sharedSubscriptions.length}</p>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <span className="text-sm text-gray-400">Active Users</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {sharedSubscriptions.reduce((acc: number, sub: any) => acc + sub.total_shares_count, 0)}
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 border border-green-500/30">
                  <DollarSign className="h-5 w-5 text-green-400" />
                </div>
                <span className="text-sm text-gray-400">Total Earnings</span>
              </div>
              <p className="text-3xl font-bold text-white">
                ${sharedSubscriptions.reduce((acc: number, sub: any) => acc + (sub.total_shares_count * sub.price_per_hour * 24), 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Subscriptions List */}
        {sharedSubscriptions.length === 0 ? (
          <EmptyState
            icon={Share2}
            title="No Shared Subscriptions"
            description="You haven't shared any subscriptions yet. Start sharing to earn money!"
            action={{
              label: "Share Subscription",
              onClick: () => window.location.href = "/share-subscription",
            }}
          />
        ) : (
          <div className="space-y-4">
            {sharedSubscriptions.map((subscription: SharedSubscription) => (
              <div
                key={subscription.id}
                className="rounded-2xl bg-white/5 p-6 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl gradient-primary text-2xl font-bold text-[#0A1628]">
                      {subscription.platform?.name?.charAt(0) || "S"}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {subscription.platform?.name || "Platform"}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={subscription.is_verified ? "success" : "warning"}
                        >
                          {subscription.is_verified ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </>
                          )}
                        </Badge>
                        <Badge variant={subscription.status ? "success" : "error"}>
                          {subscription.status ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/my-shares/${subscription.id}/edit`}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-[#00D9B4] border border-white/10"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedSubscription(subscription);
                        setDeleteModalOpen(true);
                      }}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-gray-400 transition-colors hover:bg-red-500/20 hover:text-red-400 border border-white/10"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Username</p>
                    <p className="font-medium text-white">{subscription.credentials_username}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Password</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">
                        {showPassword[subscription.id]
                          ? subscription.credentials_password
                          : "••••••••"}
                      </p>
                      <button
                        onClick={() => togglePassword(subscription.id)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword[subscription.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Price</p>
                    <p className="font-medium text-[#00D9B4]">
                      ${subscription.price_per_hour}/hour
                    </p>
                    <p className="text-xs text-gray-500">
                      ${(subscription.price_per_hour * 24).toFixed(2)}/day
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Active Users</p>
                    <p className="font-medium text-white">
                      {subscription.total_shares_count} users
                    </p>
                    <p className="text-xs text-gray-500">
                      Earning: ${(subscription.total_shares_count * subscription.price_per_hour * 24).toFixed(2)}/day
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      Created: {formatDateTime(subscription.created_at)}
                    </span>
                    {subscription.expires_at && (
                      <span className="text-gray-400">
                        Expires: {formatDateTime(subscription.expires_at)}
                      </span>
                    )}
                  </div>
                  {subscription.verification_note && (
                    <p className="mt-2 text-sm text-yellow-400">
                      Note: {subscription.verification_note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Subscription"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete this subscription? This action cannot be undone.
          </p>
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
            <p className="text-sm text-red-400">
              All active users will lose access to this subscription immediately.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1 h-12 rounded-lg bg-white/5 font-medium text-white transition-all hover:bg-white/10 border border-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 h-12 rounded-lg bg-red-500 font-semibold text-white transition-all hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}