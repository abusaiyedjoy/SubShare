"use client";

import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/shared/Badge";
import { Modal } from "@/components/shared/Modal";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";
import { AlertCircle, CheckCircle, XCircle, Filter, Search } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpenner";
import { EmptyState } from "@/components/shared/EmptyStats";

export default function AdminReportsPage() {
  const { 
    reports, 
    isLoadingReports, 
    resolveReport,
    resolveReportMutation
  } = useAdmin();
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolutionType, setResolutionType] = useState<"resolved" | "dismissed">("resolved");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  const handleResolve = async () => {
    if (!selectedReport) return;

    try {
      await resolveReport({
        id: selectedReport.id,
        status: resolutionType,
        resolution_notes: resolutionNotes || undefined,
      });
      toast.success(`Report ${resolutionType === "resolved" ? "resolved" : "dismissed"} successfully`);
      setResolveModalOpen(false);
      setSelectedReport(null);
      setResolutionNotes("");
    } catch (error: any) {
      toast.error(error.message || "Failed to resolve report");
    }
  };

  const openResolveModal = (report: any, type: "resolved" | "dismissed") => {
    setSelectedReport(report);
    setResolutionType(type);
    setResolutionNotes("");
    setResolveModalOpen(true);
  };

  const filteredReports = reports
    .filter(r => filterStatus === "all" || r.status === filterStatus)
    .filter(r => !searchQuery || r.reason.toLowerCase().includes(searchQuery.toLowerCase()));

  const stats = {
    pending: reports.filter(r => r.status === "pending").length,
    resolved: reports.filter(r => r.status === "resolved").length,
    dismissed: reports.filter(r => r.status === "dismissed").length,
  };

  if (isLoadingReports) {
    return (
      <Layout showSidebar={true}>
        <LoadingSpinner size="lg" text="Loading reports..." />
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Reports Management</h1>
          <p className="text-gray-400">Review and resolve user-reported issues</p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <span className="text-sm text-gray-400">Pending</span>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
          </div>

          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-sm text-gray-400">Resolved</span>
            </div>
            <p className="text-3xl font-bold text-green-400">{stats.resolved}</p>
          </div>

          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-400">Dismissed</span>
            </div>
            <p className="text-3xl font-bold text-gray-400">{stats.dismissed}</p>
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
              <option value="all" className="bg-[#0A1628]">All Reports</option>
              <option value="pending" className="bg-[#0A1628]">Pending</option>
              <option value="resolved" className="bg-[#0A1628]">Resolved</option>
              <option value="dismissed" className="bg-[#0A1628]">Dismissed</option>
            </select>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports..."
              className="h-10 w-full rounded-lg bg-white/5 pl-12 pr-4 text-sm text-white placeholder-gray-400 border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] transition-all"
            />
          </div>
        </div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <EmptyState
            icon={AlertCircle}
            title="No Reports"
            description="There are no reports matching your filters"
          />
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="rounded-2xl bg-white/5 p-6 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30">
                      <AlertCircle className="h-6 w-6 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-white">
                          Report #{report.id}
                        </h3>
                        <Badge
                          variant={
                            report.status === "resolved"
                              ? "success"
                              : report.status === "dismissed"
                              ? "default"
                              : "warning"
                          }
                        >
                          {report.status === "resolved" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {report.status === "dismissed" && <XCircle className="h-3 w-3 mr-1" />}
                          {report.status === "pending" && <AlertCircle className="h-3 w-3 mr-1" />}
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">
                        Reported by: User #{report.reported_by_user_id} • {formatDateTime(report.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                    <p className="text-sm text-gray-400 mb-2">Subscription Details</p>
                    <p className="text-white font-medium mb-1">
                      Subscription ID: #{report.shared_subscription_id}
                    </p>
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-sm text-gray-400 mb-2">Report Reason</p>
                      <p className="text-white">{report.reason}</p>
                    </div>
                  </div>
                </div>

                {report.resolution_notes && (
                  <div className="mb-4 rounded-lg bg-white/5 p-4 border border-white/10">
                    <p className="text-sm text-gray-400 mb-2">Resolution Notes</p>
                    <p className="text-white">{report.resolution_notes}</p>
                    {report.resolved_by_admin_id && (
                      <p className="text-xs text-gray-500 mt-2">
                        Resolved by Admin #{report.resolved_by_admin_id}
                      </p>
                    )}
                  </div>
                )}

                {report.status === "pending" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => openResolveModal(report, "resolved")}
                      disabled={resolveReportMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-green-500 font-semibold text-white transition-all hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark as Resolved
                    </button>
                    <button
                      onClick={() => openResolveModal(report, "dismissed")}
                      disabled={resolveReportMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-white/5 font-medium text-white transition-all hover:bg-white/10 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="h-4 w-4" />
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title={resolutionType === "resolved" ? "Resolve Report" : "Dismiss Report"}
        size="md"
      >
        {selectedReport && (
          <div className="space-y-4">
            <div className="rounded-lg bg-white/5 p-4 border border-white/10">
              <div className="text-sm space-y-2">
                <div>
                  <p className="text-gray-400">Report ID</p>
                  <p className="font-medium text-white">#{selectedReport.id}</p>
                </div>
                <div>
                  <p className="text-gray-400">Reported Subscription</p>
                  <p className="font-medium text-white">#{selectedReport.shared_subscription_id}</p>
                </div>
                <div>
                  <p className="text-gray-400">Reason</p>
                  <p className="font-medium text-white">{selectedReport.reason}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Resolution Notes
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Add notes about how this was resolved..."
                rows={4}
                className="w-full rounded-lg bg-white/5 px-4 py-3 text-white placeholder-gray-400 border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] transition-all resize-none"
              />
            </div>

            <div className={`rounded-lg p-4 ${
              resolutionType === "resolved" 
                ? "bg-green-500/10 border border-green-500/30" 
                : "bg-gray-500/10 border border-gray-500/30"
            }`}>
              <p className={`text-sm ${resolutionType === "resolved" ? "text-green-400" : "text-gray-400"}`}>
                {resolutionType === "resolved" 
                  ? "This will mark the report as resolved. Make sure the issue has been addressed."
                  : "This will dismiss the report. Use this if the report is invalid or not actionable."}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setResolveModalOpen(false)}
                className="flex-1 h-12 rounded-lg bg-white/5 font-medium text-white transition-all hover:bg-white/10 border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={resolveReportMutation.isPending}
                className={`flex-1 h-12 rounded-lg font-semibold text-white transition-all ${
                  resolutionType === "resolved"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gray-600 hover:bg-gray-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {resolveReportMutation.isPending 
                  ? "Processing..." 
                  : resolutionType === "resolved" 
                  ? "Resolve" 
                  : "Dismiss"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}