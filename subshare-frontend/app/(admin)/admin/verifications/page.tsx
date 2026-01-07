"use client";

import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/shared/Badge";
import { Modal } from "@/components/shared/Modal";
import { LoadingSpinner } from "@/components/shared/LoadingSpenner";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";
import { CheckCircle, XCircle, FileCheck, Eye, EyeOff } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { EmptyState } from "@/components/shared/EmptyStats";

export default function AdminVerificationsPage() {
  const { 
    pendingVerifications, 
    isLoadingVerifications, 
    verifySubscription,
    verifySubscriptionMutation
  } = useAdmin();
  const { toast } = useToast();
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [verificationNote, setVerificationNote] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleVerify = async (approve: boolean) => {
    if (!selectedSubscription) return;

    try {
      await verifySubscription({
        id: selectedSubscription.id,
        is_verified: approve,
        verification_note: verificationNote || undefined,
      });
      toast.success(approve ? "Subscription approved!" : "Subscription rejected");
      setVerificationModalOpen(false);
      setSelectedSubscription(null);
      setVerificationNote("");
    } catch (error: any) {
      toast.error(error.message || "Failed to process verification");
    }
  };

  const openVerificationModal = (subscription: any) => {
    setSelectedSubscription(subscription);
    setVerificationNote("");
    setShowPassword(false);
    setVerificationModalOpen(true);
  };

  if (isLoadingVerifications) {
    return (
      <Layout showSidebar={true}>
        <LoadingSpinner size="lg" text="Loading verifications..." />
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Subscription Verifications</h1>
          <p className="text-gray-400">Review and verify shared subscriptions</p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <FileCheck className="h-5 w-5 text-yellow-400" />
              <span className="text-sm text-gray-400">Pending Verification</span>
            </div>
            <p className="text-3xl font-bold text-yellow-400">
              {pendingVerifications.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-sm text-gray-400">Total Value</span>
            </div>
            <p className="text-3xl font-bold text-green-400">
              ${pendingVerifications.reduce((acc, sub) => acc + (sub.price_per_hour * 24 * 30), 0).toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-gray-400">Avg. Price/Day</span>
            </div>
            <p className="text-3xl font-bold text-[#00D9B4]">
              ${pendingVerifications.length > 0 
                ? (pendingVerifications.reduce((acc, sub) => acc + (sub.price_per_hour * 24), 0) / pendingVerifications.length).toFixed(2)
                : "0.00"}
            </p>
          </div>
        </div>

        {/* Verifications List */}
        {pendingVerifications.length === 0 ? (
          <EmptyState
            icon={FileCheck}
            title="No Pending Verifications"
            description="All subscription shares have been verified"
          />
        ) : (
          <div className="space-y-4">
            {pendingVerifications.map((subscription) => (
              <div
                key={subscription.id}
                className="rounded-2xl bg-white/5 p-6 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-primary text-2xl font-bold text-[#0A1628]">
                      {subscription.platform?.name?.charAt(0) || "S"}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {subscription.platform?.name || "Platform"}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Shared by: {subscription.shared_by || "Unknown User"}
                      </p>
                    </div>
                  </div>

                  <Badge variant="warning">
                    <FileCheck className="h-3 w-3 mr-1" />
                    Pending Verification
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Price per Hour</p>
                    <p className="text-lg font-bold text-[#00D9B4]">
                      ${subscription.price_per_hour.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Daily Price</p>
                    <p className="text-lg font-bold text-white">
                      ${(subscription.price_per_hour * 24).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Monthly Estimate</p>
                    <p className="text-lg font-bold text-white">
                      ${(subscription.price_per_hour * 24 * 30).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Submitted</p>
                    <p className="text-sm font-medium text-white">
                      {formatDateTime(subscription.created_at)}
                    </p>
                  </div>
                </div>

                {subscription.expires_at && (
                  <div className="mb-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3">
                    <p className="text-sm text-yellow-400">
                      <strong>Expiration:</strong> {formatDateTime(subscription.expires_at)}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => openVerificationModal(subscription)}
                    className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-gradient-primary font-semibold text-[#0A1628] transition-all hover:shadow-glow-primary hover:scale-105"
                  >
                    <Eye className="h-4 w-4" />
                    Review & Verify
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verification Modal */}
      <Modal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        title="Verify Subscription"
        size="lg"
      >
        {selectedSubscription && (
          <div className="space-y-6">
            {/* Subscription Details */}
            <div className="rounded-lg bg-white/5 p-4 border border-white/10">
              <h3 className="font-semibold text-white mb-3">Subscription Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Platform</p>
                  <p className="font-medium text-white">{selectedSubscription.platform?.name}</p>
                </div>
                <div>
                  <p className="text-gray-400">Price per Hour</p>
                  <p className="font-medium text-[#00D9B4]">${selectedSubscription.price_per_hour}/hr</p>
                </div>
                <div>
                  <p className="text-gray-400">Daily Price</p>
                  <p className="font-medium text-white">${(selectedSubscription.price_per_hour * 24).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Monthly Estimate</p>
                  <p className="font-medium text-white">${(selectedSubscription.price_per_hour * 24 * 30).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Credentials */}
            <div className="rounded-lg bg-white/5 p-4 border border-white/10">
              <h3 className="font-semibold text-white mb-3">Account Credentials</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-200">Username</label>
                  <input
                    type="text"
                    value={selectedSubscription.credentials_username}
                    readOnly
                    className="h-10 w-full rounded-lg bg-white/5 px-4 text-white border border-white/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-200">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={selectedSubscription.credentials_password}
                      readOnly
                      className="h-10 w-full rounded-lg bg-white/5 px-4 pr-12 text-white border border-white/10"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Notes */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Verification Notes (Optional)
              </label>
              <textarea
                value={verificationNote}
                onChange={(e) => setVerificationNote(e.target.value)}
                placeholder="Add any notes about this verification..."
                rows={3}
                className="w-full rounded-lg bg-white/5 px-4 py-3 text-white placeholder-gray-400 border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] transition-all resize-none"
              />
            </div>

            {/* Verification Checklist */}
            <div className="rounded-lg bg-[#00D9B4]/10 border border-[#00D9B4]/30 p-4">
              <h4 className="font-semibold text-[#00D9B4] mb-2">Verification Checklist</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#00D9B4]">✓</span>
                  <span>Verify credentials are correct and working</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00D9B4]">✓</span>
                  <span>Check if pricing is reasonable</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00D9B4]">✓</span>
                  <span>Ensure subscription is active and not expired</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00D9B4]">✓</span>
                  <span>Confirm user has rights to share this subscription</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleVerify(false)}
                disabled={verifySubscriptionMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-lg bg-red-500 font-semibold text-white transition-all hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="h-5 w-5" />
                Reject
              </button>
              <button
                onClick={() => handleVerify(true)}
                disabled={verifySubscriptionMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-lg bg-green-500 font-semibold text-white transition-all hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="h-5 w-5" />
                Approve
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}