"use client";

import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/shared/Badge";
import { Modal } from "@/components/shared/Modal";
import { LoadingSpinner } from "@/components/shared/LoadingSpenner";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  Eye,
  Filter,
  Search
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { EmptyState } from "@/components/shared/EmptyStats";

export default function AdminTopupRequestsPage() {
  const { 
    topupRequests, 
    isLoadingTopupRequests, 
    approveTopup, 
    rejectTopup,
    approveTopupMutation,
    rejectTopupMutation
  } = useAdmin();
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [notes, setNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  const handleAction = async () => {
    if (!selectedRequest) return;

    try {
      if (actionType === "approve") {
        await approveTopup({ id: selectedRequest.id, notes });
        toast.success("Topup request approved successfully");
      } else {
        if (!notes.trim()) {
          toast.error("Please provide rejection reason");
          return;
        }
        await rejectTopup({ id: selectedRequest.id, notes });
        toast.success("Topup request rejected");
      }
      setActionModalOpen(false);
      setSelectedRequest(null);
      setNotes("");
    } catch (error: any) {
      toast.error(error.message || "Failed to process request");
    }
  };

  const openActionModal = (request: any, type: "approve" | "reject") => {
    setSelectedRequest(request);
    setActionType(type);
    setNotes("");
    setActionModalOpen(true);
  };

  const filteredRequests = topupRequests
    .filter(r => filterStatus === "all" || r.status === filterStatus)
    .filter(r => 
      !searchQuery || 
      r.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.transaction_id.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const stats = {
    pending: topupRequests.filter(r => r.status === "pending").length,
    approved: topupRequests.filter(r => r.status === "approved").length,
    rejected: topupRequests.filter(r => r.status === "rejected").length,
    total: topupRequests.reduce((acc, r) => acc + r.amount, 0),
  };

  if (isLoadingTopupRequests) {
    return (
      <Layout showSidebar={true}>
        <LoadingSpinner size="lg" text="Loading topup requests..." />
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Topup Requests</h1>
          <p className="text-gray-400">Review and process user topup requests</p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-yellow-400" />
              <span className="text-sm text-gray-400">Pending</span>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
          </div>

          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-sm text-gray-400">Approved</span>
            </div>
            <p className="text-3xl font-bold text-green-400">{stats.approved}</p>
          </div>

          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="h-5 w-5 text-red-400" />
              <span className="text-sm text-gray-400">Rejected</span>
            </div>
            <p className="text-3xl font-bold text-red-400">{stats.rejected}</p>
          </div>

          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-5 w-5 text-[#00D9B4]" />
              <span className="text-sm text-gray-400">Total Amount</span>
            </div>
            <p className="text-3xl font-bold text-[#00D9B4]">${stats.total.toFixed(2)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 rounded-lg bg-white/5 px-4 text-sm text-white border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] transition-all"
            >
              <option value="all" className="bg-[#0A1628]">All Requests</option>
              <option value="pending" className="bg-[#0A1628]">Pending</option>
              <option value="approved" className="bg-[#0A1628]">Approved</option>
              <option value="rejected" className="bg-[#0A1628]">Rejected</option>
            </select>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user or transaction ID..."
              className="h-10 w-full rounded-lg bg-white/5 pl-12 pr-4 text-sm text-white placeholder-gray-400 border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] transition-all"
            />
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="No Topup Requests"
            description="There are no topup requests matching your filters"
          />
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-2xl bg-white/5 p-6 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00D9B4]/10 border border-[#00D9B4]/30">
                      <DollarSign className="h-6 w-6 text-[#00D9B4]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        {request.user?.name}
                      </h3>
                      <p className="text-sm text-gray-400">{request.user?.email}</p>
                    </div>
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
                    {request.status === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                    {request.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                    {request.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                    {request.status}
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Amount</p>
                    <p className="text-xl font-bold text-[#00D9B4]">
                      ${request.amount.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Transaction ID</p>
                    <p className="text-sm font-medium text-white truncate">
                      {request.transaction_id}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Submitted</p>
                    <p className="text-sm font-medium text-white">
                      {formatDateTime(request.created_at)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Screenshot</p>
                    <p className="text-sm font-medium text-white">
                      {request.screenshot_url ? "Available" : "Not provided"}
                    </p>
                  </div>
                </div>

                {request.review_notes && (
                  <div className="mb-4 rounded-lg bg-white/5 p-3 border border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Admin Notes</p>
                    <p className="text-sm text-white">{request.review_notes}</p>
                  </div>
                )}

                {request.status === "pending" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => openActionModal(request, "approve")}
                      disabled={approveTopupMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-green-500 font-semibold text-white transition-all hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => openActionModal(request, "reject")}
                      disabled={rejectTopupMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-red-500 font-semibold text-white transition-all hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                    {request.screenshot_url && (
                      <button className="flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-white/5 font-medium text-white transition-all hover:bg-white/10 border border-white/10">
                        <Eye className="h-4 w-4" />
                        View Screenshot
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Modal */}
      <Modal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        title={actionType === "approve" ? "Approve Topup Request" : "Reject Topup Request"}
        size="md"
      >
        <div className="space-y-4">
          {selectedRequest && (
            <>
              <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">User</p>
                    <p className="font-medium text-white">{selectedRequest.user?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Amount</p>
                    <p className="font-medium text-[#00D9B4]">${selectedRequest.amount.toFixed(2)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400">Transaction ID</p>
                    <p className="font-medium text-white">{selectedRequest.transaction_id}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-200">
                  {actionType === "approve" ? "Notes (Optional)" : "Rejection Reason"}
                  {actionType === "reject" && <span className="text-red-400">*</span>}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={actionType === "approve" ? "Add any notes..." : "Please provide a reason for rejection"}
                  rows={3}
                  className="w-full rounded-lg bg-white/5 px-4 py-3 text-white placeholder-gray-400 border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] transition-all resize-none"
                />
              </div>

              <div className={`rounded-lg p-4 ${
                actionType === "approve" 
                  ? "bg-green-500/10 border border-green-500/30" 
                  : "bg-red-500/10 border border-red-500/30"
              }`}>
                <p className={`text-sm ${actionType === "approve" ? "text-green-400" : "text-red-400"}`}>
                  {actionType === "approve" 
                    ? "The amount will be added to the user's wallet immediately."
                    : "This action cannot be undone. The user will be notified of the rejection."}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setActionModalOpen(false)}
                  className="flex-1 h-12 rounded-lg bg-white/5 font-medium text-white transition-all hover:bg-white/10 border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={approveTopupMutation.isPending || rejectTopupMutation.isPending}
                  className={`flex-1 h-12 rounded-lg font-semibold text-white transition-all ${
                    actionType === "approve"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {(approveTopupMutation.isPending || rejectTopupMutation.isPending) 
                    ? "Processing..." 
                    : actionType === "approve" 
                    ? "Approve" 
                    : "Reject"}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </Layout>
  );
}