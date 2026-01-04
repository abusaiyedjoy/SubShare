"use client";

import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/shared/Badge";
import { useToast } from "@/hooks/useToast";
import { useState, useEffect } from "react";
import { 
  Key, 
  Copy, 
  Eye, 
  EyeOff, 
  Clock, 
  AlertCircle,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { getRemainingTime, copyToClipboard } from "@/lib/utils";
import { useSubscriptions } from "@/hooks/useSubscription";
import { LoadingSpinner } from "@/components/shared/LoadingSpenner";
import { EmptyState } from "@/components/shared/EmptyStats";
import { Modal } from "@/components/shared/Modal";

export default function MyAccessPage() {
  const { mySubscriptions, isLoadingMySubscriptions, useSubscriptionCredentials } = useSubscriptions();
  const { toast } = useToast();
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [credentialsModalOpen, setCredentialsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remainingTimes, setRemainingTimes] = useState<Record<number, any>>({});

  // Update remaining times every second
  useEffect(() => {
    const interval = setInterval(() => {
      const times: Record<number, any> = {};
      mySubscriptions.forEach((access: any) => {
        times[access.id] = getRemainingTime(access.access_end_time);
      });
      setRemainingTimes(times);
    }, 1000);

    return () => clearInterval(interval);
  }, [mySubscriptions]);

  const handleCopyCredentials = async (text: string, type: string) => {
    try {
      await copyToClipboard(text);
      toast.success(`${type} copied to clipboard!`);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleViewCredentials = (subscription: any) => {
    setSelectedSubscription(subscription);
    setCredentialsModalOpen(true);
    setShowPassword(false);
  };

  // Get credentials query
  const { data: credentialsData } = useSubscriptionCredentials(
    selectedSubscription?.shared_subscription_id || 0,
    credentialsModalOpen && selectedSubscription?.status === "active"
  );

  const activeSubscriptions = mySubscriptions.filter((s: any) => s.status === "active");
  const expiredSubscriptions = mySubscriptions.filter((s: any) => s.status === "expired");

  if (isLoadingMySubscriptions) {
    return (
      <Layout showSidebar={true}>
        <LoadingSpinner size="lg" text="Loading your subscriptions..." />
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Access</h1>
            <p className="text-gray-400">
              View and manage your active subscription access
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg bg-gradient-primary px-6 py-3 font-semibold text-[#0A1628] transition-all hover:shadow-glow-primary hover:scale-105"
          >
            Browse More
          </Link>
        </div>

        {/* Stats */}
        {mySubscriptions.length > 0 && (
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00D9B4]/10 border border-[#00D9B4]/30">
                  <Key className="h-5 w-5 text-[#00D9B4]" />
                </div>
                <span className="text-sm text-gray-400">Active</span>
              </div>
              <p className="text-3xl font-bold text-white">{activeSubscriptions.length}</p>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/30">
                  <Clock className="h-5 w-5 text-red-400" />
                </div>
                <span className="text-sm text-gray-400">Expired</span>
              </div>
              <p className="text-3xl font-bold text-white">{expiredSubscriptions.length}</p>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <CheckCircle className="h-5 w-5 text-blue-400" />
                </div>
                <span className="text-sm text-gray-400">Total Spent</span>
              </div>
              <p className="text-3xl font-bold text-white">
                ${mySubscriptions.reduce((acc: number, s: any) => acc + s.access_price_paid, 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Active Subscriptions */}
        {activeSubscriptions.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Active Subscriptions</h2>
            <div className="space-y-4">
              {activeSubscriptions.map((access: any) => {
                const remaining = remainingTimes[access.id];
                const isExpiringSoon = remaining && remaining.totalSeconds < 24 * 60 * 60; // Less than 24 hours

                return (
                  <div
                    key={access.id}
                    className="rounded-2xl bg-white/5 p-6 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-primary text-2xl font-bold text-[#0A1628]">
                          {access.subscription?.platform?.name?.charAt(0) || "S"}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">
                            {access.subscription?.platform?.name || "Platform"}
                          </h3>
                          <Badge variant="success">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        </div>
                      </div>

                      <button
                        onClick={() => handleViewCredentials(access)}
                        className="flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 font-semibold text-[#0A1628] transition-all hover:shadow-glow-primary hover:scale-105"
                      >
                        <Eye className="h-4 w-4" />
                        View Credentials
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3 mb-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Amount Paid</p>
                        <p className="font-medium text-[#00D9B4]">
                          ${access.access_price_paid.toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-400 mb-1">Access Duration</p>
                        <p className="font-medium text-white">
                          {Math.ceil((new Date(access.access_end_time).getTime() - new Date(access.access_start_time).getTime()) / (1000 * 60 * 60 * 24))} days
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-400 mb-1">Time Remaining</p>
                        {remaining && !remaining.isExpired ? (
                          <p className={`font-medium ${isExpiringSoon ? "text-yellow-400" : "text-white"}`}>
                            {remaining.days}d {remaining.hours}h {remaining.minutes}m {remaining.seconds}s
                          </p>
                        ) : (
                          <p className="font-medium text-red-400">Expired</p>
                        )}
                      </div>
                    </div>

                    {isExpiringSoon && remaining && !remaining.isExpired && (
                      <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3 flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-400">
                          Your access is expiring soon. Consider renewing to continue using this subscription.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Expired Subscriptions */}
        {expiredSubscriptions.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Expired Subscriptions</h2>
            <div className="space-y-4">
              {expiredSubscriptions.map((access: any) => (
                <div
                  key={access.id}
                  className="rounded-2xl bg-white/5 p-6 border border-white/10 opacity-60"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-500/20 text-xl font-bold text-gray-400">
                        {access.subscription?.platform?.name?.charAt(0) || "S"}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-300">
                          {access.subscription?.platform?.name || "Platform"}
                        </h3>
                        <Badge variant="error">Expired</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Paid ${access.access_price_paid.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">
                        Expired on {new Date(access.access_end_time).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {mySubscriptions.length === 0 && (
          <EmptyState
            icon={Key}
            title="No Active Subscriptions"
            description="You don't have any active subscriptions yet. Browse available subscriptions to get started!"
            action={{
              label: "Browse Subscriptions",
              onClick: () => window.location.href = "/",
            }}
          />
        )}
      </div>

      {/* Credentials Modal */}
      <Modal
        isOpen={credentialsModalOpen}
        onClose={() => setCredentialsModalOpen(false)}
        title="Subscription Credentials"
        size="md"
      >
        {credentialsData?.data ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-[#00D9B4]/10 border border-[#00D9B4]/30 p-4">
              <p className="text-sm text-[#00D9B4] mb-2">
                <strong>Platform:</strong> {selectedSubscription?.subscription?.platform?.name}
              </p>
              <p className="text-sm text-[#00D9B4]">
                <strong>Access until:</strong> {new Date(credentialsData.data.access_end_time).toLocaleString()}
              </p>
            </div>

            {/* Username */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Username
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={credentialsData.data.username}
                  readOnly
                  className="h-12 flex-1 rounded-lg bg-white/5 px-4 text-white border border-white/10"
                />
                <button
                  onClick={() => handleCopyCredentials(credentialsData.data.username, "Username")}
                  className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-[#00D9B4] border border-white/10"
                >
                  <Copy className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Password
              </label>
              <div className="flex items-center gap-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={credentialsData.data.password}
                  readOnly
                  className="h-12 flex-1 rounded-lg bg-white/5 px-4 text-white border border-white/10"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white border border-white/10"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => handleCopyCredentials(credentialsData.data.password, "Password")}
                  className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-[#00D9B4] border border-white/10"
                >
                  <Copy className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-4">
              <p className="text-sm text-yellow-400">
                <strong>Important:</strong> Do not change the password or account settings. If you experience any issues, please report them.
              </p>
            </div>
          </div>
        ) : (
          <LoadingSpinner size="md" text="Loading credentials..." />
        )}
      </Modal>
    </Layout>
  );
}